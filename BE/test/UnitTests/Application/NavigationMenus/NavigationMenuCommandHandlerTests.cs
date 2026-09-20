namespace TemplateLandingPage.UnitTests.Application.NavigationMenus;

using FluentAssertions;
using Moq;
using TemplateLandingPage.Application.UseCases.V1.NavigationMenus.Commands;
using TemplateLandingPage.Contract.Services.V1.NavigationMenus;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;
using Xunit;

public class NavigationMenuCommandHandlerTests
{
    private readonly Mock<INavigationMenuRepository> _menuRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;

    public NavigationMenuCommandHandlerTests()
    {
        _menuRepositoryMock = new Mock<INavigationMenuRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
    }

    [Fact]
    public async Task CreateNavigationMenu_Should_Succeed_WithoutParent()
    {
        var command = new CreateNavigationMenuCommand("Trang Chủ", "/", null, 1, "_self", null, null, "Home", true);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var handler = new CreateNavigationMenuCommandHandler(_menuRepositoryMock.Object, _unitOfWorkMock.Object);
        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();
        _menuRepositoryMock.Verify(r => r.Add(It.Is<NavigationMenu>(m => m.Title == command.Title)), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateNavigationMenu_Should_Succeed_WithValidParent()
    {
        var parent = NavigationMenu.Create("Cha", "/parent", null, 1);
        var command = new CreateNavigationMenuCommand("Con", "/child", parent.Id, 1, "_self", null, null, null, true);

        _menuRepositoryMock.Setup(r => r.GetByIdAsync(parent.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(parent);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var handler = new CreateNavigationMenuCommandHandler(_menuRepositoryMock.Object, _unitOfWorkMock.Object);
        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task CreateNavigationMenu_Should_Fail_WhenParentNotFound()
    {
        var nonExistentParentId = Guid.NewGuid();
        var command = new CreateNavigationMenuCommand("Con", "/child", nonExistentParentId, 1, "_self", null, null, null, true);

        _menuRepositoryMock.Setup(r => r.GetByIdAsync(nonExistentParentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((NavigationMenu?)null);

        var handler = new CreateNavigationMenuCommandHandler(_menuRepositoryMock.Object, _unitOfWorkMock.Object);
        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(NavigationMenuErrors.ParentNotFound);
    }

    [Fact]
    public async Task UpdateNavigationMenu_Should_Succeed_WhenValid()
    {
        var menu = NavigationMenu.Create("Gốc", "/goc", null, 1);
        var command = new UpdateNavigationMenuCommand(menu.Id, "Gốc sửa", "/goc-sua", null, 2, "_blank", "HOT", "rose", "Flame", true);

        _menuRepositoryMock.Setup(r => r.GetByIdAsync(menu.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(menu);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var handler = new UpdateNavigationMenuCommandHandler(_menuRepositoryMock.Object, _unitOfWorkMock.Object);
        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        menu.Title.Should().Be("Gốc sửa");
        menu.Target.Should().Be("_blank");
    }

    [Fact]
    public async Task UpdateNavigationMenu_Should_Fail_WhenCannotBeSelfParent()
    {
        var menuId = Guid.NewGuid();
        var menu = NavigationMenu.Create("Menu", "/menu", null, 1);
        var command = new UpdateNavigationMenuCommand(menu.Id, "Menu sửa", "/menu", menu.Id, 1, "_self", null, null, null, true);

        _menuRepositoryMock.Setup(r => r.GetByIdAsync(menu.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(menu);

        var handler = new UpdateNavigationMenuCommandHandler(_menuRepositoryMock.Object, _unitOfWorkMock.Object);
        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(NavigationMenuErrors.CannotBeSelfParent);
    }

    [Fact]
    public async Task DeleteNavigationMenu_Should_Succeed_WhenNoChildren()
    {
        var menu = NavigationMenu.Create("Menu", "/menu", null, 1);
        var command = new DeleteNavigationMenuCommand(menu.Id);

        _menuRepositoryMock.Setup(r => r.GetByIdAsync(menu.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(menu);
        _menuRepositoryMock.Setup(r => r.HasChildrenAsync(menu.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var handler = new DeleteNavigationMenuCommandHandler(_menuRepositoryMock.Object, _unitOfWorkMock.Object);
        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        menu.IsDeleted.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteNavigationMenu_Should_Fail_WhenHasChildMenus()
    {
        var menu = NavigationMenu.Create("Menu", "/menu", null, 1);
        var command = new DeleteNavigationMenuCommand(menu.Id);

        _menuRepositoryMock.Setup(r => r.GetByIdAsync(menu.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(menu);
        _menuRepositoryMock.Setup(r => r.HasChildrenAsync(menu.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var handler = new DeleteNavigationMenuCommandHandler(_menuRepositoryMock.Object, _unitOfWorkMock.Object);
        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(NavigationMenuErrors.HasChildMenus);
    }

    [Fact]
    public async Task UpdateNavigationMenu_Should_Fail_WhenNotFound()
    {
        var nonExistentId = Guid.NewGuid();
        var command = new UpdateNavigationMenuCommand(nonExistentId, "Sửa", "/sua", null, 1, "_self", null, null, null, true);

        _menuRepositoryMock.Setup(r => r.GetByIdAsync(nonExistentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((NavigationMenu?)null);

        var handler = new UpdateNavigationMenuCommandHandler(_menuRepositoryMock.Object, _unitOfWorkMock.Object);
        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(NavigationMenuErrors.NotFound);
    }

    [Fact]
    public async Task UpdateNavigationMenu_Should_Fail_WhenParentNotFound()
    {
        var menu = NavigationMenu.Create("Menu", "/menu", null, 1);
        var nonExistentParentId = Guid.NewGuid();
        var command = new UpdateNavigationMenuCommand(menu.Id, "Menu sửa", "/menu", nonExistentParentId, 1, "_self", null, null, null, true);

        _menuRepositoryMock.Setup(r => r.GetByIdAsync(menu.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(menu);
        _menuRepositoryMock.Setup(r => r.GetByIdAsync(nonExistentParentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((NavigationMenu?)null);

        var handler = new UpdateNavigationMenuCommandHandler(_menuRepositoryMock.Object, _unitOfWorkMock.Object);
        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(NavigationMenuErrors.ParentNotFound);
    }

    [Fact]
    public async Task DeleteNavigationMenu_Should_Fail_WhenNotFound()
    {
        var nonExistentId = Guid.NewGuid();
        var command = new DeleteNavigationMenuCommand(nonExistentId);

        _menuRepositoryMock.Setup(r => r.GetByIdAsync(nonExistentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((NavigationMenu?)null);

        var handler = new DeleteNavigationMenuCommandHandler(_menuRepositoryMock.Object, _unitOfWorkMock.Object);
        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(NavigationMenuErrors.NotFound);
    }
}
