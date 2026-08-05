using ChineseLearning.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Testcontainers.PostgreSql;
using Xunit;

namespace ChineseLearning.IntegrationTests;

public class IntegrationTestWebAppFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _dbContainer = new PostgreSqlBuilder("postgres:15-alpine")
        .WithDatabase("chinese_learning_test")
        .WithUsername("postgres")
        .WithPassword("postgres")
        .Build();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll(typeof(DbContextOptions<ApplicationDbContext>));
            services.RemoveAll(typeof(ApplicationDbContext));

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(_dbContainer.GetConnectionString()));

            services.RemoveAll(typeof(ChineseLearning.Application.Abstractions.Email.IEmailService));
            services.AddScoped<ChineseLearning.Application.Abstractions.Email.IEmailService, DummyEmailService>();
        });
    }

    private sealed class DummyEmailService : ChineseLearning.Application.Abstractions.Email.IEmailService
    {
        public Task SendEmailVerificationAsync(string email, string token, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task SendPasswordResetAsync(string email, string token, CancellationToken cancellationToken) => Task.CompletedTask;
    }

    public Task InitializeAsync()
    {
        return _dbContainer.StartAsync();
    }

    public new Task DisposeAsync()
    {
        return _dbContainer.StopAsync();
    }

    public async Task ResetDatabaseAsync()
    {
        using var scope = Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await context.Database.EnsureDeletedAsync();
        
        await Services.InitialiseDatabaseAsync();
    }
}
