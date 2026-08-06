using Microsoft.AspNetCore.Identity;

namespace ChineseLearning.Domain.Entities;

public sealed class ApplicationUser : IdentityUser<Guid>
{
    public Guid PublicId { get; private set; } = Guid.NewGuid();
    public string DisplayName { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? UpdatedAt { get; private set; }
    public DateTimeOffset? LastLoginAt { get; private set; }
    public bool IsOnboardingCompleted { get; private set; }

    public UserProfile? Profile { get; private set; }
    public ICollection<RefreshToken> RefreshTokens { get; private set; } = new List<RefreshToken>();
    public ICollection<UserVocabularyProgress> VocabularyProgress { get; private set; } = new List<UserVocabularyProgress>();
    public ICollection<UserLessonProgress> LessonProgress { get; private set; } = new List<UserLessonProgress>();
    public ICollection<FavoriteVocabulary> FavoriteVocabularies { get; private set; } = new List<FavoriteVocabulary>();
    public ICollection<QuizAttempt> QuizAttempts { get; private set; } = new List<QuizAttempt>();
    public ICollection<ReviewSchedule> ReviewSchedules { get; private set; } = new List<ReviewSchedule>();

    public void SetDisplayName(string displayName)
    {
        DisplayName = displayName.Trim();
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void MarkLogin() => LastLoginAt = DateTimeOffset.UtcNow;

    public void CompleteOnboarding()
    {
        IsOnboardingCompleted = true;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
