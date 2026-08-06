using Microsoft.Extensions.Options;

namespace ChineseLearning.Api.Options;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; init; } = "ChineseLearning.Api";
    public string Audience { get; init; } = "ChineseLearning.Web";
    public string SigningKey { get; init; } = string.Empty;
    public int AccessTokenMinutes { get; init; } = 15;
    public int RefreshTokenDays { get; init; } = 30;
}

public sealed class JwtOptionsValidator : IValidateOptions<JwtOptions>
{
    public ValidateOptionsResult Validate(string? name, JwtOptions options)
    {
        if (string.IsNullOrWhiteSpace(options.Issuer))
            return ValidateOptionsResult.Fail("Jwt:Issuer is required.");
        if (string.IsNullOrWhiteSpace(options.Audience))
            return ValidateOptionsResult.Fail("Jwt:Audience is required.");
        if (string.IsNullOrWhiteSpace(options.SigningKey) || options.SigningKey.Length < 32)
            return ValidateOptionsResult.Fail("Jwt:SigningKey must contain at least 32 characters.");
        if (options.AccessTokenMinutes is < 5 or > 60)
            return ValidateOptionsResult.Fail("Jwt:AccessTokenMinutes must be between 5 and 60.");
        if (options.RefreshTokenDays is < 1 or > 90)
            return ValidateOptionsResult.Fail("Jwt:RefreshTokenDays must be between 1 and 90.");

        return ValidateOptionsResult.Success;
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
