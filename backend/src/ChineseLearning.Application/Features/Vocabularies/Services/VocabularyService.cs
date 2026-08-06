using ChineseLearning.Application.Abstractions.Authentication;
using ChineseLearning.Application.Abstractions.Persistence;
using ChineseLearning.Application.Common.Models;
using ChineseLearning.Application.Features.Vocabularies.DTOs;
using ChineseLearning.Domain.Entities;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ChineseLearning.Application.Features.Vocabularies.Services;

public sealed class VocabularyService(
    IApplicationDbContext dbContext,
    IValidator<CreateVocabularyRequest> createValidator,
    IValidator<UpdateVocabularyRequest> updateValidator,
    ICurrentUserService currentUserService) : IVocabularyService
{
    public async Task<VocabularyDto> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var vocabulary = await dbContext.Vocabularies.Include(x => x.Topic).SingleOrDefaultAsync(x => x.PublicId == id, cancellationToken)
            ?? throw new KeyNotFoundException("Vocabulary not found.");
            
        return MapToDto(vocabulary);
    }

    public async Task<PagedList<VocabularyDto>> GetPagedAsync(GetVocabulariesQuery query, CancellationToken cancellationToken)
    {
        var dbQuery = dbContext.Vocabularies.Include(x => x.Topic).AsNoTracking();

        if (query.TopicId.HasValue)
            dbQuery = dbQuery.Where(x => x.Topic.PublicId == query.TopicId.Value);

        if (query.HskLevel.HasValue)
            dbQuery = dbQuery.Where(x => x.HskLevel == query.HskLevel.Value);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            dbQuery = dbQuery.Where(x => x.Simplified.ToLower().Contains(search) || 
                                         x.Pinyin.ToLower().Contains(search) || 
                                         x.MeaningVi.ToLower().Contains(search));
        }

        dbQuery = query.SortBy?.ToLower() switch
        {
            "hsklevel" => query.Descending ? dbQuery.OrderByDescending(x => x.HskLevel) : dbQuery.OrderBy(x => x.HskLevel),
            "pinyin" => query.Descending ? dbQuery.OrderByDescending(x => x.Pinyin) : dbQuery.OrderBy(x => x.Pinyin),
            "createdat" => query.Descending ? dbQuery.OrderByDescending(x => x.CreatedAt) : dbQuery.OrderBy(x => x.CreatedAt),
            _ => query.Descending ? dbQuery.OrderByDescending(x => x.CreatedAt) : dbQuery.OrderBy(x => x.CreatedAt)
        };

        var count = await dbQuery.CountAsync(cancellationToken);
        var items = await dbQuery.Skip((query.PageNumber - 1) * query.PageSize).Take(query.PageSize).ToListAsync(cancellationToken);

        return new PagedList<VocabularyDto>(items.Select(x => MapToDto(x)).ToList(), count, query.PageNumber, query.PageSize);
    }

    public async Task<PagedList<VocabularyDto>> GetTrashAsync(GetVocabulariesQuery query, CancellationToken cancellationToken)
    {
        var dbQuery = dbContext.Vocabularies.IgnoreQueryFilters().Include(x => x.Topic).Where(x => x.IsDeleted).AsNoTracking();

        if (query.TopicId.HasValue)
            dbQuery = dbQuery.Where(x => x.Topic.PublicId == query.TopicId.Value);

        var count = await dbQuery.CountAsync(cancellationToken);
        var items = await dbQuery.OrderByDescending(x => x.DeletedAt)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedList<VocabularyDto>(items.Select(x => MapToDto(x)).ToList(), count, query.PageNumber, query.PageSize);
    }

    public async Task<VocabularyDto> CreateAsync(CreateVocabularyRequest request, CancellationToken cancellationToken)
    {
        await createValidator.ValidateAndThrowAsync(request, cancellationToken);

        var exists = await dbContext.Vocabularies.AnyAsync(x => x.Simplified == request.Simplified && x.Pinyin == request.Pinyin && x.HskLevel == request.HskLevel, cancellationToken);
        if (exists)
            throw new ValidationException(new[] { new FluentValidation.Results.ValidationFailure("Simplified", "Vocabulary with same Simplified, Pinyin and HskLevel already exists.") });

        var topic = await dbContext.Topics.SingleOrDefaultAsync(x => x.PublicId == request.TopicId, cancellationToken)
            ?? throw new KeyNotFoundException("Topic not found.");

        var vocabulary = Vocabulary.Create(topic.Id, request.Simplified, request.Traditional, request.Pinyin, request.MeaningVi, request.HskLevel);
        vocabulary.Update(request.Simplified, request.Traditional, request.Pinyin, request.MeaningVi, request.PartOfSpeech, request.AudioUrl, request.ImageUrl, request.HskLevel);
        
        dbContext.Vocabularies.Add(vocabulary);
        
        LogAudit("CREATE", "Vocabulary", null, null, JsonSerializer.Serialize(request));

        await dbContext.SaveChangesAsync(cancellationToken);
        return MapToDto(vocabulary, request.TopicId);
    }

    public async Task<VocabularyDto> UpdateAsync(Guid id, UpdateVocabularyRequest request, CancellationToken cancellationToken)
    {
        await updateValidator.ValidateAndThrowAsync(request, cancellationToken);

        var vocabulary = await dbContext.Vocabularies.Include(x => x.Topic).SingleOrDefaultAsync(x => x.PublicId == id, cancellationToken)
            ?? throw new KeyNotFoundException("Vocabulary not found.");

        var exists = await dbContext.Vocabularies.AnyAsync(x => x.Simplified == request.Simplified && x.Pinyin == request.Pinyin && x.HskLevel == request.HskLevel && x.Id != vocabulary.Id, cancellationToken);
        if (exists)
            throw new ValidationException(new[] { new FluentValidation.Results.ValidationFailure("Simplified", "Vocabulary with same Simplified, Pinyin and HskLevel already exists.") });

        var beforeJson = JsonSerializer.Serialize(MapToDto(vocabulary));

        vocabulary.Update(request.Simplified, request.Traditional, request.Pinyin, request.MeaningVi, request.PartOfSpeech, request.AudioUrl, request.ImageUrl, request.HskLevel);
        
        LogAudit("UPDATE", "Vocabulary", id.ToString(), beforeJson, JsonSerializer.Serialize(request));

        await dbContext.SaveChangesAsync(cancellationToken);
        return MapToDto(vocabulary);
    }

    public async Task<VocabularyDto> SoftDeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var vocabulary = await dbContext.Vocabularies.Include(x => x.Topic).SingleOrDefaultAsync(x => x.PublicId == id, cancellationToken)
            ?? throw new KeyNotFoundException("Vocabulary not found.");

        var beforeJson = JsonSerializer.Serialize(MapToDto(vocabulary));
        vocabulary.SoftDelete();
        
        LogAudit("SOFT_DELETE", "Vocabulary", id.ToString(), beforeJson, null);

        await dbContext.SaveChangesAsync(cancellationToken);
        return MapToDto(vocabulary);
    }

    public async Task<VocabularyDto> RestoreAsync(Guid id, CancellationToken cancellationToken)
    {
        var vocabulary = await dbContext.Vocabularies.IgnoreQueryFilters().Include(x => x.Topic).SingleOrDefaultAsync(x => x.PublicId == id && x.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Vocabulary not found in trash.");

        vocabulary.Restore();
        
        LogAudit("RESTORE", "Vocabulary", id.ToString(), null, null);

        await dbContext.SaveChangesAsync(cancellationToken);
        return MapToDto(vocabulary);
    }

    public async Task PermanentDeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var vocabulary = await dbContext.Vocabularies.IgnoreQueryFilters().Include(x => x.Topic).SingleOrDefaultAsync(x => x.PublicId == id, cancellationToken)
            ?? throw new KeyNotFoundException("Vocabulary not found.");

        var beforeJson = JsonSerializer.Serialize(MapToDto(vocabulary));
        dbContext.Vocabularies.Remove(vocabulary);
        
        LogAudit("PERMANENT_DELETE", "Vocabulary", id.ToString(), beforeJson, null);

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<VocabularyDto> PublishAsync(Guid id, CancellationToken cancellationToken)
    {
        var vocabulary = await dbContext.Vocabularies.Include(x => x.Topic).SingleOrDefaultAsync(x => x.PublicId == id, cancellationToken)
            ?? throw new KeyNotFoundException("Vocabulary not found.");

        vocabulary.Publish();
        
        LogAudit("PUBLISH", "Vocabulary", id.ToString(), null, null);

        await dbContext.SaveChangesAsync(cancellationToken);
        return MapToDto(vocabulary);
    }

    public async Task<VocabularyDto> UnpublishAsync(Guid id, CancellationToken cancellationToken)
    {
        var vocabulary = await dbContext.Vocabularies.Include(x => x.Topic).SingleOrDefaultAsync(x => x.PublicId == id, cancellationToken)
            ?? throw new KeyNotFoundException("Vocabulary not found.");

        vocabulary.Unpublish();
        
        LogAudit("UNPUBLISH", "Vocabulary", id.ToString(), null, null);

        await dbContext.SaveChangesAsync(cancellationToken);
        return MapToDto(vocabulary);
    }

    private void LogAudit(string action, string entityType, string? entityId, string? before, string? after)
    {
        var log = AuditLog.Create(currentUserService.UserId, action, entityType, entityId, before, after);
        dbContext.AuditLogs.Add(log);
    }

    private static VocabularyDto MapToDto(Vocabulary v, Guid? overrideTopicId = null) =>
        new(v.PublicId, overrideTopicId ?? v.Topic?.PublicId ?? Guid.Empty, v.Simplified, v.Traditional, v.Pinyin, v.MeaningVi, v.PartOfSpeech, v.AudioUrl, v.ImageUrl, v.HskLevel, v.Status, v.IsDeleted, v.CreatedAt, v.UpdatedAt);
}
