using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using ChineseLearning.Api.Middleware;
using ChineseLearning.Api.Options;
using ChineseLearning.Application;
using ChineseLearning.Infrastructure;
using ChineseLearning.Infrastructure.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddJsonConsole(options => options.IncludeScopes = true);

builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddSingleton<IValidateOptions<OpenAIOptions>, OpenAIOptionsValidator>();
builder.Services.AddOptions<OpenAIOptions>()
    .Bind(builder.Configuration.GetSection(OpenAIOptions.SectionName))
    .ValidateOnStart();

builder.Services.AddSingleton<IValidateOptions<DatabaseOptions>, DatabaseOptionsValidator>();
builder.Services.AddOptions<DatabaseOptions>()
    .Bind(builder.Configuration.GetSection(DatabaseOptions.SectionName))
    .ValidateOnStart();

builder.Services.AddSingleton<IValidateOptions<JwtOptions>, JwtOptionsValidator>();
builder.Services.AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection(JwtOptions.SectionName))
    .ValidateOnStart();

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
    ?? new JwtOptions();
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ClockSkew = TimeSpan.FromSeconds(30),
            NameClaimType = JwtRegisteredClaimNames.Email,
            RoleClaimType = ClaimTypes.Role
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var origins = builder.Configuration.GetSection("Frontend:Origins").Get<string[]>()
            ?? ["http://localhost:3000"];
        policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Chinese Learning API",
        Version = "v1",
        Description = "ASP.NET Core 8 backend for Chinese Learning System."
    });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste an access token issued by Chinese Learning API."
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        [new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
        }] = Array.Empty<string>()
    });
});

var app = builder.Build();

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseExceptionHandler();
app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

await EnsureIdentityDatabaseAsync(app);

app.MapGet("/api/v1", (HttpContext context) => Results.Ok(new
{
    name = "Chinese Learning API",
    version = "v1",
    environment = app.Environment.EnvironmentName,
    correlationId = context.TraceIdentifier,
    status = "ready"
})).WithTags("System");

var auth = app.MapGroup("/api/v1/auth").WithTags("Authentication");

auth.MapPost("/register", async (
    RegisterRequest request,
    UserManager<ApplicationUser> userManager,
    IWebHostEnvironment environment) =>
{
    var email = request.Email.Trim().ToLowerInvariant();
    var user = new ApplicationUser
    {
        Id = Guid.NewGuid(),
        UserName = email,
        Email = email,
        DisplayName = request.DisplayName.Trim()
    };

    var result = await userManager.CreateAsync(user, request.Password);
    if (!result.Succeeded)
        return Results.ValidationProblem(ToValidationErrors(result));

    await userManager.AddToRoleAsync(user, "Learner");
    var verificationToken = await userManager.GenerateEmailConfirmationTokenAsync(user);

    return Results.Created($"/api/v1/auth/users/{user.Id}", new
    {
        userId = user.Id,
        user.Email,
        requiresEmailVerification = true,
        verificationToken = environment.IsProduction() ? null : verificationToken
    });
});

auth.MapPost("/login", async (
    LoginRequest request,
    UserManager<ApplicationUser> userManager,
    IdentityDbContext db,
    IOptions<JwtOptions> jwt) =>
{
    var user = await userManager.FindByEmailAsync(request.Email.Trim());
    if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
        return Results.Unauthorized();

    if (await userManager.IsLockedOutAsync(user))
        return Results.Problem("Tài khoản đang bị khóa tạm thời.", statusCode: 423);

    var roles = await userManager.GetRolesAsync(user);
    var tokens = await IssueTokensAsync(user, roles, db, jwt.Value);
    return Results.Ok(tokens);
});

auth.MapPost("/refresh", async (
    RefreshRequest request,
    UserManager<ApplicationUser> userManager,
    IdentityDbContext db,
    IOptions<JwtOptions> jwt) =>
{
    var hash = HashToken(request.RefreshToken);
    var stored = await db.RefreshTokens.Include(x => x.User)
        .SingleOrDefaultAsync(x => x.TokenHash == hash);

    if (stored is null || stored.RevokedAtUtc is not null || stored.ExpiresAtUtc <= DateTime.UtcNow)
        return Results.Unauthorized();

    stored.RevokedAtUtc = DateTime.UtcNow;
    var roles = await userManager.GetRolesAsync(stored.User);
    var tokens = await IssueTokensAsync(stored.User, roles, db, jwt.Value);
    stored.ReplacedByTokenHash = HashToken(tokens.RefreshToken);
    await db.SaveChangesAsync();
    return Results.Ok(tokens);
});

auth.MapPost("/logout", async (RefreshRequest request, IdentityDbContext db) =>
{
    var hash = HashToken(request.RefreshToken);
    var stored = await db.RefreshTokens.SingleOrDefaultAsync(x => x.TokenHash == hash);
    if (stored is not null && stored.RevokedAtUtc is null)
    {
        stored.RevokedAtUtc = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }
    return Results.NoContent();
});

