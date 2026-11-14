namespace OnePortal.Application.Abstractions;

using OnePortal.Domain.Entities;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
