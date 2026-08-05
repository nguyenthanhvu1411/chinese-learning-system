using ChineseLearning.Application.Common.Models;
using ChineseLearning.Application.Features.Vocabularies.DTOs;

namespace ChineseLearning.Application.Features.Vocabularies.Services;

public interface IPublicVocabularyService
{
    Task<PagedList<PublicVocabularyDto>> GetPagedAsync(GetVocabulariesQuery query, CancellationToken cancellationToken);
    Task<PublicVocabularyDto> GetByIdAsync(Guid id, CancellationToken cancellationToken);
}
