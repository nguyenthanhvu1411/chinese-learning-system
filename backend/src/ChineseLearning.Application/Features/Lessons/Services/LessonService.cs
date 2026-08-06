using ChineseLearning.Application.Abstractions.Authentication;
using ChineseLearning.Application.Abstractions.Persistence;
using ChineseLearning.Application.Common.Models;
using ChineseLearning.Application.Features.Lessons.DTOs;
using ChineseLearning.Application.Features.Vocabularies.DTOs;
using ChineseLearning.Domain.Entities;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ChineseLearning.Application.Features.Lessons.Services;

public sealed class LessonService(
    IApplicationDbContext dbContext,
    IValidator<CreateLessonRequest> createValidator,
    IValidator<UpdateLessonRequest> updateValidator,
    IValidator<AssignVocabularyRequest> assignValidator,
    IValidator<UpdateVocabularyOrderRequest> orderValidator,
    ICurrentUserService currentUserService) : ILessonService
{
    public async Task<LessonWithVocabulariesDto> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var lesson = await dbContext.Lessons
            .Include(x => x.Topic)
            .Include(x => x.Vocabularies)
            .ThenInclude(lv => lv.Vocabulary)
            .ThenInclude(v => v.Topic)
            .SingleOrDefaultAsync(x => x.PublicId == id, cancellationToken)
            ?? throw new KeyNotFoundException("Lesson not found.");
            
        return MapToWithVocabulariesDto(lesson);
    }

    public async Task<PagedList<LessonDto>> GetPagedAsync(GetLessonsQuery query, CancellationToken cancellationToken)
    {
        var dbQuery = dbContext.Lessons.Include(x => x.Topic).AsNoTracking();

        if (query.TopicId.HasValue)
            dbQuery = dbQuery.Where(x => x.Topic.PublicId == query.TopicId.Value);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            dbQuery = dbQuery.Where(x => x.TitleVi.ToLower().Contains(search) || 
                                         (x.DescriptionVi != null && x.DescriptionVi.ToLower().Contains(search)));
        }

        dbQuery = query.SortBy?.ToLower() switch
        {
            "titlevi" => query.Descending ? dbQuery.OrderByDescending(x => x.TitleVi) : dbQuery.OrderBy(x => x.TitleVi),
            "sortorder" => query.Descending ? dbQuery.OrderByDescending(x => x.SortOrder) : dbQuery.OrderBy(x => x.SortOrder),
            "createdat" => query.Descending ? dbQuery.OrderByDescending(x => x.CreatedAt) : dbQuery.OrderBy(x => x.CreatedAt),
            _ => query.Descending ? dbQuery.OrderByDescending(x => x.CreatedAt) : dbQuery.OrderBy(x => x.CreatedAt)
        };

        var count = await dbQuery.CountAsync(cancellationToken);
        var items = await dbQuery.Skip((query.PageNumber - 1) * query.PageSize).Take(query.PageSize).ToListAsync(cancellationToken);

        return new PagedList<LessonDto>(items.Select(x => MapToDto(x)).ToList(), count, query.PageNumber, query.PageSize);
    }

    public async Task<PagedList<LessonDto>> GetTrashAsync(GetLessonsQuery query, CancellationToken cancellationToken)
    {
        var dbQuery = dbContext.Lessons.IgnoreQueryFilters().Include(x => x.Topic).Where(x => x.IsDeleted).AsNoTracking();

        if (query.TopicId.HasValue)
            dbQuery = dbQuery.Where(x => x.Topic.PublicId == query.TopicId.Value);

        var count = await dbQuery.CountAsync(cancellationToken);
        var items = await dbQuery.OrderByDescending(x => x.DeletedAt)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedList<LessonDto>(items.Select(x => MapToDto(x)).ToList(), count, query.PageNumber, query.PageSize);
    }

    public async Task<LessonDto> CreateAsync(CreateLessonRequest request, CancellationToken cancellationToken)
    {
        await createValidator.ValidateAndThrowAsync(request, cancellationToken);

        var topic = await dbContext.Topics.SingleOrDefaultAsync(x => x.PublicId == request.TopicId, cancellationToken)
            ?? throw new KeyNotFoundException("Topic not found.");

        var exists = await dbContext.Lessons.AnyAsync(x => x.TitleVi == request.TitleVi && x.TopicId == topic.Id, cancellationToken);
        if (exists)
            throw new ValidationException(new[] { new FluentValidation.Results.ValidationFailure("TitleVi", "Lesson with same Title already exists in this Topic.") });

        var lesson = Lesson.Create(topic.Id, request.TitleVi, request.DescriptionVi, request.EstimatedMinutes, request.SortOrder);
        
        dbContext.Lessons.Add(lesson);
        LogAudit("CREATE", "Lesson", null, null, JsonSerializer.Serialize(request));

        await dbContext.SaveChangesAsync(cancellationToken);
        return MapToDto(lesson, request.TopicId);
    }

    public async Task<LessonDto> UpdateAsync(Guid id, UpdateLessonRequest request, CancellationToken cancellationToken)
    {
        await updateValidator.ValidateAndThrowAsync(request, cancellationToken);

        var lesson = await dbContext.Lessons.Include(x => x.Topic).SingleOrDefaultAsync(x => x.PublicId == id, cancellationToken)
            ?? throw new KeyNotFoundException("Lesson not found.");

        var topic = await dbContext.Topics.SingleOrDefaultAsync(x => x.PublicId == request.TopicId, cancellationToken)
            ?? throw new KeyNotFoundException("Topic not found.");

        var exists = await dbContext.Lessons.AnyAsync(x => x.TitleVi == request.TitleVi && x.TopicId == topic.Id && x.Id != lesson.Id, cancellationToken);
        if (exists)
            throw new ValidationException(new[] { new FluentValidation.Results.ValidationFailure("TitleVi", "Lesson with same Title already exists in this Topic.") });

        var beforeJson = JsonSerializer.Serialize(MapToDto(lesson));

        // Note: Changing TopicId is currently not supported via Update on the domain entity cleanly unless we add a SetTopic method.
        // For MVP, assuming TopicId isn't changed or we manually update it if needed.
        // If we must change it, we need EF to update it.
        if (lesson.TopicId != topic.Id)
        {
            throw new ValidationException(new[] { new FluentValidation.Results.ValidationFailure("TopicId", "Cannot change topic of a lesson after creation.") });
        }

        lesson.Update(request.TitleVi, request.DescriptionVi, request.EstimatedMinutes, request.SortOrder);
        
        LogAudit("UPDATE", "Lesson", id.ToString(), beforeJson, JsonSerializer.Serialize(request));

        await dbContext.SaveChangesAsync(cancellationToken);
        return MapToDto(lesson);
    }

    public async Task<LessonDto> SoftDeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var lesson = await dbContext.Lessons.Include(x => x.Topic).SingleOrDefaultAsync(x => x.PublicId == id, cancellationToken)
            ?? throw new KeyNotFoundException("Lesson not found.");

        var beforeJson = JsonSerializer.Serialize(MapToDto(lesson));
        lesson.SoftDelete();
        
        LogAudit("SOFT_DELETE", "Lesson", id.ToString(), beforeJson, null);

        await dbContext.SaveChangesAsync(cancellationToken);
        return MapToDto(lesson);
    }

    public async Task<LessonDto> RestoreAsync(Guid id, CancellationToken cancellationToken)
    {
        var lesson = await dbContext.Lessons.IgnoreQueryFilters().Include(x => x.Topic).SingleOrDefaultAsync(x => x.PublicId == id && x.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Lesson not found in trash.");

        lesson.Restore();
        
        LogAudit("RESTORE", "Lesson", id.ToString(), null, null);

        await dbContext.SaveChangesAsync(cancellationToken);
        return MapToDto(lesson);
    }

    public async Task PermanentDeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var lesson = await dbContext.Lessons.IgnoreQueryFilters().Include(x => x.Topic).SingleOrDefaultAsync(x => x.PublicId == id, cancellationToken)
            ?? throw new KeyNotFoundException("Lesson not found.");

        var beforeJson = JsonSerializer.Serialize(MapToDto(lesson));
        dbContext.Lessons.Remove(lesson);
        
        LogAudit("PERMANENT_DELETE", "Lesson", id.ToString(), beforeJson, null);

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<LessonDto> PublishAsync(Guid id, CancellationToken cancellationToken)
    {
        var lesson = await dbContext.Lessons.Include(x => x.Topic).SingleOrDefaultAsync(x => x.PublicId == id, cancellationToken)
            ?? throw new KeyNotFoundException("Lesson not found.");

        lesson.Publish();
        
        LogAudit("PUBLISH", "Lesson", id.ToString(), null, null);

        await dbContext.SaveChangesAsync(cancellationToken);
        return MapToDto(lesson);
    }

    public async Task<LessonDto> UnpublishAsync(Guid id, CancellationToken cancellationToken)
    {
        var lesson = await dbContext.Lessons.Include(x => x.Topic).SingleOrDefaultAsync(x => x.PublicId == id, cancellationToken)
            ?? throw new KeyNotFoundException("Lesson not found.");

        lesson.Unpublish();
        
        LogAudit("UNPUBLISH", "Lesson", id.ToString(), null, null);

        await dbContext.SaveChangesAsync(cancellationToken);
        return MapToDto(lesson);
    }

    public async Task AssignVocabularyAsync(Guid lessonId, AssignVocabularyRequest request, CancellationToken cancellationToken)
    {
        await assignValidator.ValidateAndThrowAsync(request, cancellationToken);

        var lesson = await dbContext.Lessons.Include(x => x.Vocabularies).SingleOrDefaultAsync(x => x.PublicId == lessonId, cancellationToken)
            ?? throw new KeyNotFoundException("Lesson not found.");

        var vocabulary = await dbContext.Vocabularies.SingleOrDefaultAsync(x => x.PublicId == request.VocabularyId, cancellationToken)
            ?? throw new KeyNotFoundException("Vocabulary not found.");

        if (lesson.Vocabularies.Any(x => x.VocabularyId == vocabulary.Id))
        {
            throw new ValidationException(new[] { new FluentValidation.Results.ValidationFailure("VocabularyId", "Vocabulary is already assigned to this lesson.") });
        }

        var lessonVocabulary = LessonVocabulary.Create(lesson.Id, vocabulary.Id, request.SortOrder);

        lesson.Vocabularies.Add(lessonVocabulary);
        LogAudit("ASSIGN_VOCABULARY", "Lesson", lessonId.ToString(), null, JsonSerializer.Serialize(request));

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveVocabularyAsync(Guid lessonId, Guid vocabularyId, CancellationToken cancellationToken)
    {
        var lesson = await dbContext.Lessons.Include(x => x.Vocabularies).ThenInclude(x => x.Vocabulary).SingleOrDefaultAsync(x => x.PublicId == lessonId, cancellationToken)
            ?? throw new KeyNotFoundException("Lesson not found.");

        var lessonVocab = lesson.Vocabularies.SingleOrDefault(x => x.Vocabulary.PublicId == vocabularyId)
            ?? throw new KeyNotFoundException("Vocabulary not found in this lesson.");

        lesson.Vocabularies.Remove(lessonVocab);
        LogAudit("REMOVE_VOCABULARY", "Lesson", lessonId.ToString(), null, vocabularyId.ToString());

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateVocabularyOrderAsync(Guid lessonId, UpdateVocabularyOrderRequest request, CancellationToken cancellationToken)
    {
        await orderValidator.ValidateAndThrowAsync(request, cancellationToken);

        var lesson = await dbContext.Lessons.Include(x => x.Vocabularies).ThenInclude(x => x.Vocabulary).SingleOrDefaultAsync(x => x.PublicId == lessonId, cancellationToken)
            ?? throw new KeyNotFoundException("Lesson not found.");

        int order = 0;
        foreach (var vid in request.VocabularyIds)
        {
            var lv = lesson.Vocabularies.SingleOrDefault(x => x.Vocabulary.PublicId == vid);
            if (lv != null)
            {
                lv.UpdateOrder(order);
            }
            order++;
        }

        LogAudit("UPDATE_VOCAB_ORDER", "Lesson", lessonId.ToString(), null, JsonSerializer.Serialize(request));
        
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private void LogAudit(string action, string entityType, string? entityId, string? before, string? after)
    {
        var log = AuditLog.Create(currentUserService.UserId, action, entityType, entityId, before, after);
        dbContext.AuditLogs.Add(log);
    }

    private static LessonDto MapToDto(Lesson l, Guid? overrideTopicId = null) =>
        new(l.PublicId, overrideTopicId ?? l.Topic?.PublicId ?? Guid.Empty, l.Slug, l.TitleVi, l.DescriptionVi, l.EstimatedMinutes, l.SortOrder, l.Status, l.IsDeleted, l.CreatedAt, l.UpdatedAt);

    private static LessonWithVocabulariesDto MapToWithVocabulariesDto(Lesson l)
    {
        var vocabDtos = l.Vocabularies.OrderBy(x => x.SortOrder).Select(lv => new VocabularyDto(
            lv.Vocabulary.PublicId,
            lv.Vocabulary.Topic?.PublicId ?? Guid.Empty,
            lv.Vocabulary.Simplified,
            lv.Vocabulary.Traditional,
            lv.Vocabulary.Pinyin,
            lv.Vocabulary.MeaningVi,
            lv.Vocabulary.PartOfSpeech,
            lv.Vocabulary.AudioUrl,
            lv.Vocabulary.ImageUrl,
            lv.Vocabulary.HskLevel,
            lv.Vocabulary.Status,
            lv.Vocabulary.IsDeleted,
            lv.Vocabulary.CreatedAt,
            lv.Vocabulary.UpdatedAt
        )).ToList();

        return new LessonWithVocabulariesDto(
            l.PublicId, l.Topic?.PublicId ?? Guid.Empty, l.Slug, l.TitleVi, l.DescriptionVi, l.EstimatedMinutes, l.SortOrder, l.Status, l.IsDeleted, l.CreatedAt, l.UpdatedAt, vocabDtos);
    }
}
