namespace OnePortal.UnitTests.Application.Tenancy;

using FluentAssertions;
using Moq;
using OnePortal.Application.Abstractions;
using OnePortal.Application.Services.Tenancy;
using OnePortal.Application.UseCases.V1.Tenancy.Commands.CreateMember;
using OnePortal.Application.UseCases.V1.Tenancy.Commands.ConfigureRegistration;
using Xunit;

public sealed class CreateMemberTests
{
    [Theory]
    [InlineData("User", "quoting")]
    [InlineData("Admin", "landing")]
    public async Task OtherRolesAndApplications_CannotCreateMembers(string role, string appKey)
    {
        var store = new Mock<ITenantStore>(MockBehavior.Strict); var hasher = new Mock<IPasswordHasher>(MockBehavior.Strict);
        var actor = new RequestActor(); actor.Initialize(Guid.NewGuid(), false, role); var scope = TenantContext.For(Guid.NewGuid(), "quoting");
        var result = await new CreateTenantMemberCommandHandler(store.Object, actor, scope, hasher.Object).Handle(new(scope.TenantId!.Value, appKey, "test@example.com", "User", "password-123", "User"), default);
        result.Error.Code.Should().Be("Tenancy.Forbidden"); store.VerifyNoOtherCalls(); hasher.VerifyNoOtherCalls();
    }
    [Theory]
    [InlineData("invalid", "User", "password-123", "User")]
    [InlineData("test@example.com", "", "password-123", "User")]
    [InlineData("test@example.com", "User", "short", "User")]
    [InlineData("test@example.com", "User", "password-123", "PlatformAdmin")]
    public async Task InvalidMemberInput_NeverHashesOrWrites(string email, string fullName, string password, string role)
    {
        var store = new Mock<ITenantStore>(MockBehavior.Strict); var hasher = new Mock<IPasswordHasher>(MockBehavior.Strict);
        var actor = new RequestActor(); actor.Initialize(Guid.NewGuid(), true, null); var scope = TenantContext.For(Guid.NewGuid(), "quoting");
        var result = await new CreateTenantMemberCommandHandler(store.Object, actor, scope, hasher.Object).Handle(new(scope.TenantId!.Value, "quoting", email, fullName, password, role), default);
        result.Error.Code.Should().Be("Tenancy.Invalid"); store.VerifyNoOtherCalls(); hasher.VerifyNoOtherCalls();
    }
    [Fact]
    public async Task User_CannotChangeRegistrationSettings()
    {
        var store = new Mock<ITenantStore>(MockBehavior.Strict); var actor = new RequestActor(); actor.Initialize(Guid.NewGuid(), false, "User");
        var result = await new ConfigureRegistrationCommandHandler(store.Object, actor, TenantContext.For(Guid.NewGuid(), "quoting")).Handle(new(true), default);
        result.Error.Code.Should().Be("Tenancy.Forbidden"); store.VerifyNoOtherCalls();
    }
}
