using System.Net;
using System.Net.Http.Json;
using ChineseLearning.Application.Features.Vocabularies.DTOs;
using ChineseLearning.Domain.Constants;
using ChineseLearning.Domain.Entities;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace ChineseLearning.IntegrationTests.Endpoints;

public sealed class VocabularyEndpointTests : IClassFixture<IntegrationTestWebAppFactory>, IAsyncLifetime
{
    private readonly IntegrationTestWebAppFactory _factory;
    private readonly HttpClient _client;
    
    public VocabularyEndpointTests(IntegrationTestWebAppFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    public Task InitializeAsync() => Task.CompletedTask;

    public async Task DisposeAsync()
    {
        await _factory.ResetDatabaseAsync();
    }

    private async Task<string> GetAdminTokenAsync()
    {
        var email = "admin@hanyu.local";
        var password = "Password123!";
        await EnsureAdminUserExistsAsync(email, password);
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", new { Email = email, Password = password });
        var result = await response.Content.ReadFromJsonAsync<ChineseLearning.Application.Features.Authentication.DTOs.AuthResponse>();
        return result?.AccessToken ?? string.Empty;
    }

    private async Task EnsureAdminUserExistsAsync(string email, string password)
    {
        using var scope = _factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<Microsoft.AspNetCore.Identity.UserManager<ChineseLearning.Domain.Entities.ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<Microsoft.AspNetCore.Identity.RoleManager<Microsoft.AspNetCore.Identity.IdentityRole<Guid>>>();
        
        var user = await userManager.FindByEmailAsync(email);
        if (user == null)
        {
            user = new ChineseLearning.Domain.Entities.ApplicationUser { UserName = email, Email = email };
            await userManager.CreateAsync(user, password);
            if (!await roleManager.RoleExistsAsync(ChineseLearning.Domain.Constants.Roles.Admin))
                await roleManager.CreateAsync(new Microsoft.AspNetCore.Identity.IdentityRole<Guid>(ChineseLearning.Domain.Constants.Roles.Admin));
            await userManager.AddToRoleAsync(user, ChineseLearning.Domain.Constants.Roles.Admin);
        }
    }

    private async Task<string> GetUserTokenAsync()
    {
        var email = $"test_{Guid.NewGuid()}@example.com";
        var password = "Password123!";
        var regResp = await _client.PostAsJsonAsync("/api/v1/auth/register", new { Email = email, Password = password, DisplayName = "Test User" });
        regResp.EnsureSuccessStatusCode();
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", new { Email = email, Password = password });
        var result = await response.Content.ReadFromJsonAsync<ChineseLearning.Application.Features.Authentication.DTOs.AuthResponse>();
        return result?.AccessToken ?? string.Empty;
    }

    private async Task<Topic> EnsureTopicExistsAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ChineseLearning.Infrastructure.Persistence.ApplicationDbContext>();
        var topic = await db.Topics.FirstOrDefaultAsync(t => t.NameVi == "Test Topic");
        if (topic == null)
        {
            topic = Topic.Create("Test Topic", "Test Description");
            db.Topics.Add(topic);
            await db.SaveChangesAsync();
        }
        return topic;
    }

    [Fact]
    public async Task GetVocabularies_UnauthorizedUser_ReturnsForbidden()
    {
        var token = await GetUserTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var response = await _client.GetAsync("/api/v1/admin/vocabularies");
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task CreateVocabulary_AsAdmin_Success()
    {
        var token = await GetAdminTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var topic = await EnsureTopicExistsAsync();

        var request = new CreateVocabularyRequest(
            topic.PublicId,
            "狗",
            "狗",
            "gǒu",
            "dog",
            "noun",
            null,
            null,
            1
        );

        var response = await _client.PostAsJsonAsync("/api/v1/admin/vocabularies", request);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();
            throw new Exception($"Failed: {response.StatusCode} - {err}");
        }
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var created = await response.Content.ReadFromJsonAsync<VocabularyDto>();
        created.Should().NotBeNull();
        created!.Simplified.Should().Be("狗");
        created.Status.Should().Be(ContentStatus.Draft);
    }

