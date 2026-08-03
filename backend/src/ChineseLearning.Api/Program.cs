using System.Security.Claims;
using System.Text.Json;
using ChineseLearning.Api.Middleware;
using ChineseLearning.Api.Options;
using ChineseLearning.Application;
using ChineseLearning.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
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

builder.Services.AddSingleton<IValidateOptions<SupabaseOptions>, SupabaseOptionsValidator>();
builder.Services.AddOptions<SupabaseOptions>()
    .Bind(builder.Configuration.GetSection(SupabaseOptions.SectionName))
    .ValidateOnStart();

builder.Services.AddSingleton<IValidateOptions<DatabaseOptions>, DatabaseOptionsValidator>();
builder.Services.AddOptions<DatabaseOptions>()
    .Bind(builder.Configuration.GetSection(DatabaseOptions.SectionName))
    .ValidateOnStart();

var supabaseOptions = builder.Configuration
    .GetSection(SupabaseOptions.SectionName)
    .Get<SupabaseOptions>() ?? new SupabaseOptions();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = supabaseOptions.JwtIssuer.TrimEnd('/');
        options.RequireHttpsMetadata = true;
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = supabaseOptions.JwtIssuer.TrimEnd('/'),
            ValidateAudience = true,
            ValidAudience = supabaseOptions.JwtAudience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.FromMinutes(1),
            NameClaimType = "email",
            RoleClaimType = "role"
        };
    });

builder.Services.AddAuthorization();

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
        Description = "Paste a Supabase access token."
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        [new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference
            {
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
            }
        }] = Array.Empty<string>()
    });
});

var app = builder.Build();

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/v1", (HttpContext context) => Results.Ok(new
    {
        name = "Chinese Learning API",
        version = "v1",
        environment = app.Environment.EnvironmentName,
        correlationId = context.TraceIdentifier,
        status = "ready"
    }))
    .WithName("GetApiInfo")
    .WithTags("System")
    .Produces(StatusCodes.Status200OK);

app.MapGet("/api/v1/auth/me", (ClaimsPrincipal user) => Results.Ok(new
    {
        id = user.FindFirstValue("sub"),
        email = user.FindFirstValue("email"),
        role = user.FindFirstValue("role"),
        audience = user.FindFirstValue("aud")
    }))
    .RequireAuthorization()
    .WithName("GetCurrentUser")
    .WithTags("Authentication")
    .Produces(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status401Unauthorized);

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

static Task WriteHealthResponse(HttpContext context, Microsoft.Extensions.Diagnostics.HealthChecks.HealthReport report)
{
    context.Response.ContentType = "application/json";
    return context.Response.WriteAsync(JsonSerializer.Serialize(new
    {
        status = report.Status.ToString(),
        correlationId = context.TraceIdentifier
    }));
}

public partial class Program;
