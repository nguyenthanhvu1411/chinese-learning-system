using ChineseLearning.Application.Abstractions.Authentication;
using ChineseLearning.Application.Features.Authentication.Services;
using ChineseLearning.Application.Features.Vocabularies.Services;
using ChineseLearning.Application.Features.Lessons.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace ChineseLearning.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IVocabularyService, VocabularyService>();
        services.AddScoped<IPublicVocabularyService, PublicVocabularyService>();
        services.AddScoped<ILessonService, LessonService>();
        services.AddScoped<IPublicLessonService, PublicLessonService>();
        services.AddValidatorsFromAssembly(System.Reflection.Assembly.GetExecutingAssembly());
        
        return services;
    }
}
