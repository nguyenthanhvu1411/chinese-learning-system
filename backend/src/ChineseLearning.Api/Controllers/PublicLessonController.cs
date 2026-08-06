using ChineseLearning.Application.Common.Models;
using ChineseLearning.Application.Features.Lessons.DTOs;
using ChineseLearning.Application.Features.Lessons.Services;
using Microsoft.AspNetCore.Mvc;

namespace ChineseLearning.Api.Controllers;

[ApiController]
[Route("api/v1/lessons")]
public class PublicLessonController(IPublicLessonService lessonService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedList<LessonDto>>> GetPaged([FromQuery] int page = 1, [FromQuery] int size = 10, [FromQuery] string? topic = null, CancellationToken cancellationToken = default)
    {
        var result = await lessonService.GetPagedAsync(page, size, topic, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<LessonWithVocabulariesDto>> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var result = await lessonService.GetBySlugAsync(slug, cancellationToken);
        return Ok(result);
    }
}
