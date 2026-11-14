namespace OnePortal.Domain.Entities.Tenancy;

using System.Text.RegularExpressions;
using OnePortal.Domain.Abstractions;

public sealed class Tenant : GlobalEntity<Guid>
{
    #region State
    public string Key { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAtUtc { get; private set; }
    private Tenant() { }
    #endregion

    #region Commands
    public static Tenant Create(string key, string name, Guid? id = null)
    {
        key = key.Trim().ToLowerInvariant();
        if (!Regex.IsMatch(key, "^[a-z0-9][a-z0-9-]{1,62}$") || string.IsNullOrWhiteSpace(name) || name.Trim().Length > 200)
            throw new ArgumentException("Invalid workspace key or name.");
        return new Tenant { Id = id ?? Guid.NewGuid(), Key = key, Name = name.Trim(), CreatedAtUtc = DateTime.UtcNow };
    }

    public void Update(string name, bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name) || name.Trim().Length > 200) throw new ArgumentException("Invalid workspace name.");
        Name = name.Trim(); IsActive = isActive;
    }
    #endregion
}
