using System.Text.Json;
using ChineseLearning.Api.Middleware;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

namespace ChineseLearning.Api.Extensions;

public static class WebApplicationExtensions
{
    public static WebApplication UseApiPipeline(this WebApplication app)
    {
        app.UseMiddleware<CorrelationIdMiddleware>();
        app.UseExceptionHandler();
        app.UseCors();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();
        app.UseAuthentication();
        app.UseAuthorization();
        return app;
    }

    public static WebApplication MapSystemEndpoints(this WebApplication app)
    {
        app.MapGet("/api/v1", (HttpContext context) => Results.Ok(new
        {
            name = "Chinese Learning API",
            version = "v1",
            environment = app.Environment.EnvironmentName,
            correlationId = context.TraceIdentifier,
            status = "ready"
        })).WithTags("System");

        app.MapHealthChecks("/health/live", new HealthCheckOptions
        {
            Predicate = _ => false,
            ResponseWriter = WriteHealthResponse
        });
        app.MapHealthChecks("/health/ready", new HealthCheckOptions
        {
            ResponseWriter = WriteHealthResponse
        });
        return app;
    }

    private static Task WriteHealthResponse(
        HttpContext context,
        Microsoft.Extensions.Diagnostics.HealthChecks.HealthReport report)
    {
        context.Response.ContentType = "application/json";
        return context.Response.WriteAsync(JsonSerializer.Serialize(new
        {
            status = report.Status.ToString(),
            correlationId = context.TraceIdentifier
        }));
    }
}
