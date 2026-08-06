using ChineseLearning.Application.Common.Models;
using ChineseLearning.Application.Features.Lessons.DTOs;

namespace ChineseLearning.Application.Features.Lessons.Services;

public interface IPublicLessonService
{
    Task<PagedList<LessonDto>> GetPagedAsync(int pageNumber, int pageSize, string? topicSlug, CancellationToken cancellationToken);
    Task<LessonWithVocabulariesDto> GetBySlugAsync(string slug, CancellationToken cancellationToken);
}
