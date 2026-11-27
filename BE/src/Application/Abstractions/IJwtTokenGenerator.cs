namespace OnePortal.Application.Abstractions;

using OnePortal.Domain.Entities.Users;


public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
