using System.Net.Http.Json;
using ChineseLearning.Application.Features.Authentication.DTOs;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace ChineseLearning.IntegrationTests;

public sealed class AuthEndpointTests : IClassFixture<IntegrationTestWebAppFactory>
{
    private readonly HttpClient _client;
    private readonly IntegrationTestWebAppFactory _factory;

    public AuthEndpointTests(IntegrationTestWebAppFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task RegisterAndLogin_ReturnsTokens()
    {
        // Arrange
        var email = $"test_{Guid.NewGuid()}@example.com";
        var password = "TestUser123!";
        var registerRequest = new RegisterRequest(email, password, "Test User");

        // Act - Register
        using var registerResponse = await _client.PostAsJsonAsync("/api/v1/auth/register", registerRequest);
        
        if (!registerResponse.IsSuccessStatusCode)
        {
            var errorContent = await registerResponse.Content.ReadAsStringAsync();
            Assert.Fail($"Status: {registerResponse.StatusCode}, Content: {errorContent}");
        }
        registerResponse.EnsureSuccessStatusCode();
        var registerData = await registerResponse.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(registerData);
        Assert.NotNull(registerData.AccessToken);
        Assert.NotNull(registerData.RefreshToken);

        // Act - Login
        var loginRequest = new LoginRequest(email, password);
        using var loginResponse = await _client.PostAsJsonAsync("/api/v1/auth/login", loginRequest);

        // Assert - Login
        loginResponse.EnsureSuccessStatusCode();
        var loginData = await loginResponse.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(loginData);
        Assert.NotNull(loginData.AccessToken);
        Assert.NotNull(loginData.RefreshToken);

        // Assert - Database User Record and Role
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ChineseLearning.Infrastructure.Persistence.ApplicationDbContext>();
        
        var dbUser = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.SingleOrDefaultAsync(
            db.Users, u => u.Email == email);
            
        Assert.NotNull(dbUser);
        Assert.Equal(email, dbUser.Email);
        Assert.Equal(email, dbUser.UserName);

        var userRole = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.SingleOrDefaultAsync(
            db.UserRoles, ur => ur.UserId == dbUser.Id);
        Assert.NotNull(userRole);
        
        // Act - Refresh
        var refreshRequest = new RefreshTokenRequest(loginData.RefreshToken);
        using var refreshResponse = await _client.PostAsJsonAsync("/api/v1/auth/refresh", refreshRequest);
        
        // Assert - Refresh
        refreshResponse.EnsureSuccessStatusCode();
        var refreshData = await refreshResponse.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(refreshData);
        Assert.NotNull(refreshData.AccessToken);
    }
}
