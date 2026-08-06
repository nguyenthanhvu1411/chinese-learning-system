using ChineseLearning.Domain.Constants;

namespace ChineseLearning.Application.Features.Vocabularies.DTOs;

public sealed record VocabularyDto(
    Guid Id,
    Guid TopicId,
    string Simplified,
    string? Traditional,
    string Pinyin,
    string MeaningVi,
    string? PartOfSpeech,
    string? AudioUrl,
    string? ImageUrl,
    int HskLevel,
    ContentStatus Status,
    bool IsDeleted,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt);

public sealed record CreateVocabularyRequest(
    Guid TopicId,
    string Simplified,
    string? Traditional,
    string Pinyin,
    string MeaningVi,
    string? PartOfSpeech,
    string? AudioUrl,
    string? ImageUrl,
    int HskLevel);

public sealed record UpdateVocabularyRequest(
    Guid TopicId,
    string Simplified,
    string? Traditional,
    string Pinyin,
    string MeaningVi,
    string? PartOfSpeech,
    string? AudioUrl,
    string? ImageUrl,
    int HskLevel);
