using ChineseLearning.Application.Common.Models;
using ChineseLearning.Application.Features.Vocabularies.DTOs;
using ChineseLearning.Application.Features.Vocabularies.Services;
using ChineseLearning.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChineseLearning.Api.Controllers;

[ApiController]
[Route("api/v1/admin/vocabularies")]
[Authorize(Roles = $"{Roles.Admin},{Roles.ContentEditor},{Roles.SuperAdmin}")]
public sealed class VocabularyController(IVocabularyService vocabularyService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedList<VocabularyDto>>> GetPaged([FromQuery] GetVocabulariesQuery query, CancellationToken cancellationToken) =>
        Ok(await vocabularyService.GetPagedAsync(query, cancellationToken));

    [HttpGet("trash")]
    public async Task<ActionResult<PagedList<VocabularyDto>>> GetTrash([FromQuery] GetVocabulariesQuery query, CancellationToken cancellationToken) =>
        Ok(await vocabularyService.GetTrashAsync(query, cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<VocabularyDto>> Get(Guid id, CancellationToken cancellationToken) =>
        Ok(await vocabularyService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<VocabularyDto>> Create(CreateVocabularyRequest request, CancellationToken cancellationToken)
    {
        var result = await vocabularyService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<VocabularyDto>> Update(Guid id, UpdateVocabularyRequest request, CancellationToken cancellationToken) =>
        Ok(await vocabularyService.UpdateAsync(id, request, cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<VocabularyDto>> SoftDelete(Guid id, CancellationToken cancellationToken) =>
        Ok(await vocabularyService.SoftDeleteAsync(id, cancellationToken));

    [HttpPost("{id:guid}/restore")]
    public async Task<ActionResult<VocabularyDto>> Restore(Guid id, CancellationToken cancellationToken) =>
        Ok(await vocabularyService.RestoreAsync(id, cancellationToken));

    [HttpDelete("{id:guid}/permanent")]
    [Authorize(Roles = Roles.SuperAdmin)]
    public async Task<IActionResult> PermanentDelete(Guid id, CancellationToken cancellationToken)
    {
        await vocabularyService.PermanentDeleteAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/publish")]
    public async Task<ActionResult<VocabularyDto>> Publish(Guid id, CancellationToken cancellationToken) =>
        Ok(await vocabularyService.PublishAsync(id, cancellationToken));

    [HttpPost("{id:guid}/unpublish")]
    public async Task<ActionResult<VocabularyDto>> Unpublish(Guid id, CancellationToken cancellationToken) =>
        Ok(await vocabularyService.UnpublishAsync(id, cancellationToken));
}
