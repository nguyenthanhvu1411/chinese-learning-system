using ChineseLearning.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ChineseLearning.Application.Abstractions.Persistence;

public interface IApplicationDbContext
{
    DbSet<RefreshToken> RefreshTokens { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
