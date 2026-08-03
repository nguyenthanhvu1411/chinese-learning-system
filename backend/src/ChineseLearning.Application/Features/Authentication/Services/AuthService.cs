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
        var existing = await userManager.FindByEmailAsync(request.Email);
        if (existing is not null)
        {
            throw new InvalidOperationException("Email đã được sử dụng.");
        }

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = request.Email.Trim(),
            Email = request.Email.Trim(),
            DisplayName = request.DisplayName.Trim()
        };

        var result = await userManager.CreateAsync(user, request.Password);
        EnsureIdentitySucceeded(result);
        await userManager.AddToRoleAsync(user, Roles.User);

        var verificationToken = await userManager.GenerateEmailConfirmationTokenAsync(user);
        await emailService.SendEmailVerificationAsync(user.Email!, verificationToken, cancellationToken);

        return await IssueTokensAsync(user, cancellationToken);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email)
            ?? throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

        if (await userManager.IsLockedOutAsync(user))
        {
            throw new UnauthorizedAccessException("Tài khoản đang tạm khóa.");
        }

        if (!await userManager.CheckPasswordAsync(user, request.Password))
        {
            await userManager.AccessFailedAsync(user);
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");
        }

        await userManager.ResetAccessFailedCountAsync(user);
        user.LastLoginAt = DateTimeOffset.UtcNow;
        await userManager.UpdateAsync(user);

        return await IssueTokensAsync(user, cancellationToken);
    }

    public async Task<AuthResponse> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        var tokenHash = jwtTokenService.HashToken(request.RefreshToken);
        var storedToken = await dbContext.RefreshTokens
            .Include(x => x.User)
            .SingleOrDefaultAsync(x => x.TokenHash == tokenHash, cancellationToken)
            ?? throw new UnauthorizedAccessException("Refresh token không hợp lệ.");

        if (!storedToken.IsActive)
        {
            throw new UnauthorizedAccessException("Refresh token đã hết hạn hoặc bị thu hồi.");
        }

        storedToken.RevokedAt = DateTimeOffset.UtcNow;
        var response = await IssueTokensAsync(storedToken.User, cancellationToken);
        storedToken.ReplacedByTokenHash = jwtTokenService.HashToken(response.RefreshToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return response;
    }

    public async Task LogoutAsync(LogoutRequest request, CancellationToken cancellationToken)
    {
        var tokenHash = jwtTokenService.HashToken(request.RefreshToken);
        var storedToken = await dbContext.RefreshTokens
            .SingleOrDefaultAsync(x => x.TokenHash == tokenHash, cancellationToken);

        if (storedToken is null || storedToken.RevokedAt is not null)
        {
            return;
        }

        storedToken.RevokedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user?.Email is null)
        {
            return;
        }

        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        await emailService.SendPasswordResetAsync(user.Email, token, cancellationToken);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email)
            ?? throw new InvalidOperationException("Yêu cầu đặt lại mật khẩu không hợp lệ.");
        var result = await userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        EnsureIdentitySucceeded(result);
    }

    public async Task VerifyEmailAsync(VerifyEmailRequest request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(request.UserId, out var userId))
        {
            throw new InvalidOperationException("Mã người dùng không hợp lệ.");
        }

        var user = await userManager.FindByIdAsync(userId.ToString())
            ?? throw new InvalidOperationException("Tài khoản không tồn tại.");
        var result = await userManager.ConfirmEmailAsync(user, request.Token);
        EnsureIdentitySucceeded(result);
    }

    public async Task<CurrentUserResponse> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(userId.ToString())
            ?? throw new KeyNotFoundException("Không tìm thấy người dùng.");
        var roles = await userManager.GetRolesAsync(user);
        return MapUser(user, roles);
    }

    private async Task<AuthResponse> IssueTokensAsync(ApplicationUser user, CancellationToken cancellationToken)
    {
        var roles = await userManager.GetRolesAsync(user);
        var (accessToken, expiresAt) = await jwtTokenService.CreateAccessTokenAsync(user, roles.ToArray(), cancellationToken);
        var refreshToken = jwtTokenService.CreateRefreshToken();

        dbContext.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = jwtTokenService.HashToken(refreshToken),
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(30)
        });
        await dbContext.SaveChangesAsync(cancellationToken);

        return new AuthResponse(accessToken, refreshToken, expiresAt, MapUser(user, roles));
    }

    private static CurrentUserResponse MapUser(ApplicationUser user, IReadOnlyCollection<string> roles) =>
        new(user.Id, user.Email ?? string.Empty, user.DisplayName, roles);

    private static void EnsureIdentitySucceeded(IdentityResult result)
    {
        if (result.Succeeded)
        {
            return;
        }

        throw new InvalidOperationException(string.Join("; ", result.Errors.Select(x => x.Description)));
    }
}
