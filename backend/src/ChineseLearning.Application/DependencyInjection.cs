using ChineseLearning.Application.Abstractions.Authentication;
using ChineseLearning.Application.Features.Authentication.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ChineseLearning.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        return services;
    }
}
