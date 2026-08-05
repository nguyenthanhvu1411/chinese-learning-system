using ChineseLearning.Application.Common.Models;

namespace ChineseLearning.Application.Features.Vocabularies.DTOs;

public sealed record GetVocabulariesQuery(
    int PageNumber = 1, 
    int PageSize = 10, 
    string? Search = null, 
    int? HskLevel = null, 
    Guid? TopicId = null, 
    string? SortBy = null, 
    bool Descending = false);
