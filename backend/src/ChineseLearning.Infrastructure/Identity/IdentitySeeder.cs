using ChineseLearning.Domain.Constants;
using Microsoft.AspNetCore.Identity;
using DomainApplicationUser = ChineseLearning.Domain.Entities.ApplicationUser;

namespace ChineseLearning.Infrastructure.Identity;

public sealed class IdentitySeeder(RoleManager<IdentityRole<Guid>> roleManager, UserManager<DomainApplicationUser> userManager)
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

        // Seed default SuperAdmin user
        var adminEmail = "admin@hanyu.edu.vn";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        
        if (adminUser == null)
        {
            adminUser = new DomainApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true
            };
            adminUser.SetDisplayName("HANYU Admin");
            adminUser.CompleteOnboarding();

            var result = await userManager.CreateAsync(adminUser, "Admin@123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, Roles.SuperAdmin);
            }
        }
    }
}
