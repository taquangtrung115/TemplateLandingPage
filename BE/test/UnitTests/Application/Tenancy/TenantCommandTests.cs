namespace OnePortal.UnitTests.Application.Tenancy;

using FluentAssertions;
using Moq;
using OnePortal.Application.Abstractions;
using OnePortal.Application.Services.Tenancy;
using OnePortal.Application.UseCases.V1.Tenancy.Commands.Create;
using OnePortal.Application.UseCases.V1.Tenancy.Commands.SetMembership;
using OnePortal.Application.UseCases.V1.Tenancy.Queries.GetContexts;
using OnePortal.Domain.Entities.Tenancy;
using Xunit;

public sealed class TenantCommandTests
{
    [Fact]
    public async Task TenantAdmin_CannotCreatePlatformWorkspaces()
    {
        var store = new Mock<ITenantStore>(MockBehavior.Strict); var actor = new RequestActor(); actor.Initialize(Guid.NewGuid(), false, "Admin");
        var result = await new CreateTenantCommandHandler(store.Object, actor).Handle(new CreateTenantCommand("acme", "Acme", ["quoting"], null), default);
        result.Error.Code.Should().Be("Tenancy.Forbidden"); store.VerifyNoOtherCalls();
    }

    [Theory]
    [InlineData("../other", "Acme", "quoting")]
    [InlineData("acme", "", "quoting")]
    [InlineData("acme", "Acme", "platform")]
    public async Task InvalidTenantDefinitions_DoNotWrite(string key, string name, string appKey)
    {
        var store = new Mock<ITenantStore>(MockBehavior.Strict); var actor = new RequestActor(); actor.Initialize(Guid.NewGuid(), true, null);
        var result = await new CreateTenantCommandHandler(store.Object, actor).Handle(new CreateTenantCommand(key, name, [appKey], null), default);
        result.Error.Code.Should().Be("Tenancy.Invalid"); store.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task TenantAdmin_CannotGrantAccessToAnotherTenantOrApp()
    {
        var store = new Mock<ITenantStore>(MockBehavior.Strict); var actor = new RequestActor(); actor.Initialize(Guid.NewGuid(), false, "Admin");
        var scope = TenantContext.For(Guid.NewGuid(), "landing");
        var handler = new SetTenantMembershipCommandHandler(store.Object, actor, scope);
        var result = await handler.Handle(new SetTenantMembershipCommand(scope.TenantId!.Value, "quoting", "user@test.local", "Admin", true), default);
        result.Error.Code.Should().Be("Tenancy.Forbidden"); store.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task AnonymousUser_CannotEnumerateWorkspaceMemberships()
    {
        var store = new Mock<ITenantStore>(MockBehavior.Strict);
        var result = await new GetTenantContextsQueryHandler(store.Object, new RequestActor()).Handle(new GetTenantContextsQuery("quoting"), default);
        result.Error.Code.Should().Be("Tenancy.Forbidden"); store.VerifyNoOtherCalls();
    }

    [Fact]
    public void QuotingSelfRegistration_IsClosedByDefault_AndCanBeConfigured()
    {
        var application = TenantApplication.Create(Guid.NewGuid(), "quoting");
        application.AllowSelfRegistration.Should().BeFalse();
        application.Configure(true, true); application.AllowSelfRegistration.Should().BeTrue();
        application.Configure(true, false); application.AllowSelfRegistration.Should().BeFalse();
    }
}
