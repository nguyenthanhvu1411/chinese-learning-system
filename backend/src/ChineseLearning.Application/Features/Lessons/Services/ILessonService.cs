using ChineseLearning.Application.Common.Models;
using ChineseLearning.Application.Features.Lessons.DTOs;

namespace ChineseLearning.Application.Features.Lessons.Services;

public interface ILessonService
{
    Task<LessonWithVocabulariesDto> GetByIdAsync(Guid publicId, CancellationToken cancellationToken);
    Task<PagedList<LessonDto>> GetPagedAsync(GetLessonsQuery query, CancellationToken cancellationToken);
    Task<PagedList<LessonDto>> GetTrashAsync(GetLessonsQuery query, CancellationToken cancellationToken);
    Task<LessonDto> CreateAsync(CreateLessonRequest request, CancellationToken cancellationToken);
    Task<LessonDto> UpdateAsync(Guid publicId, UpdateLessonRequest request, CancellationToken cancellationToken);
    Task<LessonDto> SoftDeleteAsync(Guid publicId, CancellationToken cancellationToken);
    Task<LessonDto> RestoreAsync(Guid publicId, CancellationToken cancellationToken);
    Task PermanentDeleteAsync(Guid publicId, CancellationToken cancellationToken);
    Task<LessonDto> PublishAsync(Guid publicId, CancellationToken cancellationToken);
    Task<LessonDto> UnpublishAsync(Guid publicId, CancellationToken cancellationToken);
    Task AssignVocabularyAsync(Guid publicId, AssignVocabularyRequest request, CancellationToken cancellationToken);
    Task RemoveVocabularyAsync(Guid publicId, Guid vocabularyPublicId, CancellationToken cancellationToken);
    Task UpdateVocabularyOrderAsync(Guid publicId, UpdateVocabularyOrderRequest request, CancellationToken cancellationToken);
}

public sealed record GetLessonsQuery(
    int PageNumber,
    int PageSize,
    string? Search,
    Guid? TopicId,
    string? SortBy,
    bool Descending);
