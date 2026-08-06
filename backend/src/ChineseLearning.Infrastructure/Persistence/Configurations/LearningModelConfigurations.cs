using ChineseLearning.Domain.Common;
using ChineseLearning.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChineseLearning.Infrastructure.Persistence.Configurations;

internal static class EntityConfiguration
{
    public static void ConfigureBase<TEntity>(EntityTypeBuilder<TEntity> builder) where TEntity : Entity
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).UseIdentityByDefaultColumn();
        builder.Property(x => x.PublicId).IsRequired();
        builder.HasIndex(x => x.PublicId).IsUnique();
        builder.Property(x => x.CreatedAt).IsRequired();
    }
}

public sealed class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.ToTable("users", "identity");
        builder.Property(x => x.PublicId).IsRequired();
        builder.HasIndex(x => x.PublicId).IsUnique();
        builder.Property(x => x.DisplayName).HasMaxLength(120).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.HasOne(x => x.Profile).WithOne(x => x.User).HasForeignKey<UserProfile>(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.ToTable("user_profiles"); EntityConfiguration.ConfigureBase(builder);
        builder.HasIndex(x => x.UserId).IsUnique();
        builder.Property(x => x.Goal).HasMaxLength(300).IsRequired();
        builder.Property(x => x.TimeZone).HasMaxLength(80).IsRequired();
    }
}

public sealed class TopicConfiguration : IEntityTypeConfiguration<Topic>
{
    public void Configure(EntityTypeBuilder<Topic> builder)
    {
        builder.ToTable("topics"); EntityConfiguration.ConfigureBase(builder);
        builder.Property(x => x.Slug).HasMaxLength(120).IsRequired();
        builder.HasIndex(x => x.Slug).IsUnique();
        builder.Property(x => x.NameVi).HasMaxLength(160).IsRequired();
        builder.Property(x => x.DescriptionVi).HasMaxLength(1000);
    }
}

public sealed class VocabularyConfiguration : IEntityTypeConfiguration<Vocabulary>
{
    public void Configure(EntityTypeBuilder<Vocabulary> builder)
    {
        builder.ToTable("vocabularies"); EntityConfiguration.ConfigureBase(builder);
        builder.Property(x => x.Simplified).HasMaxLength(80).IsRequired();
        builder.Property(x => x.Traditional).HasMaxLength(80);
        builder.Property(x => x.Pinyin).HasMaxLength(160).IsRequired();
        builder.Property(x => x.MeaningVi).HasMaxLength(500).IsRequired();
        builder.Property(x => x.PartOfSpeech).HasMaxLength(80);
        builder.Property(x => x.AudioUrl).HasMaxLength(1000);
        builder.Property(x => x.ImageUrl).HasMaxLength(1000);
        
        builder.HasIndex(x => new { x.Simplified, x.Pinyin, x.HskLevel })
               .IsUnique()
               .HasFilter("\"IsDeleted\" = false");
               
        builder.HasQueryFilter(x => !x.IsDeleted);
        
        builder.HasOne(x => x.Topic).WithMany(x => x.Vocabularies).HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class VocabularyExampleConfiguration : IEntityTypeConfiguration<VocabularyExample>
{
    public void Configure(EntityTypeBuilder<VocabularyExample> builder)
    {
        builder.ToTable("vocabulary_examples"); EntityConfiguration.ConfigureBase(builder);
        builder.Property(x => x.ChineseText).HasMaxLength(500).IsRequired();
        builder.Property(x => x.Pinyin).HasMaxLength(700).IsRequired();
        builder.Property(x => x.MeaningVi).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.AudioUrl).HasMaxLength(1000);
        builder.HasOne(x => x.Vocabulary).WithMany(x => x.Examples).HasForeignKey(x => x.VocabularyId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class LessonConfiguration : IEntityTypeConfiguration<Lesson>
{
    public void Configure(EntityTypeBuilder<Lesson> builder)
    {
        builder.ToTable("lessons"); EntityConfiguration.ConfigureBase(builder);
        builder.Property(x => x.Slug).HasMaxLength(160).IsRequired();
        builder.HasIndex(x => x.Slug).IsUnique();
        builder.Property(x => x.TitleVi).HasMaxLength(250).IsRequired();
        builder.Property(x => x.DescriptionVi).HasMaxLength(1500);
        
        builder.HasQueryFilter(x => !x.IsDeleted);
        
        builder.HasOne(x => x.Topic).WithMany(x => x.Lessons).HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class LessonVocabularyConfiguration : IEntityTypeConfiguration<LessonVocabulary>
{
    public void Configure(EntityTypeBuilder<LessonVocabulary> builder)
    {
        builder.ToTable("lesson_vocabularies");
        builder.HasKey(x => new { x.LessonId, x.VocabularyId });
        builder.HasOne(x => x.Lesson).WithMany(x => x.Vocabularies).HasForeignKey(x => x.LessonId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Vocabulary).WithMany(x => x.Lessons).HasForeignKey(x => x.VocabularyId).OnDelete(DeleteBehavior.Restrict);
    }
}
