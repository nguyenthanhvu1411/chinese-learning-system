using ChineseLearning.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChineseLearning.Infrastructure.Persistence.Configurations;

public sealed class UserVocabularyProgressConfiguration : IEntityTypeConfiguration<UserVocabularyProgress>
{
    public void Configure(EntityTypeBuilder<UserVocabularyProgress> builder)
    {
        builder.ToTable("user_vocabulary_progress"); EntityConfiguration.ConfigureBase(builder);
        builder.HasIndex(x => new { x.UserId, x.VocabularyId }).IsUnique();
        builder.HasOne(x => x.User).WithMany(x => x.VocabularyProgress).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Vocabulary).WithMany().HasForeignKey(x => x.VocabularyId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class UserLessonProgressConfiguration : IEntityTypeConfiguration<UserLessonProgress>
{
    public void Configure(EntityTypeBuilder<UserLessonProgress> builder)
    {
        builder.ToTable("user_lesson_progress"); EntityConfiguration.ConfigureBase(builder);
        builder.HasIndex(x => new { x.UserId, x.LessonId }).IsUnique();
        builder.HasOne(x => x.User).WithMany(x => x.LessonProgress).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Lesson).WithMany().HasForeignKey(x => x.LessonId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class FavoriteVocabularyConfiguration : IEntityTypeConfiguration<FavoriteVocabulary>
{
    public void Configure(EntityTypeBuilder<FavoriteVocabulary> builder)
    {
        builder.ToTable("favorite_vocabularies"); EntityConfiguration.ConfigureBase(builder);
        builder.HasIndex(x => new { x.UserId, x.VocabularyId }).IsUnique();
        builder.HasOne(x => x.User).WithMany(x => x.FavoriteVocabularies).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Vocabulary).WithMany().HasForeignKey(x => x.VocabularyId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class ReviewScheduleConfiguration : IEntityTypeConfiguration<ReviewSchedule>
{
    public void Configure(EntityTypeBuilder<ReviewSchedule> builder)
    {
        builder.ToTable("review_schedules"); EntityConfiguration.ConfigureBase(builder);
        builder.Property(x => x.EaseFactor).HasPrecision(4, 2);
        builder.HasIndex(x => new { x.UserId, x.VocabularyId }).IsUnique();
        builder.HasIndex(x => new { x.UserId, x.DueAt });
        builder.HasOne(x => x.User).WithMany(x => x.ReviewSchedules).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Vocabulary).WithMany().HasForeignKey(x => x.VocabularyId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class QuizConfiguration : IEntityTypeConfiguration<Quiz>
{
    public void Configure(EntityTypeBuilder<Quiz> builder)
    {
        builder.ToTable("quizzes"); EntityConfiguration.ConfigureBase(builder);
        builder.Property(x => x.TitleVi).HasMaxLength(250).IsRequired();
        builder.HasOne(x => x.Lesson).WithMany(x => x.Quizzes).HasForeignKey(x => x.LessonId).OnDelete(DeleteBehavior.SetNull);
    }
}

public sealed class QuizQuestionConfiguration : IEntityTypeConfiguration<QuizQuestion>
{
    public void Configure(EntityTypeBuilder<QuizQuestion> builder)
    {
        builder.ToTable("quiz_questions"); EntityConfiguration.ConfigureBase(builder);
        builder.Property(x => x.PromptVi).HasMaxLength(1500).IsRequired();
        builder.Property(x => x.ExplanationVi).HasMaxLength(3000);
        builder.HasOne(x => x.Quiz).WithMany(x => x.Questions).HasForeignKey(x => x.QuizId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class QuizOptionConfiguration : IEntityTypeConfiguration<QuizOption>
{
    public void Configure(EntityTypeBuilder<QuizOption> builder)
    {
        builder.ToTable("quiz_options"); EntityConfiguration.ConfigureBase(builder);
        builder.Property(x => x.Text).HasMaxLength(1000).IsRequired();
        builder.HasOne(x => x.Question).WithMany(x => x.Options).HasForeignKey(x => x.QuestionId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class QuizAttemptConfiguration : IEntityTypeConfiguration<QuizAttempt>
{
    public void Configure(EntityTypeBuilder<QuizAttempt> builder)
    {
        builder.ToTable("quiz_attempts"); EntityConfiguration.ConfigureBase(builder);
        builder.HasIndex(x => new { x.UserId, x.QuizId, x.CreatedAt });
        builder.HasOne(x => x.User).WithMany(x => x.QuizAttempts).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Quiz).WithMany().HasForeignKey(x => x.QuizId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class QuizAnswerConfiguration : IEntityTypeConfiguration<QuizAnswer>
{
    public void Configure(EntityTypeBuilder<QuizAnswer> builder)
    {
        builder.ToTable("quiz_answers"); EntityConfiguration.ConfigureBase(builder);
        builder.Property(x => x.TextAnswer).HasMaxLength(2000);
        builder.HasOne(x => x.Attempt).WithMany(x => x.Answers).HasForeignKey(x => x.AttemptId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Question).WithMany().HasForeignKey(x => x.QuestionId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.SelectedOption).WithMany().HasForeignKey(x => x.SelectedOptionId).OnDelete(DeleteBehavior.SetNull);
    }
}

public sealed class ContentReportConfiguration : IEntityTypeConfiguration<ContentReport>
{
    public void Configure(EntityTypeBuilder<ContentReport> builder)
    {
        builder.ToTable("content_reports"); EntityConfiguration.ConfigureBase(builder);
        builder.Property(x => x.EntityType).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Reason).HasMaxLength(250).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(3000);
        builder.HasIndex(x => new { x.Status, x.CreatedAt });
    }
}

public sealed class ProductEventConfiguration : IEntityTypeConfiguration<ProductEvent>
{
    public void Configure(EntityTypeBuilder<ProductEvent> builder)
    {
        builder.ToTable("product_events"); EntityConfiguration.ConfigureBase(builder);
        builder.Property(x => x.Name).HasMaxLength(160).IsRequired();
        builder.Property(x => x.PropertiesJson).HasColumnType("jsonb");
        builder.Property(x => x.SessionId).HasMaxLength(160);
        builder.Property(x => x.ClientPlatform).HasMaxLength(80);
        builder.HasIndex(x => new { x.Name, x.CreatedAt });
    }
}

public sealed class AiUsageLogConfiguration : IEntityTypeConfiguration<AiUsageLog>
{
    public void Configure(EntityTypeBuilder<AiUsageLog> builder)
    {
        builder.ToTable("ai_usage_logs"); EntityConfiguration.ConfigureBase(builder);
        builder.Property(x => x.Feature).HasMaxLength(120).IsRequired();
        builder.Property(x => x.Model).HasMaxLength(120).IsRequired();
        builder.Property(x => x.ErrorCode).HasMaxLength(120);
        builder.HasIndex(x => new { x.UserId, x.CreatedAt });
    }
}

public sealed class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("audit_logs"); EntityConfiguration.ConfigureBase(builder);
        builder.Property(x => x.Action).HasMaxLength(160).IsRequired();
        builder.Property(x => x.EntityType).HasMaxLength(120).IsRequired();
        builder.Property(x => x.EntityId).HasMaxLength(160);
        builder.Property(x => x.BeforeJson).HasColumnType("jsonb");
        builder.Property(x => x.AfterJson).HasColumnType("jsonb");
        builder.Property(x => x.IpAddress).HasMaxLength(64);
        builder.HasIndex(x => new { x.ActorUserId, x.CreatedAt });
    }
}
