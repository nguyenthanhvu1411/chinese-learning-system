using Xunit;

namespace ChineseLearning.UnitTests;

public sealed class ArchitectureTests
{
    [Fact]
    public void DomainAssembly_DoesNotReferenceInfrastructure()
    {
        var references = typeof(ChineseLearning.Domain.Common.Entity).Assembly.GetReferencedAssemblies();
        Assert.DoesNotContain(references, item => item.Name == "ChineseLearning.Infrastructure");
    }
}
