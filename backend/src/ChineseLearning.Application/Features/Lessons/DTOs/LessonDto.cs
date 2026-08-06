using ChineseLearning.Application.Features.Vocabularies.DTOs;
using ChineseLearning.Domain.Constants;

namespace ChineseLearning.Application.Features.Lessons.DTOs;

public sealed record LessonDto(
    Guid Id,
    Guid TopicId,
    string Slug,
    string TitleVi,
    string? DescriptionVi,
    int EstimatedMinutes,
    int SortOrder,
    ContentStatus Status,
    bool IsDeleted,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt);

public sealed record LessonWithVocabulariesDto(
    Guid Id,
    Guid TopicId,
    string Slug,
    string TitleVi,
    string? DescriptionVi,
    int EstimatedMinutes,
    int SortOrder,
    ContentStatus Status,
    bool IsDeleted,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt,
    List<VocabularyDto> Vocabularies);

public sealed record CreateLessonRequest(
    Guid TopicId,
    string TitleVi,
    string? DescriptionVi,
    int EstimatedMinutes,
    int SortOrder);

public sealed record UpdateLessonRequest(
    Guid TopicId,
    string TitleVi,
    string? DescriptionVi,
    int EstimatedMinutes,
    int SortOrder);

public sealed record AssignVocabularyRequest(
    Guid VocabularyId,
    int SortOrder);

public sealed record UpdateVocabularyOrderRequest(
    List<Guid> VocabularyIds);
