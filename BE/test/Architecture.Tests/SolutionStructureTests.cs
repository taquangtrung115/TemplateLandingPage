namespace OnePortal.Architecture.Tests;

using Xunit;

public sealed class SolutionStructureTests
{
    [Fact]
    public void ContractServices_UsesGroupedCommandQueryAndResponseFiles()
    {
        var services = Path.Combine(BackendRoot(), "src", "Contract", "Services");
        var unexpected = Directory.EnumerateFiles(services, "*.cs", SearchOption.AllDirectories)
            .Where(file => Path.GetFileName(file) is not ("Command.cs" or "Query.cs" or "Response.cs"));
        Assert.Empty(unexpected);
    }

    [Fact]
    public void ApplicationHandlersAndValidators_AreGroupedByCommandOrQueryAndModule()
    {
        var useCases = Path.Combine(BackendRoot(), "src", "Application", "UseCases", "V1");
        var source = Directory.EnumerateFiles(useCases, "*.cs", SearchOption.AllDirectories)
            .Select(file => Path.GetRelativePath(useCases, file).Split(Path.DirectorySeparatorChar));
        foreach (var parts in source)
        {
            if (parts[^1].EndsWith("Handler.cs", StringComparison.Ordinal))
                Assert.True(parts.Length is 3 or 4 && parts[0] is "Commands" or "Queries", string.Join('/', parts));
            else if (parts[^1].EndsWith("Validator.cs", StringComparison.Ordinal))
                Assert.True(parts.Length is 4 or 5 && parts[0] is "Commands" or "Queries" && parts[^2] == "Validators", string.Join('/', parts));
        }
    }

    [Fact]
    public void DomainEntities_AreLocatedInsideModuleFolders()
    {
        var entities = Path.Combine(BackendRoot(), "src", "Domain", "Entities");
        Assert.Empty(Directory.EnumerateFiles(entities, "*.cs", SearchOption.TopDirectoryOnly));
    }

    private static string BackendRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null)
        {
            var path = Path.Combine(directory.FullName, "BE", "OnePortal.sln");
            if (File.Exists(path)) return Path.GetDirectoryName(path)!;
            directory = directory.Parent;
        }
        throw new InvalidOperationException("OnePortal backend source is required for the structure tests.");
    }
}
