namespace ChineseLearning.Domain.Common;

public abstract class Entity
{
    public long Id { get; protected init; }
    public Guid PublicId { get; protected init; } = Guid.NewGuid();
    public DateTimeOffset CreatedAt { get; protected init; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? UpdatedAt { get; protected set; }
}