    [Fact]
    public async Task CreateVocabulary_InvalidData_ReturnsProblemDetails()
    {
        var token = await GetAdminTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var topic = await EnsureTopicExistsAsync();

        var request = new CreateVocabularyRequest(
            topic.PublicId,
            "", // Empty simplified
            null,
            "nǐ hǎo",
            "hello",
            null,
            null,
            null,
            10 // HskLevel > 9
        );

        var response = await _client.PostAsJsonAsync("/api/v1/admin/vocabularies", request);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var problemDetails = await response.Content.ReadFromJsonAsync<Microsoft.AspNetCore.Mvc.ProblemDetails>();
        problemDetails.Should().NotBeNull();
        problemDetails!.Title.Should().Contain("Validation");
    }

    [Fact]
    public async Task SoftDelete_Vocabulary_MovesToTrash()
    {
        var token = await GetAdminTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var topic = await EnsureTopicExistsAsync();

        var request = new CreateVocabularyRequest(
            topic.PublicId,
            "谢谢",
            null,
            "xièxiè",
            "thank you",
            null,
            null,
            null,
            1
        );

        var createResponse = await _client.PostAsJsonAsync("/api/v1/admin/vocabularies", request);
        var created = await createResponse.Content.ReadFromJsonAsync<VocabularyDto>();

        // Soft delete
        var deleteResponse = await _client.DeleteAsync($"/api/v1/admin/vocabularies/{created!.Id}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify not in list
        var listResponse = await _client.GetAsync("/api/v1/admin/vocabularies");
        var list = await listResponse.Content.ReadFromJsonAsync<ChineseLearning.Application.Common.Models.PagedList<VocabularyDto>>();
        list!.Items.Should().NotContain(x => x.Id == created.Id);

        // Verify in trash
        var trashResponse = await _client.GetAsync("/api/v1/admin/vocabularies/trash");
        var trash = await trashResponse.Content.ReadFromJsonAsync<ChineseLearning.Application.Common.Models.PagedList<VocabularyDto>>();
        trash!.Items.Should().Contain(x => x.Id == created.Id);
    }

    [Fact]
    public async Task UpdateVocabulary_AsAdmin_Success()
    {
        var token = await GetAdminTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var topic = await EnsureTopicExistsAsync();

        var createRequest = new CreateVocabularyRequest(topic.PublicId, "苹果", null, "píngguǒ", "apple", null, null, null, 1);
        var createResponse = await _client.PostAsJsonAsync("/api/v1/admin/vocabularies", createRequest);
        var created = await createResponse.Content.ReadFromJsonAsync<VocabularyDto>();

        var updateRequest = new UpdateVocabularyRequest(topic.PublicId, "猫", null, "māo", "cat modified", "noun", null, null, 1);
        var updateResponse = await _client.PutAsJsonAsync($"/api/v1/admin/vocabularies/{created!.Id}", updateRequest);
        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var updated = await updateResponse.Content.ReadFromJsonAsync<VocabularyDto>();
        updated.Should().NotBeNull();
        updated!.Pinyin.Should().Be("māo");
        updated.MeaningVi.Should().Be("cat modified");
    }

    [Fact]
    public async Task Publish_Unpublish_Vocabulary_Success()
    {
        var token = await GetAdminTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var topic = await EnsureTopicExistsAsync();

        var createRequest = new CreateVocabularyRequest(topic.PublicId, "水", null, "shuǐ", "water", null, null, null, 1);
        var createResponse = await _client.PostAsJsonAsync("/api/v1/admin/vocabularies", createRequest);
        var created = await createResponse.Content.ReadFromJsonAsync<VocabularyDto>();

        // Publish
        var publishResponse = await _client.PostAsync($"/api/v1/admin/vocabularies/{created!.Id}/publish", null);
        publishResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var published = await publishResponse.Content.ReadFromJsonAsync<VocabularyDto>();
        published!.Status.Should().Be(ContentStatus.Published);

        // Unpublish
        var unpublishResponse = await _client.PostAsync($"/api/v1/admin/vocabularies/{created.Id}/unpublish", null);
        unpublishResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var unpublished = await unpublishResponse.Content.ReadFromJsonAsync<VocabularyDto>();
        unpublished!.Status.Should().Be(ContentStatus.Draft);
    }
}
