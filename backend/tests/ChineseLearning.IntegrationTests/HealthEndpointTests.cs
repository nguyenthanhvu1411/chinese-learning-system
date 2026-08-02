using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace ChineseLearning.IntegrationTests;

public sealed class HealthEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public HealthEndpointTests(WebApplicationFactory<Program> factory) => _client = factory.CreateClient();

    [Fact]
    public async Task Liveness_ReturnsSuccessAndCorrelationId()
    {
        using var response = await _client.GetAsync("/health/live");

        response.EnsureSuccessStatusCode();
        Assert.True(response.Headers.Contains("X-Correlation-ID"));
    }
}
