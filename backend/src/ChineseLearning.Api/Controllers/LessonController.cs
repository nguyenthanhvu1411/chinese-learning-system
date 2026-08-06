using ChineseLearning.Application.Common.Models;
using ChineseLearning.Application.Features.Lessons.DTOs;
using ChineseLearning.Application.Features.Lessons.Services;
using ChineseLearning.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChineseLearning.Api.Controllers;

[ApiController]
[Route("api/v1/admin/lessons")]
[Authorize(Roles = $"{Roles.ContentEditor},{Roles.Admin},{Roles.SuperAdmin}")]
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

    [HttpGet("{publicId:guid}")]
    public async Task<ActionResult<LessonWithVocabulariesDto>> GetById(Guid publicId, CancellationToken cancellationToken)
    {
        var result = await lessonService.GetByIdAsync(publicId, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<LessonDto>> Create([FromBody] CreateLessonRequest request, CancellationToken cancellationToken)
    {
        var result = await lessonService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { publicId = result.Id }, result);
    }

    [HttpPut("{publicId:guid}")]
    public async Task<ActionResult<LessonDto>> Update(Guid publicId, [FromBody] UpdateLessonRequest request, CancellationToken cancellationToken)
    {
        var result = await lessonService.UpdateAsync(publicId, request, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{publicId:guid}")]
    public async Task<ActionResult<LessonDto>> SoftDelete(Guid publicId, CancellationToken cancellationToken)
    {
        var result = await lessonService.SoftDeleteAsync(publicId, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{publicId:guid}/restore")]
    public async Task<ActionResult<LessonDto>> Restore(Guid publicId, CancellationToken cancellationToken)
    {
        var result = await lessonService.RestoreAsync(publicId, cancellationToken);
        return Ok(result);
    }

    [Authorize(Roles = Roles.SuperAdmin)]
    [HttpDelete("{publicId:guid}/permanent")]
    public async Task<IActionResult> PermanentDelete(Guid publicId, CancellationToken cancellationToken)
    {
        await lessonService.PermanentDeleteAsync(publicId, cancellationToken);
        return NoContent();
    }

    [HttpPost("{publicId:guid}/publish")]
    public async Task<ActionResult<LessonDto>> Publish(Guid publicId, CancellationToken cancellationToken)
    {
        var result = await lessonService.PublishAsync(publicId, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{publicId:guid}/unpublish")]
    public async Task<ActionResult<LessonDto>> Unpublish(Guid publicId, CancellationToken cancellationToken)
    {
        var result = await lessonService.UnpublishAsync(publicId, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{publicId:guid}/vocabularies")]
    public async Task<IActionResult> AssignVocabulary(Guid publicId, [FromBody] AssignVocabularyRequest request, CancellationToken cancellationToken)
    {
        await lessonService.AssignVocabularyAsync(publicId, request, cancellationToken);
        return Ok();
    }

    [HttpDelete("{publicId:guid}/vocabularies/{vocabularyPublicId:guid}")]
    public async Task<IActionResult> RemoveVocabulary(Guid publicId, Guid vocabularyPublicId, CancellationToken cancellationToken)
    {
        await lessonService.RemoveVocabularyAsync(publicId, vocabularyPublicId, cancellationToken);
        return Ok();
    }

    [HttpPut("{publicId:guid}/vocabularies/order")]
    public async Task<IActionResult> UpdateVocabularyOrder(Guid publicId, [FromBody] UpdateVocabularyOrderRequest request, CancellationToken cancellationToken)
    {
        await lessonService.UpdateVocabularyOrderAsync(publicId, request, cancellationToken);
        return Ok();
    }
}
