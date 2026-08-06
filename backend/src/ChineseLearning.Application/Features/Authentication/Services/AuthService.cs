using ChineseLearning.Application.Abstractions.Authentication;
using ChineseLearning.Application.Abstractions.Email;
using ChineseLearning.Application.Abstractions.Persistence;
using ChineseLearning.Application.Features.Authentication.DTOs;
using ChineseLearning.Domain.Constants;
using ChineseLearning.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ChineseLearning.Application.Features.Authentication.Services;

public sealed class AuthService(
    UserManager<ApplicationUser> userManager,
    IApplicationDbContext dbContext,
    IJwtTokenService jwtTokenService,
    IEmailService emailService) : IAuthService
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var email = request.Email.Trim().ToLowerInvariant();
            if (await userManager.FindByEmailAsync(email) is not null)
                throw new InvalidOperationException("Email đã được sử dụng.");

            var user = new ApplicationUser { Id = Guid.NewGuid(), UserName = email, Email = email };
            user.SetDisplayName(request.DisplayName);

            EnsureIdentitySucceeded(await userManager.CreateAsync(user, request.Password));
            EnsureIdentitySucceeded(await userManager.AddToRoleAsync(user, Roles.User));

            var verificationToken = await userManager.GenerateEmailConfirmationTokenAsync(user);
            await emailService.SendEmailVerificationAsync(user.Email!, verificationToken, cancellationToken);
            return await IssueTokensAsync(user, cancellationToken);
        }
        catch (Exception ex)
        {
            System.IO.File.WriteAllText("auth_error.log", ex.ToString());
            throw;
        }
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email.Trim())
            ?? throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");
        if (await userManager.IsLockedOutAsync(user))
            throw new UnauthorizedAccessException("Tài khoản đang tạm khóa.");
        if (!await userManager.CheckPasswordAsync(user, request.Password))
        {
            await userManager.AccessFailedAsync(user);
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");
        }

        await userManager.ResetAccessFailedCountAsync(user);
        user.MarkLogin();
        EnsureIdentitySucceeded(await userManager.UpdateAsync(user));
        return await IssueTokensAsync(user, cancellationToken);
    }

    public async Task<AuthResponse> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        var tokenHash = jwtTokenService.HashToken(request.RefreshToken);
        var storedToken = await dbContext.RefreshTokens.Include(x => x.User)
            .SingleOrDefaultAsync(x => x.TokenHash == tokenHash, cancellationToken)
            ?? throw new UnauthorizedAccessException("Refresh token không hợp lệ.");
        if (!storedToken.IsActive)
            throw new UnauthorizedAccessException("Refresh token đã hết hạn hoặc bị thu hồi.");

        var response = await IssueTokensAsync(storedToken.User, cancellationToken);
        storedToken.Revoke(jwtTokenService.HashToken(response.RefreshToken));
        await dbContext.SaveChangesAsync(cancellationToken);
        return response;
    }

    public async Task LogoutAsync(LogoutRequest request, CancellationToken cancellationToken)
    {
        var tokenHash = jwtTokenService.HashToken(request.RefreshToken);
        var storedToken = await dbContext.RefreshTokens.SingleOrDefaultAsync(x => x.TokenHash == tokenHash, cancellationToken);
        if (storedToken is null || !storedToken.IsActive) return;
        storedToken.Revoke();
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user?.Email is null) return;
        await emailService.SendPasswordResetAsync(user.Email, await userManager.GeneratePasswordResetTokenAsync(user), cancellationToken);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email)
            ?? throw new InvalidOperationException("Yêu cầu đặt lại mật khẩu không hợp lệ.");
        EnsureIdentitySucceeded(await userManager.ResetPasswordAsync(user, request.Token, request.NewPassword));
    }

    public async Task VerifyEmailAsync(VerifyEmailRequest request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(request.UserId, out var userId)) throw new InvalidOperationException("Mã người dùng không hợp lệ.");
        var user = await userManager.FindByIdAsync(userId.ToString())
            ?? throw new InvalidOperationException("Tài khoản không tồn tại.");
        EnsureIdentitySucceeded(await userManager.ConfirmEmailAsync(user, request.Token));
    }

    public async Task<CurrentUserResponse> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(userId.ToString())
            ?? throw new KeyNotFoundException("Không tìm thấy người dùng.");
        var roles = (await userManager.GetRolesAsync(user)).ToArray();
        return MapUser(user, roles);
    }

    private async Task<AuthResponse> IssueTokensAsync(ApplicationUser user, CancellationToken cancellationToken)
    {
        var roles = (await userManager.GetRolesAsync(user)).ToArray();
        var (accessToken, expiresAt) = await jwtTokenService.CreateAccessTokenAsync(user, roles, cancellationToken);
        var refreshToken = jwtTokenService.CreateRefreshToken();
        dbContext.RefreshTokens.Add(new RefreshToken(user.Id, jwtTokenService.HashToken(refreshToken), DateTimeOffset.UtcNow.AddDays(30)));
        await dbContext.SaveChangesAsync(cancellationToken);
        return new AuthResponse(accessToken, refreshToken, expiresAt, MapUser(user, roles));
    }

    private static CurrentUserResponse MapUser(ApplicationUser user, IReadOnlyCollection<string> roles) =>
        new(user.Id, user.Email ?? string.Empty, user.DisplayName, roles);

    private static void EnsureIdentitySucceeded(IdentityResult result)
    {
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(x => x.Description));
            Console.WriteLine("IDENTITY ERROR: " + errors);
            throw new InvalidOperationException(errors);
        }
    }
}
