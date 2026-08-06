using System.Net;
using System.Net.Http.Json;
using ChineseLearning.Application.Features.Lessons.DTOs;
using ChineseLearning.Application.Features.Vocabularies.DTOs;
using ChineseLearning.Domain.Constants;
using ChineseLearning.Domain.Entities;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace ChineseLearning.IntegrationTests.Endpoints;

public sealed class LessonEndpointTests : IClassFixture<IntegrationTestWebAppFactory>, IAsyncLifetime
{
    private readonly IntegrationTestWebAppFactory _factory;
    private readonly HttpClient _client;
    
    public LessonEndpointTests(IntegrationTestWebAppFactory factory)
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
        await EnsureAdminUserExistsAsync(email, password, Roles.Admin);
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", new { Email = email, Password = password });
        var result = await response.Content.ReadFromJsonAsync<ChineseLearning.Application.Features.Authentication.DTOs.AuthResponse>();
        return result?.AccessToken ?? string.Empty;
    }

    private async Task<string> GetSuperAdminTokenAsync()
    {
        var email = "superadmin@hanyu.local";
        var password = "Password123!";
        await EnsureAdminUserExistsAsync(email, password, Roles.SuperAdmin);
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", new { Email = email, Password = password });
        var result = await response.Content.ReadFromJsonAsync<ChineseLearning.Application.Features.Authentication.DTOs.AuthResponse>();
        return result?.AccessToken ?? string.Empty;
    }

    private async Task EnsureAdminUserExistsAsync(string email, string password, string role)
    {
        using var scope = _factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<Microsoft.AspNetCore.Identity.UserManager<ChineseLearning.Domain.Entities.ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<Microsoft.AspNetCore.Identity.RoleManager<Microsoft.AspNetCore.Identity.IdentityRole<Guid>>>();
        
        var user = await userManager.FindByEmailAsync(email);
        if (user == null)
        {
            user = new ChineseLearning.Domain.Entities.ApplicationUser { UserName = email, Email = email };
            await userManager.CreateAsync(user, password);
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new Microsoft.AspNetCore.Identity.IdentityRole<Guid>(role));
            await userManager.AddToRoleAsync(user, role);
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

    private async Task<VocabularyDto> CreateVocabularyAsync(Guid topicId, string token)
    {
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        var request = new CreateVocabularyRequest(topicId, "狗", null, "gǒu", "dog", "noun", null, null, 1);
        var response = await _client.PostAsJsonAsync("/api/v1/admin/vocabularies", request);
        response.EnsureSuccessStatusCode();
        var vocab = await response.Content.ReadFromJsonAsync<VocabularyDto>();
        return vocab!;
    }

    [Fact]
    public async Task GetLessons_UnauthorizedUser_ReturnsForbidden()
    {
        var token = await GetUserTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var response = await _client.GetAsync("/api/v1/admin/lessons");
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task CreateLesson_AsAdmin_Success()
    {
        var token = await GetAdminTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var topic = await EnsureTopicExistsAsync();

        var request = new CreateLessonRequest(topic.PublicId, "Lesson 1", "Desc", 10, 1);

        var response = await _client.PostAsJsonAsync("/api/v1/admin/lessons", request);
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var created = await response.Content.ReadFromJsonAsync<LessonDto>();
        created.Should().NotBeNull();
        created!.TitleVi.Should().Be("Lesson 1");
        created.Status.Should().Be(ContentStatus.Draft);
    }

    [Fact]
    public async Task CreateLesson_DuplicateTitle_ReturnsBadRequest()
    {
        var token = await GetAdminTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var topic = await EnsureTopicExistsAsync();

        var request = new CreateLessonRequest(topic.PublicId, "Lesson Unique", "Desc", 10, 1);
        await _client.PostAsJsonAsync("/api/v1/admin/lessons", request);

        var response = await _client.PostAsJsonAsync("/api/v1/admin/lessons", request);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var problemDetails = await response.Content.ReadFromJsonAsync<Microsoft.AspNetCore.Mvc.ProblemDetails>();
        problemDetails.Should().NotBeNull();
        problemDetails!.Title.Should().Contain("Validation");
    }

    [Fact]
    public async Task SoftDelete_Lesson_MovesToTrash()
    {
        var token = await GetAdminTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var topic = await EnsureTopicExistsAsync();

        var request = new CreateLessonRequest(topic.PublicId, "Lesson Trash", "Desc", 10, 1);
        var createResponse = await _client.PostAsJsonAsync("/api/v1/admin/lessons", request);
        var created = await createResponse.Content.ReadFromJsonAsync<LessonDto>();

        // Soft delete
        var deleteResponse = await _client.DeleteAsync($"/api/v1/admin/lessons/{created!.Id}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify not in list
        var listResponse = await _client.GetAsync("/api/v1/admin/lessons");
        var list = await listResponse.Content.ReadFromJsonAsync<ChineseLearning.Application.Common.Models.PagedList<LessonDto>>();
        list!.Items.Should().NotContain(x => x.Id == created.Id);

        // Verify in trash
        var trashResponse = await _client.GetAsync("/api/v1/admin/lessons/trash");
        var trash = await trashResponse.Content.ReadFromJsonAsync<ChineseLearning.Application.Common.Models.PagedList<LessonDto>>();
        trash!.Items.Should().Contain(x => x.Id == created.Id);
    }

    [Fact]
    public async Task Restore_Lesson_RestoresFromTrash()
    {
        var token = await GetAdminTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var topic = await EnsureTopicExistsAsync();

        var request = new CreateLessonRequest(topic.PublicId, "Lesson To Restore", "Desc", 10, 1);
        var createResponse = await _client.PostAsJsonAsync("/api/v1/admin/lessons", request);
        var created = await createResponse.Content.ReadFromJsonAsync<LessonDto>();

        await _client.DeleteAsync($"/api/v1/admin/lessons/{created!.Id}");

        // Restore
        var restoreResponse = await _client.PostAsync($"/api/v1/admin/lessons/{created.Id}/restore", null);
        restoreResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify back in list
        var listResponse = await _client.GetAsync("/api/v1/admin/lessons");
        var list = await listResponse.Content.ReadFromJsonAsync<ChineseLearning.Application.Common.Models.PagedList<LessonDto>>();
        list!.Items.Should().Contain(x => x.Id == created.Id);
    }

    [Fact]
    public async Task PermanentDelete_AsAdmin_ReturnsForbidden()
    {
        var token = await GetAdminTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var topic = await EnsureTopicExistsAsync();
        var request = new CreateLessonRequest(topic.PublicId, "Lesson Perm Del", "Desc", 10, 1);
        var createResponse = await _client.PostAsJsonAsync("/api/v1/admin/lessons", request);
        var created = await createResponse.Content.ReadFromJsonAsync<LessonDto>();

        var deleteResponse = await _client.DeleteAsync($"/api/v1/admin/lessons/{created!.Id}/permanent");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task PermanentDelete_AsSuperAdmin_Success()
    {
        var adminToken = await GetAdminTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        var topic = await EnsureTopicExistsAsync();
        var request = new CreateLessonRequest(topic.PublicId, "Lesson Perm Del Super", "Desc", 10, 1);
        var createResponse = await _client.PostAsJsonAsync("/api/v1/admin/lessons", request);
        var created = await createResponse.Content.ReadFromJsonAsync<LessonDto>();

        // Log in as SuperAdmin to delete
        var superToken = await GetSuperAdminTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", superToken);
        var deleteResponse = await _client.DeleteAsync($"/api/v1/admin/lessons/{created!.Id}/permanent");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify it's gone from trash too
        var trashResponse = await _client.GetAsync("/api/v1/admin/lessons/trash");
        var trash = await trashResponse.Content.ReadFromJsonAsync<ChineseLearning.Application.Common.Models.PagedList<LessonDto>>();
        trash!.Items.Should().NotContain(x => x.Id == created.Id);
    }

    [Fact]
    public async Task Publish_Unpublish_Lesson_Success()
    {
        var token = await GetAdminTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var topic = await EnsureTopicExistsAsync();
        var request = new CreateLessonRequest(topic.PublicId, "Lesson Publish", "Desc", 10, 1);
        var createResponse = await _client.PostAsJsonAsync("/api/v1/admin/lessons", request);
        var created = await createResponse.Content.ReadFromJsonAsync<LessonDto>();

        // Publish
        var publishResponse = await _client.PostAsync($"/api/v1/admin/lessons/{created!.Id}/publish", null);
        publishResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var published = await publishResponse.Content.ReadFromJsonAsync<LessonDto>();
        published!.Status.Should().Be(ContentStatus.Published);

        // Unpublish
        var unpublishResponse = await _client.PostAsync($"/api/v1/admin/lessons/{created.Id}/unpublish", null);
        unpublishResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var unpublished = await unpublishResponse.Content.ReadFromJsonAsync<LessonDto>();
        unpublished!.Status.Should().Be(ContentStatus.Draft);
    }

    [Fact]
    public async Task Assign_Remove_Vocabulary_Lesson_Success()
    {
        var token = await GetAdminTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var topic = await EnsureTopicExistsAsync();
        var lessonRequest = new CreateLessonRequest(topic.PublicId, "Lesson Vocab", "Desc", 10, 1);
        var lessonResponse = await _client.PostAsJsonAsync("/api/v1/admin/lessons", lessonRequest);
        var lesson = await lessonResponse.Content.ReadFromJsonAsync<LessonDto>();

        var vocab = await CreateVocabularyAsync(topic.PublicId, token);

        // Assign Vocab
        var assignRequest = new AssignVocabularyRequest(vocab.Id, 0);
        var assignResponse = await _client.PostAsJsonAsync($"/api/v1/admin/lessons/{lesson!.Id}/vocabularies", assignRequest);
        assignResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Check if assigned
        var detailResponse = await _client.GetAsync($"/api/v1/admin/lessons/{lesson.Id}");
        var detail = await detailResponse.Content.ReadFromJsonAsync<LessonWithVocabulariesDto>();
        detail!.Vocabularies.Should().Contain(x => x.Id == vocab.Id);

        // Assign Duplicate Vocab
        var assignDupResponse = await _client.PostAsJsonAsync($"/api/v1/admin/lessons/{lesson.Id}/vocabularies", assignRequest);
        assignDupResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        // Remove Vocab
        var removeResponse = await _client.DeleteAsync($"/api/v1/admin/lessons/{lesson.Id}/vocabularies/{vocab.Id}");
        if (!removeResponse.IsSuccessStatusCode)
        {
            var err = await removeResponse.Content.ReadAsStringAsync();
            throw new Exception($"Remove failed with {removeResponse.StatusCode}: {err}");
        }
        removeResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Check if removed
        var detailAfterRemoveResponse = await _client.GetAsync($"/api/v1/admin/lessons/{lesson.Id}");
        var detailAfterRemove = await detailAfterRemoveResponse.Content.ReadFromJsonAsync<LessonWithVocabulariesDto>();
        detailAfterRemove!.Vocabularies.Should().BeEmpty();
    }



    [Fact]
    public async Task GetPublicLessons_ReturnsOnlyPublishedAndNonDeleted()
    {
        var token = await GetAdminTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var topic = await EnsureTopicExistsAsync();

        // Draft
        var draftReq = new CreateLessonRequest(topic.PublicId, "Public Draft", "Desc", 10, 1);
        var draftRes = await _client.PostAsJsonAsync("/api/v1/admin/lessons", draftReq);
        var draft = await draftRes.Content.ReadFromJsonAsync<LessonDto>();

        // Published
        var pubReq = new CreateLessonRequest(topic.PublicId, "Public Published", "Desc", 10, 1);
        var pubRes = await _client.PostAsJsonAsync("/api/v1/admin/lessons", pubReq);
        var published = await pubRes.Content.ReadFromJsonAsync<LessonDto>();
        await _client.PostAsync($"/api/v1/admin/lessons/{published!.Id}/publish", null);

        // Soft Deleted
        var delReq = new CreateLessonRequest(topic.PublicId, "Public Deleted", "Desc", 10, 1);
        var delRes = await _client.PostAsJsonAsync("/api/v1/admin/lessons", delReq);
        var deleted = await delRes.Content.ReadFromJsonAsync<LessonDto>();
        await _client.PostAsync($"/api/v1/admin/lessons/{deleted!.Id}/publish", null); // Publish first
        await _client.DeleteAsync($"/api/v1/admin/lessons/{deleted.Id}");

        // Public Endpoint
        var listResponse = await _client.GetAsync("/api/v1/lessons");
        listResponse.EnsureSuccessStatusCode();
        var list = await listResponse.Content.ReadFromJsonAsync<ChineseLearning.Application.Common.Models.PagedList<LessonDto>>();

        list!.Items.Should().Contain(x => x.Id == published.Id);
        list.Items.Should().NotContain(x => x.Id == draft!.Id);
        list.Items.Should().NotContain(x => x.Id == deleted.Id);

        // Public Detail Endpoint
        var detailResponse = await _client.GetAsync($"/api/v1/lessons/{published.Slug}");
        detailResponse.EnsureSuccessStatusCode();

        var draftDetailResponse = await _client.GetAsync($"/api/v1/lessons/{draft!.Slug}");
        draftDetailResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
