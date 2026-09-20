namespace TemplateLandingPage.Application.Abstractions;

using TemplateLandingPage.Domain.Entities;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
