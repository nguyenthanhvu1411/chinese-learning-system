namespace ChineseLearning.Application.Abstractions.Email;

public interface IEmailService
{
    Task SendEmailVerificationAsync(string email, string token, CancellationToken cancellationToken);
    Task SendPasswordResetAsync(string email, string token, CancellationToken cancellationToken);
}
