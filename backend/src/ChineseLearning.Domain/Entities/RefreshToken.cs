using ChineseLearning.Domain.Common;

namespace ChineseLearning.Domain.Entities;

public sealed class RefreshToken : Entity
{
    private RefreshToken() { }

    public RefreshToken(Guid userId, string tokenHash, DateTimeOffset expiresAt)
    {
        UserId = userId;
        TokenHash = tokenHash;
        ExpiresAt = expiresAt;
    }

    public Guid UserId { get; private set; }
    public string TokenHash { get; private set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; private set; }
    public DateTimeOffset? RevokedAt { get; private set; }
    public string? ReplacedByTokenHash { get; private set; }
    public ApplicationUser User { get; private set; } = null!;

    public bool IsActive => RevokedAt is null && ExpiresAt > DateTimeOffset.UtcNow;

    public void Revoke(string? replacedByTokenHash = null)
    {
        if (RevokedAt is not null) return;
        RevokedAt = DateTimeOffset.UtcNow;
        ReplacedByTokenHash = replacedByTokenHash;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
