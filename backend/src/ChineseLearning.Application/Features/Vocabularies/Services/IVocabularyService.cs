using ChineseLearning.Application.Common.Models;
using ChineseLearning.Application.Features.Vocabularies.DTOs;

namespace ChineseLearning.Application.Features.Vocabularies.Services;

public interface IVocabularyService
{
    Task<VocabularyDto> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<PagedList<VocabularyDto>> GetPagedAsync(GetVocabulariesQuery query, CancellationToken cancellationToken);
    Task<PagedList<VocabularyDto>> GetTrashAsync(GetVocabulariesQuery query, CancellationToken cancellationToken);
    Task<VocabularyDto> CreateAsync(CreateVocabularyRequest request, CancellationToken cancellationToken);
    Task<VocabularyDto> UpdateAsync(Guid id, UpdateVocabularyRequest request, CancellationToken cancellationToken);
    Task<VocabularyDto> SoftDeleteAsync(Guid id, CancellationToken cancellationToken);
    Task<VocabularyDto> RestoreAsync(Guid id, CancellationToken cancellationToken);
    Task PermanentDeleteAsync(Guid id, CancellationToken cancellationToken);
    Task<VocabularyDto> PublishAsync(Guid id, CancellationToken cancellationToken);
    Task<VocabularyDto> UnpublishAsync(Guid id, CancellationToken cancellationToken);
}
