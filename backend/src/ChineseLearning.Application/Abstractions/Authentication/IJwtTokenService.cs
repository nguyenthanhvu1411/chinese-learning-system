using ChineseLearning.Domain.Entities;

namespace ChineseLearning.Application.Abstractions.Authentication;

public interface IJwtTokenService
{
    Task<(string Token, DateTimeOffset ExpiresAt)> CreateAccessTokenAsync(
        ApplicationUser user,
        IReadOnlyCollection<string> roles,
        CancellationToken cancellationToken);

    string CreateRefreshToken();
    string HashToken(string token);
}
