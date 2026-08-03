using Microsoft.Extensions.Options;

namespace ChineseLearning.Api.Options;

public sealed class SupabaseOptions
{
    public const string SectionName = "Supabase";

    public string Url { get; init; } = string.Empty;
    public string JwtIssuer { get; init; } = string.Empty;
    public string JwtAudience { get; init; } = "authenticated";
}

public sealed class SupabaseOptionsValidator : IValidateOptions<SupabaseOptions>
{
    public ValidateOptionsResult Validate(string? name, SupabaseOptions options)
    {
        if (!Uri.TryCreate(options.Url, UriKind.Absolute, out var url) || url.Scheme != Uri.UriSchemeHttps)
        {
            return ValidateOptionsResult.Fail("Supabase:Url must be an absolute HTTPS URL.");
        }

        if (!Uri.TryCreate(options.JwtIssuer, UriKind.Absolute, out var issuer) || issuer.Scheme != Uri.UriSchemeHttps)
        {
            return ValidateOptionsResult.Fail("Supabase:JwtIssuer must be an absolute HTTPS URL.");
        }

        return string.IsNullOrWhiteSpace(options.JwtAudience)
            ? ValidateOptionsResult.Fail("Supabase:JwtAudience is required.")
            : ValidateOptionsResult.Success;
    }
}

public sealed class DatabaseOptions
{
    public const string SectionName = "Database";

    public string ConnectionString { get; init; } = string.Empty;
}

public sealed class DatabaseOptionsValidator : IValidateOptions<DatabaseOptions>
{
    public ValidateOptionsResult Validate(string? name, DatabaseOptions options) =>
        string.IsNullOrWhiteSpace(options.ConnectionString)
            ? ValidateOptionsResult.Fail("Database:ConnectionString is required.")
            : ValidateOptionsResult.Success;
}
