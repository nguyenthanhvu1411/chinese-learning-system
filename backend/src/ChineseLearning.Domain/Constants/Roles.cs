namespace ChineseLearning.Domain.Constants;

public static class Roles
{
    public const string User = "User";
    public const string ContentEditor = "ContentEditor";
    public const string Admin = "Admin";
    public const string SuperAdmin = "SuperAdmin";

    public static readonly string[] All = [User, ContentEditor, Admin, SuperAdmin];
}
