using ChineseLearning.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ChineseLearning.Application.Abstractions.Persistence;

public interface IApplicationDbContext
{
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<UserProfile> UserProfiles { get; }
    DbSet<Topic> Topics { get; }
    DbSet<Vocabulary> Vocabularies { get; }
    DbSet<VocabularyExample> VocabularyExamples { get; }
    DbSet<Lesson> Lessons { get; }
    DbSet<LessonVocabulary> LessonVocabularies { get; }
    DbSet<UserVocabularyProgress> UserVocabularyProgress { get; }
    DbSet<UserLessonProgress> UserLessonProgress { get; }
    DbSet<FavoriteVocabulary> FavoriteVocabularies { get; }
    DbSet<ReviewSchedule> ReviewSchedules { get; }
    DbSet<Quiz> Quizzes { get; }
    DbSet<QuizQuestion> QuizQuestions { get; }
    DbSet<QuizOption> QuizOptions { get; }
    DbSet<QuizAttempt> QuizAttempts { get; }
    DbSet<QuizAnswer> QuizAnswers { get; }
    DbSet<ContentReport> ContentReports { get; }
    DbSet<ProductEvent> ProductEvents { get; }
    DbSet<AiUsageLog> AiUsageLogs { get; }
    DbSet<AuditLog> AuditLogs { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
