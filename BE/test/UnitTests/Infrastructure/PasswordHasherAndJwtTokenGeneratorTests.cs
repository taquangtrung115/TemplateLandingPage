namespace TemplateLandingPage.UnitTests.Infrastructure;

using System.IdentityModel.Tokens.Jwt;
using FluentAssertions;
using Microsoft.Extensions.Options;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Infrastructure.Authentication;
using TemplateLandingPage.Infrastructure.Services;
using Xunit;

public class PasswordHasherAndJwtTokenGeneratorTests
{
    private readonly PasswordHasher _hasher;

    public PasswordHasherAndJwtTokenGeneratorTests()
    {
        _hasher = new PasswordHasher();
    }

    [Fact]
    public void HashPassword_Should_CreateValidHash_And_VerifyPassword_Should_ReturnTrue()
    {
        // Arrange
        var password = "SecurePassword@2026!";

        // Act
        var hash = _hasher.HashPassword(password);
        var isValid = _hasher.VerifyPassword(password, hash);

        // Assert
        hash.Should().Contain(".");
        isValid.Should().BeTrue();
    }

    [Fact]
    public void VerifyPassword_Should_ReturnFalse_WhenPasswordIsIncorrect()
    {
        // Arrange
        var hash = _hasher.HashPassword("CorrectPassword123");

        // Act
        var isValid = _hasher.VerifyPassword("WrongPassword123", hash);

        // Assert
        isValid.Should().BeFalse();
    }

    [Theory]
    [InlineData("invalid_hash_without_dot")]
    [InlineData("part1.part2.part3")]
    [InlineData("not_base64!.still_not_base64!")]
    [InlineData("validBase64==.invalid_chars!#$")]
    [InlineData("invalid_chars!#$.validBase64==")]
    public void VerifyPassword_Should_ReturnFalse_WhenHashFormatIsMalformed(string malformedHash)
    {
        // Act
        var isValid = _hasher.VerifyPassword("any_password", malformedHash);

        // Assert
        isValid.Should().BeFalse();
    }

    [Fact]
    public void GenerateToken_Should_ProduceValidJwtToken_WithClaims()
    {
        // Arrange
        var options = Options.Create(new JwtSettings
        {
            SecretKey = "super_secret_key_at_least_32_bytes_long!",
            Issuer = "TemplateLandingPage",
            Audience = "TemplateLandingPageUsers",
            ExpirationMinutes = 60
        });

        var tokenGenerator = new JwtTokenGenerator(options);
        var user = User.Create("admin@template.com", "hash", "Admin User", "Admin");

        // Act
        var token = tokenGenerator.GenerateToken(user);

        // Assert
        token.Should().NotBeNullOrWhiteSpace();

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        jwt.Issuer.Should().Be("TemplateLandingPage");
        jwt.Audiences.Should().Contain("TemplateLandingPageUsers");
        jwt.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Email && c.Value == "admin@template.com");
        jwt.Claims.Should().Contain(c => c.Type == "role" && c.Value == "Admin");
    }
}