auth.MapPost("/verify-email", async (VerifyEmailRequest request, UserManager<ApplicationUser> userManager) =>
{
    var user = await userManager.FindByIdAsync(request.UserId.ToString());
    if (user is null) return Results.NotFound();
    var result = await userManager.ConfirmEmailAsync(user, request.Token);
    return result.Succeeded ? Results.NoContent() : Results.ValidationProblem(ToValidationErrors(result));
});

auth.MapPost("/forgot-password", async (
    ForgotPasswordRequest request,
    UserManager<ApplicationUser> userManager,
    IWebHostEnvironment environment) =>
{
    var user = await userManager.FindByEmailAsync(request.Email.Trim());
    string? token = null;
    if (user is not null)
        token = await userManager.GeneratePasswordResetTokenAsync(user);

    return Results.Accepted(value: new
    {
        message = "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi.",
        userId = environment.IsProduction() ? null : user?.Id,
        resetToken = environment.IsProduction() ? null : token
    });
});

auth.MapPost("/reset-password", async (
    ResetPasswordRequest request,
    UserManager<ApplicationUser> userManager) =>
{
    var user = await userManager.FindByIdAsync(request.UserId.ToString());
    if (user is null) return Results.BadRequest(new { message = "Yêu cầu đặt lại mật khẩu không hợp lệ." });
    var result = await userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
    return result.Succeeded ? Results.NoContent() : Results.ValidationProblem(ToValidationErrors(result));
});

auth.MapGet("/me", async (ClaimsPrincipal principal, UserManager<ApplicationUser> userManager) =>
{
    var id = principal.FindFirstValue(JwtRegisteredClaimNames.Sub);
    if (!Guid.TryParse(id, out var userId)) return Results.Unauthorized();
    var user = await userManager.FindByIdAsync(userId.ToString());
    if (user is null) return Results.Unauthorized();
    var roles = await userManager.GetRolesAsync(user);
    return Results.Ok(new { id = user.Id, user.Email, user.DisplayName, roles });
}).RequireAuthorization();

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false,
    ResponseWriter = WriteHealthResponse
});
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    ResponseWriter = WriteHealthResponse
});

app.Run();

static async Task EnsureIdentityDatabaseAsync(WebApplication app)
{
    await using var scope = app.Services.CreateAsyncScope();
    var db = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
    await db.Database.EnsureCreatedAsync();

    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
    foreach (var role in new[] { "Learner", "ContentAdmin", "SystemAdmin" })
    {
        if (!await roleManager.RoleExistsAsync(role))
            await roleManager.CreateAsync(new IdentityRole<Guid>(role));
    }
}

static async Task<TokenResponse> IssueTokensAsync(
    ApplicationUser user,
    IList<string> roles,
    IdentityDbContext db,
    JwtOptions options)
{
    var now = DateTime.UtcNow;
    var claims = new List<Claim>
    {
        new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
        new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
        new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };
    claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

    var credentials = new SigningCredentials(
        new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.SigningKey)),
        SecurityAlgorithms.HmacSha256);
    var expires = now.AddMinutes(options.AccessTokenMinutes);
    var jwt = new JwtSecurityToken(options.Issuer, options.Audience, claims, now, expires, credentials);
    var accessToken = new JwtSecurityTokenHandler().WriteToken(jwt);

    var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    db.RefreshTokens.Add(new RefreshToken
    {
        Id = Guid.NewGuid(),
        UserId = user.Id,
        TokenHash = HashToken(refreshToken),
        ExpiresAtUtc = now.AddDays(options.RefreshTokenDays)
    });
    await db.SaveChangesAsync();

    return new TokenResponse(accessToken, refreshToken, expires, "Bearer");
}

static string HashToken(string token) =>
    Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

static Dictionary<string, string[]> ToValidationErrors(IdentityResult result) =>
    result.Errors.GroupBy(x => x.Code).ToDictionary(x => x.Key, x => x.Select(e => e.Description).ToArray());

static Task WriteHealthResponse(HttpContext context, Microsoft.Extensions.Diagnostics.HealthChecks.HealthReport report)
{
    context.Response.ContentType = "application/json";
    return context.Response.WriteAsync(JsonSerializer.Serialize(new
    {
        status = report.Status.ToString(),
        correlationId = context.TraceIdentifier
    }));
}

public sealed record RegisterRequest(string Email, string Password, string DisplayName);
public sealed record LoginRequest(string Email, string Password);
public sealed record RefreshRequest(string RefreshToken);
public sealed record VerifyEmailRequest(Guid UserId, string Token);
public sealed record ForgotPasswordRequest(string Email);
public sealed record ResetPasswordRequest(Guid UserId, string Token, string NewPassword);
public sealed record TokenResponse(string AccessToken, string RefreshToken, DateTime ExpiresAtUtc, string TokenType);

public partial class Program;
