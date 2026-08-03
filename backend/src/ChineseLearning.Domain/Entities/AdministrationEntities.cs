using ChineseLearning.Domain.Common;
using ChineseLearning.Domain.Constants;

namespace ChineseLearning.Domain.Entities;

public sealed class ContentReport : Entity
{
    public Guid ReporterUserId { get; private set; }
    public string EntityType { get; private set; } = string.Empty;
    public Guid EntityPublicId { get; private set; }
    public string Reason { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public ReportStatus Status { get; private set; } = ReportStatus.Open;
    public Guid? ResolvedByUserId { get; private set; }
    public DateTimeOffset? ResolvedAt { get; private set; }
}

public sealed class ProductEvent : Entity
{
    public Guid? UserId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? PropertiesJson { get; private set; }
    public string? SessionId { get; private set; }
    public string? ClientPlatform { get; private set; }
}

public sealed class AiUsageLog : Entity
{
    public Guid? UserId { get; private set; }
    public string Feature { get; private set; } = string.Empty;
    public string Model { get; private set; } = string.Empty;
    public int InputTokens { get; private set; }
    public int OutputTokens { get; private set; }
    public int DurationMs { get; private set; }
    public bool Succeeded { get; private set; }
    public string? ErrorCode { get; private set; }
}

public sealed class AuditLog : Entity
{
    public Guid? ActorUserId { get; private set; }
    public string Action { get; private set; } = string.Empty;
    public string EntityType { get; private set; } = string.Empty;
    public string? EntityId { get; private set; }
    public string? BeforeJson { get; private set; }
    public string? AfterJson { get; private set; }
    public string? IpAddress { get; private set; }
}
