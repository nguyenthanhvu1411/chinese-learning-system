using ChineseLearning.Domain.Common;
using ChineseLearning.Domain.Constants;

namespace ChineseLearning.Domain.Entities;

public sealed class UserProfile : Entity
{
    public Guid UserId { get; private set; }
    public LearningLevel CurrentLevel { get; private set; } = LearningLevel.Beginner;
    public string Goal { get; private set; } = string.Empty;
    public int DailyGoalMinutes { get; private set; } = 15;
    public string TimeZone { get; private set; } = "Asia/Ho_Chi_Minh";
    public ApplicationUser User { get; private set; } = null!;
}

public sealed class UserVocabularyProgress : Entity
{
    public Guid UserId { get; private set; }
    public long VocabularyId { get; private set; }
    public VocabularyMastery Mastery { get; private set; } = VocabularyMastery.New;
    public int CorrectCount { get; private set; }
    public int IncorrectCount { get; private set; }
    public DateTimeOffset? LastReviewedAt { get; private set; }
    public ApplicationUser User { get; private set; } = null!;
    public Vocabulary Vocabulary { get; private set; } = null!;
}

public sealed class UserLessonProgress : Entity
{
    public Guid UserId { get; private set; }
    public long LessonId { get; private set; }
    public int CompletionPercent { get; private set; }
    public DateTimeOffset? StartedAt { get; private set; }
    public DateTimeOffset? CompletedAt { get; private set; }
    public ApplicationUser User { get; private set; } = null!;
    public Lesson Lesson { get; private set; } = null!;
}

public sealed class FavoriteVocabulary : Entity
{
    public Guid UserId { get; private set; }
    public long VocabularyId { get; private set; }
    public ApplicationUser User { get; private set; } = null!;
    public Vocabulary Vocabulary { get; private set; } = null!;
}

public sealed class ReviewSchedule : Entity
{
    public Guid UserId { get; private set; }
    public long VocabularyId { get; private set; }
    public DateTimeOffset DueAt { get; private set; }
    public int IntervalDays { get; private set; }
    public decimal EaseFactor { get; private set; } = 2.5m;
    public int RepetitionCount { get; private set; }
    public ReviewRating? LastRating { get; private set; }
    public ApplicationUser User { get; private set; } = null!;
    public Vocabulary Vocabulary { get; private set; } = null!;
}
