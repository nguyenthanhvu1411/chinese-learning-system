using ChineseLearning.Domain.Common;
using ChineseLearning.Domain.Constants;

namespace ChineseLearning.Domain.Entities;

public sealed class Quiz : Entity
{
    public long? LessonId { get; private set; }
    public string TitleVi { get; private set; } = string.Empty;
    public int PassingScore { get; private set; } = 70;
    public ContentStatus Status { get; private set; } = ContentStatus.Draft;
    public Lesson? Lesson { get; private set; }
    public ICollection<QuizQuestion> Questions { get; private set; } = new List<QuizQuestion>();
}

public sealed class QuizQuestion : Entity
{
    public long QuizId { get; private set; }
    public QuestionType Type { get; private set; }
    public string PromptVi { get; private set; } = string.Empty;
    public string? ExplanationVi { get; private set; }
    public int SortOrder { get; private set; }
    public Quiz Quiz { get; private set; } = null!;
    public ICollection<QuizOption> Options { get; private set; } = new List<QuizOption>();
}

public sealed class QuizOption : Entity
{
    public long QuestionId { get; private set; }
    public string Text { get; private set; } = string.Empty;
    public bool IsCorrect { get; private set; }
    public int SortOrder { get; private set; }
    public QuizQuestion Question { get; private set; } = null!;
}

public sealed class QuizAttempt : Entity
{
    public Guid UserId { get; private set; }
    public long QuizId { get; private set; }
    public int Score { get; private set; }
    public DateTimeOffset StartedAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? CompletedAt { get; private set; }
    public ApplicationUser User { get; private set; } = null!;
    public Quiz Quiz { get; private set; } = null!;
    public ICollection<QuizAnswer> Answers { get; private set; } = new List<QuizAnswer>();
}

public sealed class QuizAnswer : Entity
{
    public long AttemptId { get; private set; }
    public long QuestionId { get; private set; }
    public long? SelectedOptionId { get; private set; }
    public string? TextAnswer { get; private set; }
    public bool IsCorrect { get; private set; }
    public QuizAttempt Attempt { get; private set; } = null!;
    public QuizQuestion Question { get; private set; } = null!;
    public QuizOption? SelectedOption { get; private set; }
}
