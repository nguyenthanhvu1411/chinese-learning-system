using ChineseLearning.Application.Abstractions.Persistence;
using ChineseLearning.Application.Common.Models;
using ChineseLearning.Application.Features.Lessons.DTOs;
using ChineseLearning.Application.Features.Vocabularies.DTOs;
using ChineseLearning.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace ChineseLearning.Application.Features.Lessons.Services;

public sealed class PublicLessonService(IApplicationDbContext dbContext) : IPublicLessonService
{
    public async Task<PagedList<LessonDto>> GetPagedAsync(int pageNumber, int pageSize, string? topicSlug, CancellationToken cancellationToken)
    {
        var dbQuery = dbContext.Lessons.Include(x => x.Topic)
            .Where(x => x.Status == ContentStatus.Published)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(topicSlug))
            dbQuery = dbQuery.Where(x => x.Topic.Slug == topicSlug.ToLower());

        dbQuery = dbQuery.OrderBy(x => x.SortOrder).ThenBy(x => x.CreatedAt);

        var count = await dbQuery.CountAsync(cancellationToken);
        var items = await dbQuery.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return new PagedList<LessonDto>(
            items.Select(x => new LessonDto(
                x.PublicId, x.Topic.PublicId, x.Slug, x.TitleVi, x.DescriptionVi, 
                x.EstimatedMinutes, x.SortOrder, x.Status, x.IsDeleted, x.CreatedAt, x.UpdatedAt
            )).ToList(), 
            count, pageNumber, pageSize);
    }

    public async Task<LessonWithVocabulariesDto> GetBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        var lesson = await dbContext.Lessons
            .Include(x => x.Topic)
            .Include(x => x.Vocabularies)
            .ThenInclude(lv => lv.Vocabulary)
            .ThenInclude(v => v.Topic)
            .Where(x => x.Status == ContentStatus.Published && x.Slug == slug.ToLower())
            .SingleOrDefaultAsync(cancellationToken)
            ?? throw new KeyNotFoundException("Lesson not found or not published.");

        var vocabDtos = lesson.Vocabularies
            .Where(lv => !lv.Vocabulary.IsDeleted && lv.Vocabulary.Status == ContentStatus.Published)
            .OrderBy(lv => lv.SortOrder)
            .Select(lv => new VocabularyDto(
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
            lesson.PublicId, 
            lesson.Topic?.PublicId ?? Guid.Empty, 
            lesson.Slug, 
            lesson.TitleVi, 
            lesson.DescriptionVi, 
            lesson.EstimatedMinutes, 
            lesson.SortOrder, 
            lesson.Status, 
            lesson.IsDeleted, 
            lesson.CreatedAt, 
            lesson.UpdatedAt, 
            vocabDtos);
    }
}
