using Microsoft.Extensions.Options;

namespace ChineseLearning.Api.Options;

public sealed class OpenAIOptions
{
    public const string SectionName = "OpenAI";

    public string Model { get; init; } = "gpt-5-mini";
    public string BaseUrl { get; init; } = "https://api.openai.com/v1";
    public string? ApiKey { get; init; }
}

public sealed class OpenAIOptionsValidator : IValidateOptions<OpenAIOptions>
{
    public ValidateOptionsResult Validate(string? name, OpenAIOptions options)
    {
        if (!Uri.TryCreate(options.BaseUrl, UriKind.Absolute, out _))
        {
            return ValidateOptionsResult.Fail("OpenAI:BaseUrl must be an absolute URL.");
        }

        if (string.IsNullOrWhiteSpace(options.Model))
        {
            return ValidateOptionsResult.Fail("OpenAI:Model is required.");
        }

        return ValidateOptionsResult.Success;
    }
}
