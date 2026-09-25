namespace TemplateLandingPage.Persistence;

using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

public sealed class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        // 1. Check explicit migration connection string from environment variable
        var connectionString = Environment.GetEnvironmentVariable("TEMPLATE_MIGRATION_CONNECTION_STRING");

        // 2. If not specified, load from appsettings files in the API project (defaults to Development)
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
            var basePath = ResolveApiDirectory();

            var configuration = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddJsonFile("appsettings.json", optional: true)
                .AddJsonFile($"appsettings.{environment}.json", optional: true)
                .Build();

            connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Could not find a database connection string. " +
                "Either set the 'TEMPLATE_MIGRATION_CONNECTION_STRING' environment variable or " +
                "define 'ConnectionStrings:DefaultConnection' in appsettings.json / appsettings.Development.json in the API project.");
        }

        return new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(connectionString).Options);
    }

    private static string ResolveApiDirectory()
    {
        var current = new DirectoryInfo(Directory.GetCurrentDirectory());
        while (current != null)
        {
            var apiCandidate = Path.Combine(current.FullName, "src", "API");
            if (Directory.Exists(apiCandidate) && File.Exists(Path.Combine(apiCandidate, "appsettings.json")))
            {
                return apiCandidate;
            }

            var beApiCandidate = Path.Combine(current.FullName, "BE", "src", "API");
            if (Directory.Exists(beApiCandidate) && File.Exists(Path.Combine(beApiCandidate, "appsettings.json")))
            {
                return beApiCandidate;
            }

            if (File.Exists(Path.Combine(current.FullName, "appsettings.json")))
            {
                return current.FullName;
            }

            current = current.Parent;
        }

        return Directory.GetCurrentDirectory();
    }
}
