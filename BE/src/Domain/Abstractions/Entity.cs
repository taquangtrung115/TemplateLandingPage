namespace TemplateLandingPage.Domain.Abstractions;

public abstract class Entity<TKey> : IEquatable<Entity<TKey>>
{
    public TKey Id { get; protected set; } = default!;

    public override bool Equals(object? obj)
    {
        if (obj is null || obj.GetType() != GetType())
        {
            return false;
        }

        if (obj is not Entity<TKey> other)
        {
            return false;
        }

        return EqualityComparer<TKey>.Default.Equals(Id, other.Id);
    }

    public bool Equals(Entity<TKey>? other)
    {
        if (other is null || other.GetType() != GetType())
        {
            return false;
        }

        return EqualityComparer<TKey>.Default.Equals(Id, other.Id);
    }

    public override int GetHashCode()
    {
        return EqualityComparer<TKey>.Default.GetHashCode(Id!);
    }

    public static bool operator ==(Entity<TKey>? left, Entity<TKey>? right)
    {
        return Equals(left, right);
    }

    public static bool operator !=(Entity<TKey>? left, Entity<TKey>? right)
    {
        return !Equals(left, right);
    }
}
