namespace ChineseLearning.Application.Features.Vocabularies.DTOs;

public sealed record PublicVocabularyDto(
    Guid Id,
    Guid TopicId,
    string Simplified,
    string? Traditional,
    string Pinyin,
    string MeaningVi,
    string? PartOfSpeech,
    string? AudioUrl,
    string? ImageUrl,
    int HskLevel);
