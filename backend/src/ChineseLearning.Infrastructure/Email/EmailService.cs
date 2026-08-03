using ChineseLearning.Application.Abstractions.Email;
using Microsoft.Extensions.Logging;

namespace ChineseLearning.Infrastructure.Email;

public sealed class EmailService(ILogger<EmailService> logger) : IEmailService
{
    public Task SendEmailVerificationAsync(string email, string token, CancellationToken cancellationToken)
    {
        logger.LogInformation("Email verification requested for {Email}. Provider integration is pending.", email);
        return Task.CompletedTask;
    }

    public Task SendPasswordResetAsync(string email, string token, CancellationToken cancellationToken)
    {
        logger.LogInformation("Password reset requested for {Email}. Provider integration is pending.", email);
        return Task.CompletedTask;
    }
}
