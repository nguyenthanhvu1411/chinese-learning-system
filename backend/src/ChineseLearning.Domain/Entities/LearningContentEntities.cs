using ChineseLearning.Domain.Common;
using ChineseLearning.Domain.Constants;

namespace ChineseLearning.Domain.Entities;

public sealed class Topic : Entity
{
    public string Slug { get; private set; } = string.Empty;
    public string NameVi { get; private set; } = string.Empty;
    public string? DescriptionVi { get; private set; }
    public int SortOrder { get; private set; }
    public ContentStatus Status { get; private set; } = ContentStatus.Draft;
    public ICollection<Vocabulary> Vocabularies { get; private set; } = new List<Vocabulary>();
    public ICollection<Lesson> Lessons { get; private set; } = new List<Lesson>();

    public static Topic Create(string nameVi, string? descriptionVi)
    {
        return new Topic
        {
            NameVi = nameVi,
            DescriptionVi = descriptionVi,
            Slug = nameVi.ToLower().Replace(" ", "-")
        };
    }
}

public sealed class Vocabulary : Entity
{
    public long TopicId { get; private set; }
    public string Simplified { get; private set; } = string.Empty;
    public string? Traditional { get; private set; }
    public string Pinyin { get; private set; } = string.Empty;
    public string MeaningVi { get; private set; } = string.Empty;
    public string? PartOfSpeech { get; private set; }
    public string? AudioUrl { get; private set; }
    public string? ImageUrl { get; private set; }
    public int HskLevel { get; private set; } = 1;
    public ContentStatus Status { get; private set; } = ContentStatus.Draft;
    
    // Soft Delete
    public bool IsDeleted { get; private set; }
    public DateTimeOffset? DeletedAt { get; private set; }

    public Topic Topic { get; private set; } = null!;
    public ICollection<VocabularyExample> Examples { get; private set; } = new List<VocabularyExample>();
    public ICollection<LessonVocabulary> Lessons { get; private set; } = new List<LessonVocabulary>();

    private Vocabulary() { } // EF Core

    public static Vocabulary Create(long topicId, string simplified, string? traditional, string pinyin, string meaningVi, int hskLevel)
    {
        return new Vocabulary
        {
            TopicId = topicId,
            Simplified = simplified,
            Traditional = traditional,
            Pinyin = pinyin,
            MeaningVi = meaningVi,
            HskLevel = hskLevel,
            Status = ContentStatus.Draft,
            IsDeleted = false
        };
    }

    public void Update(string simplified, string? traditional, string pinyin, string meaningVi, string? partOfSpeech, string? audioUrl, string? imageUrl, int hskLevel)
    {
        Simplified = simplified;
        Traditional = traditional;
        Pinyin = pinyin;
        MeaningVi = meaningVi;
        PartOfSpeech = partOfSpeech;
        AudioUrl = audioUrl;
        ImageUrl = imageUrl;
        HskLevel = hskLevel;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void SoftDelete()
    {
        if (IsDeleted) return;
        IsDeleted = true;
        DeletedAt = DateTimeOffset.UtcNow;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Restore()
    {
        if (!IsDeleted) return;
        IsDeleted = false;
        DeletedAt = null;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Publish()
    {
        Status = ContentStatus.Published;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Unpublish()
    {
        Status = ContentStatus.Draft;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}

public sealed class VocabularyExample : Entity
{
    public long VocabularyId { get; private set; }
    public string ChineseText { get; private set; } = string.Empty;
    public string Pinyin { get; private set; } = string.Empty;
    public string MeaningVi { get; private set; } = string.Empty;
    public string? AudioUrl { get; private set; }
    public int SortOrder { get; private set; }
    public Vocabulary Vocabulary { get; private set; } = null!;
}

public sealed class Lesson : Entity
{
    public long TopicId { get; private set; }
    public string Slug { get; private set; } = string.Empty;
    public string TitleVi { get; private set; } = string.Empty;
    public string? DescriptionVi { get; private set; }
    public int EstimatedMinutes { get; private set; } = 15;
    public int SortOrder { get; private set; }
    public ContentStatus Status { get; private set; } = ContentStatus.Draft;
    
    // Soft Delete
    public bool IsDeleted { get; private set; }
    public DateTimeOffset? DeletedAt { get; private set; }
    
    public Topic Topic { get; private set; } = null!;
    public ICollection<LessonVocabulary> Vocabularies { get; private set; } = new List<LessonVocabulary>();
    public ICollection<Quiz> Quizzes { get; private set; } = new List<Quiz>();

    private Lesson() { } // EF Core

    public static Lesson Create(long topicId, string titleVi, string? descriptionVi, int estimatedMinutes, int sortOrder)
    {
        return new Lesson
        {
            TopicId = topicId,
            TitleVi = titleVi,
            DescriptionVi = descriptionVi,
            EstimatedMinutes = estimatedMinutes,
            SortOrder = sortOrder,
            Slug = titleVi.ToLower().Replace(" ", "-").Replace("đ", "d"), // simplistic slug for demo
            Status = ContentStatus.Draft,
            IsDeleted = false
        };
    }

    public void Update(string titleVi, string? descriptionVi, int estimatedMinutes, int sortOrder)
    {
        TitleVi = titleVi;
        DescriptionVi = descriptionVi;
        EstimatedMinutes = estimatedMinutes;
        SortOrder = sortOrder;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void SoftDelete()
    {
        if (IsDeleted) return;
        IsDeleted = true;
        DeletedAt = DateTimeOffset.UtcNow;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Restore()
    {
        if (!IsDeleted) return;
        IsDeleted = false;
        DeletedAt = null;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Publish()
    {
        Status = ContentStatus.Published;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Unpublish()
    {
        Status = ContentStatus.Draft;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}

public sealed class LessonVocabulary
{
    public long LessonId { get; private set; }
    public long VocabularyId { get; private set; }
    public int SortOrder { get; private set; }
    public Lesson Lesson { get; private set; } = null!;
    public Vocabulary Vocabulary { get; private set; } = null!;
    
    private LessonVocabulary() { } // EF Core
    
    public static LessonVocabulary Create(long lessonId, long vocabularyId, int sortOrder)
    {
        return new LessonVocabulary
        {
            LessonId = lessonId,
            VocabularyId = vocabularyId,
            SortOrder = sortOrder
        };
    }

    public void UpdateOrder(int sortOrder)
    {
        SortOrder = sortOrder;
    }
}
