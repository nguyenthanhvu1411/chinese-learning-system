using ChineseLearning.Application.Abstractions.Persistence;
using ChineseLearning.Application.Common.Models;
using ChineseLearning.Application.Features.Vocabularies.DTOs;
using ChineseLearning.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace ChineseLearning.Application.Features.Vocabularies.Services;

public sealed class PublicVocabularyService(IApplicationDbContext dbContext) : IPublicVocabularyService
{
    public async Task<PublicVocabularyDto> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var vocabulary = await dbContext.Vocabularies.Include(x => x.Topic).SingleOrDefaultAsync(x => x.PublicId == id && x.Status == ContentStatus.Published, cancellationToken)
            ?? throw new KeyNotFoundException("Vocabulary not found.");
            
        return new PublicVocabularyDto(
            vocabulary.PublicId, 
            vocabulary.Topic.PublicId, 
            vocabulary.Simplified, 
            vocabulary.Traditional, 
            vocabulary.Pinyin, 
            vocabulary.MeaningVi, 
            vocabulary.PartOfSpeech, 
            vocabulary.AudioUrl, 
            vocabulary.ImageUrl, 
            vocabulary.HskLevel);
    }

    public async Task<PagedList<PublicVocabularyDto>> GetPagedAsync(GetVocabulariesQuery query, CancellationToken cancellationToken)
    {
        var dbQuery = dbContext.Vocabularies.Include(x => x.Topic).Where(x => x.Status == ContentStatus.Published).AsNoTracking();

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

        var dtos = items.Select(vocabulary => new PublicVocabularyDto(
            vocabulary.PublicId, 
            vocabulary.Topic.PublicId, 
            vocabulary.Simplified, 
            vocabulary.Traditional, 
            vocabulary.Pinyin, 
            vocabulary.MeaningVi, 
            vocabulary.PartOfSpeech, 
            vocabulary.AudioUrl, 
            vocabulary.ImageUrl, 
            vocabulary.HskLevel)).ToList();

        return new PagedList<PublicVocabularyDto>(dtos, count, query.PageNumber, query.PageSize);
    }
}
