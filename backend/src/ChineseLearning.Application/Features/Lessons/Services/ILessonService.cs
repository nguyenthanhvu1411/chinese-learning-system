using ChineseLearning.Application.Common.Models;
using ChineseLearning.Application.Features.Lessons.DTOs;

namespace ChineseLearning.Application.Features.Lessons.Services;

public interface ILessonService
{
    Task<LessonWithVocabulariesDto> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<PagedList<LessonDto>> GetPagedAsync(GetLessonsQuery query, CancellationToken cancellationToken);
    Task<PagedList<LessonDto>> GetTrashAsync(GetLessonsQuery query, CancellationToken cancellationToken);
    Task<LessonDto> CreateAsync(CreateLessonRequest request, CancellationToken cancellationToken);
    Task<LessonDto> UpdateAsync(Guid id, UpdateLessonRequest request, CancellationToken cancellationToken);
    Task<LessonDto> SoftDeleteAsync(Guid id, CancellationToken cancellationToken);
    Task<LessonDto> RestoreAsync(Guid id, CancellationToken cancellationToken);
    Task PermanentDeleteAsync(Guid id, CancellationToken cancellationToken);
    Task<LessonDto> PublishAsync(Guid id, CancellationToken cancellationToken);
    Task<LessonDto> UnpublishAsync(Guid id, CancellationToken cancellationToken);
    Task AssignVocabularyAsync(Guid lessonId, AssignVocabularyRequest request, CancellationToken cancellationToken);
    Task RemoveVocabularyAsync(Guid lessonId, Guid vocabularyId, CancellationToken cancellationToken);
    Task UpdateVocabularyOrderAsync(Guid lessonId, UpdateVocabularyOrderRequest request, CancellationToken cancellationToken);
}

public sealed record GetLessonsQuery(
    int PageNumber,
    int PageSize,
    string? Search,
    Guid? TopicId,
    string? SortBy,
    bool Descending);
