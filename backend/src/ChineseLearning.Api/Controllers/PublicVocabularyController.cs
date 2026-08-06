using ChineseLearning.Application.Common.Models;
using ChineseLearning.Application.Features.Vocabularies.DTOs;
using ChineseLearning.Application.Features.Vocabularies.Services;
using Microsoft.AspNetCore.Mvc;

namespace ChineseLearning.Api.Controllers;

[ApiController]
[Route("api/v1/vocabularies")]
public sealed class PublicVocabularyController(IPublicVocabularyService publicVocabularyService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedList<PublicVocabularyDto>>> GetPaged([FromQuery] GetVocabulariesQuery query, CancellationToken cancellationToken) =>
        Ok(await publicVocabularyService.GetPagedAsync(query, cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PublicVocabularyDto>> Get(Guid id, CancellationToken cancellationToken) =>
        Ok(await publicVocabularyService.GetByIdAsync(id, cancellationToken));
}
