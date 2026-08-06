using ChineseLearning.Application.Common.Models;
using ChineseLearning.Application.Features.Lessons.DTOs;
using ChineseLearning.Application.Features.Lessons.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChineseLearning.Api.Controllers;

[ApiController]
[Route("api/v1/admin/lessons")]
[Authorize] // Assuming admin only for now. Add policy if needed.
public class LessonController(ILessonService lessonService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedList<LessonDto>>> GetPaged([FromQuery] int page = 1, [FromQuery] int size = 10, [FromQuery] string? search = null, [FromQuery] Guid? topicId = null, [FromQuery] string? sortBy = null, [FromQuery] bool desc = false, CancellationToken cancellationToken = default)
    {
        var query = new GetLessonsQuery(page, size, search, topicId, sortBy, desc);
        var result = await lessonService.GetPagedAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("trash")]
    public async Task<ActionResult<PagedList<LessonDto>>> GetTrash([FromQuery] int page = 1, [FromQuery] int size = 10, [FromQuery] Guid? topicId = null, CancellationToken cancellationToken = default)
    {
        var query = new GetLessonsQuery(page, size, null, topicId, null, false);
        var result = await lessonService.GetTrashAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<LessonWithVocabulariesDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await lessonService.GetByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<LessonDto>> Create([FromBody] CreateLessonRequest request, CancellationToken cancellationToken)
    {
        var result = await lessonService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<LessonDto>> Update(Guid id, [FromBody] UpdateLessonRequest request, CancellationToken cancellationToken)
    {
        var result = await lessonService.UpdateAsync(id, request, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<LessonDto>> SoftDelete(Guid id, CancellationToken cancellationToken)
    {
        var result = await lessonService.SoftDeleteAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:guid}/restore")]
    public async Task<ActionResult<LessonDto>> Restore(Guid id, CancellationToken cancellationToken)
    {
        var result = await lessonService.RestoreAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:guid}/permanent")]
    public async Task<IActionResult> PermanentDelete(Guid id, CancellationToken cancellationToken)
    {
        await lessonService.PermanentDeleteAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/publish")]
    public async Task<ActionResult<LessonDto>> Publish(Guid id, CancellationToken cancellationToken)
    {
        var result = await lessonService.PublishAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:guid}/unpublish")]
    public async Task<ActionResult<LessonDto>> Unpublish(Guid id, CancellationToken cancellationToken)
    {
        var result = await lessonService.UnpublishAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:guid}/vocabularies")]
    public async Task<IActionResult> AssignVocabulary(Guid id, [FromBody] AssignVocabularyRequest request, CancellationToken cancellationToken)
    {
        await lessonService.AssignVocabularyAsync(id, request, cancellationToken);
        return Ok();
    }

    [HttpDelete("{id:guid}/vocabularies/{vocabularyId:guid}")]
    public async Task<IActionResult> RemoveVocabulary(Guid id, Guid vocabularyId, CancellationToken cancellationToken)
    {
        await lessonService.RemoveVocabularyAsync(id, vocabularyId, cancellationToken);
        return Ok();
    }

    [HttpPut("{id:guid}/vocabularies/order")]
    public async Task<IActionResult> UpdateVocabularyOrder(Guid id, [FromBody] UpdateVocabularyOrderRequest request, CancellationToken cancellationToken)
    {
        await lessonService.UpdateVocabularyOrderAsync(id, request, cancellationToken);
        return Ok();
    }
}
