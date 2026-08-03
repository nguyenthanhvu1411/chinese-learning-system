using ChineseLearning.Domain.Constants;
using Microsoft.AspNetCore.Identity;

namespace ChineseLearning.Infrastructure.Identity;

public sealed class IdentitySeeder(RoleManager<IdentityRole<Guid>> roleManager)
{
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        foreach (var role in Roles.All)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
            }
        }
    }
}
