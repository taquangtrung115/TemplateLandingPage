namespace TemplateLandingPage.UnitTests.Application.NavigationMenus;

using FluentAssertions;
using Moq;
using TemplateLandingPage.Application.UseCases.V1.NavigationMenus.Queries;
using TemplateLandingPage.Contract.Services.V1.NavigationMenus;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;
using Xunit;

public class NavigationMenuQueryHandlerTests
{
    private readonly Mock<INavigationMenuRepository> _menuRepositoryMock;

    public NavigationMenuQueryHandlerTests()
    {
        _menuRepositoryMock = new Mock<INavigationMenuRepository>();
    }

    [Fact]
    public async Task GetNavigationMenus_Should_ReturnTreeHierarchy_WithSubmenus()
    {
        // Arrange
        var rootMenu = NavigationMenu.Create("Mẫu Thiệp", "/templates", null, 1);
        var subMenu1 = NavigationMenu.Create("Thiệp Cưới", "/templates?category=wedding", rootMenu.Id, 1);
        var subMenu2 = NavigationMenu.Create("Thiệp Sinh Nhật", "/templates?category=birthday", rootMenu.Id, 2);
        rootMenu.SubMenus.Add(subMenu1);
        rootMenu.SubMenus.Add(subMenu2);

        _menuRepositoryMock.Setup(r => r.GetTreeAsync(null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NavigationMenu> { rootMenu });

        var handler = new GetNavigationMenusQueryHandler(_menuRepositoryMock.Object);
        var query = new GetNavigationMenusQuery();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value[0].Title.Should().Be("Mẫu Thiệp");
        result.Value[0].SubMenus.Should().HaveCount(2);
        result.Value[0].SubMenus[0].Title.Should().Be("Thiệp Cưới");
        result.Value[0].SubMenus[1].Title.Should().Be("Thiệp Sinh Nhật");
    }

    [Fact]
    public async Task GetNavigationMenus_Should_FilterActive_WhenIsActiveOnlyIsTrue()
    {
        // Arrange
        var rootMenu = NavigationMenu.Create("Trang Chủ", "/", null, 1, isActive: true);
        _menuRepositoryMock.Setup(r => r.GetTreeAsync(true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NavigationMenu> { rootMenu });

        var handler = new GetNavigationMenusQueryHandler(_menuRepositoryMock.Object);
        var query = new GetNavigationMenusQuery(IsActiveOnly: true);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        _menuRepositoryMock.Verify(r => r.GetTreeAsync(true, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetNavigationMenuById_Should_ReturnMenu_WhenFound()
    {
        // Arrange
        var menu = NavigationMenu.Create("Trang Chủ", "/", null, 1, "_self", "HOT", "rose", "Home", true);
        _menuRepositoryMock.Setup(r => r.GetVisibleByIdAsync(menu.Id, false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(menu);

        var handler = new GetNavigationMenuByIdQueryHandler(_menuRepositoryMock.Object);
        var query = new GetNavigationMenuByIdQuery(menu.Id);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Id.Should().Be(menu.Id);
        result.Value.Title.Should().Be("Trang Chủ");
        result.Value.Badge.Should().Be("HOT");
        result.Value.BadgeColor.Should().Be("rose");
        result.Value.Icon.Should().Be("Home");
    }

    [Fact]
    public async Task GetNavigationMenuById_Should_ReturnNotFound_WhenMissing()
    {
        // Arrange
        var id = Guid.NewGuid();
        _menuRepositoryMock.Setup(r => r.GetVisibleByIdAsync(id, false, It.IsAny<CancellationToken>()))
            .ReturnsAsync((NavigationMenu?)null);

        var handler = new GetNavigationMenuByIdQueryHandler(_menuRepositoryMock.Object);
        var query = new GetNavigationMenuByIdQuery(id);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be(NavigationMenuErrors.NotFound);
    }
}
