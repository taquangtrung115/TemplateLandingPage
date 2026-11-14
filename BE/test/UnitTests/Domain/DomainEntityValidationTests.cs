namespace OnePortal.UnitTests.Domain;

using FluentAssertions;
using OnePortal.Domain.Entities;
using OnePortal.Infrastructure.Services;
using Xunit;

public class DomainEntityValidationTests
{
    // ==========================================
    // 1. User Validation & Constraints
    // ==========================================
    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void User_Create_Should_ThrowArgumentException_WhenEmailIsInvalid(string? email)
    {
        var act = () => User.Create(email!, "passwordHash", "Nguyen Van A");
        act.Should().Throw<ArgumentException>().WithParameterName("email");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void User_Create_Should_ThrowArgumentException_WhenPasswordHashIsInvalid(string? hash)
    {
        var act = () => User.Create("test@template.com", hash!, "Nguyen Van A");
        act.Should().Throw<ArgumentException>().WithParameterName("passwordHash");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void User_Create_Should_ThrowArgumentException_WhenFullNameIsInvalid(string? fullName)
    {
        var act = () => User.Create("test@template.com", "hash", fullName!);
        act.Should().Throw<ArgumentException>().WithParameterName("fullName");
    }

    [Fact]
    public void User_UpdateProfile_Should_ThrowArgumentException_WhenFullNameIsEmpty()
    {
        var user = User.Create("test@template.com", "hash", "Valid Name");
        var act = () => user.UpdateProfile("", "Admin", true);
        act.Should().Throw<ArgumentException>().WithParameterName("fullName");
    }

    [Fact]
    public void User_ChangePassword_Should_ThrowArgumentException_WhenPasswordHashIsEmpty()
    {
        var user = User.Create("test@template.com", "hash", "Valid Name");
        var act = () => user.ChangePassword("");
        act.Should().Throw<ArgumentException>().WithParameterName("newPasswordHash");
    }

    [Fact]
    public void User_Delete_Should_SetSoftDeleteFlags()
    {
        var user = User.Create("test@template.com", "hash", "Valid Name");
        user.Delete();
        user.IsDeleted.Should().BeTrue();
        user.DeletedAtUtc.Should().NotBeNull();
    }

    [Fact]
    public void User_Create_Should_NormalizeEmail_And_TrimFullName()
    {
        var user = User.Create("  User.Test@Example.COM  ", "hash123", "  Nguyen Van A  ");
        user.Email.Should().Be("user.test@example.com");
        user.FullName.Should().Be("Nguyen Van A");
    }

    // ==========================================
    // 2. Template Validation & Constraints
    // ==========================================
    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Template_Create_Should_ThrowArgumentException_WhenNameIsInvalid(string? name)
    {
        var act = () => Template.Create(name!, "slug", "desc", "Wedding", "http://thumb.jpg", null, "{}");
        act.Should().Throw<ArgumentException>().WithParameterName("name");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Template_Create_Should_ThrowArgumentException_WhenSlugIsInvalid(string? slug)
    {
        var act = () => Template.Create("Name", slug!, "desc", "Wedding", "http://thumb.jpg", null, "{}");
        act.Should().Throw<ArgumentException>().WithParameterName("slug");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Template_Create_Should_ThrowArgumentException_WhenThumbnailUrlIsInvalid(string? thumb)
    {
        var act = () => Template.Create("Name", "slug", "desc", "Wedding", thumb!, null, "{}");
        act.Should().Throw<ArgumentException>().WithParameterName("thumbnailUrl");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Template_Create_Should_ThrowArgumentException_WhenDefaultConfigJsonIsInvalid(string? config)
    {
        var act = () => Template.Create("Name", "slug", "desc", "Wedding", "http://thumb.jpg", null, config!);
        act.Should().Throw<ArgumentException>().WithParameterName("defaultConfigJson");
    }

    [Fact]
    public void Template_Update_Should_ThrowArgumentException_WhenNameIsEmpty()
    {
        var template = Template.Create("Name", "slug", "desc", "Wedding", "http://thumb.jpg", null, "{}");
        var act = () => template.Update("", "slug", "desc", "Wedding", "http://thumb.jpg", null, "{}", true);
        act.Should().Throw<ArgumentException>().WithParameterName("name");
    }

    // ==========================================
    // 3. Category Validation & Constraints
    // ==========================================
    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Category_Create_Should_ThrowArgumentException_WhenNameIsInvalid(string? name)
    {
        var act = () => Category.Create(name!, "slug", "desc", "Heart", 1);
        act.Should().Throw<ArgumentException>().WithParameterName("name");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Category_Create_Should_ThrowArgumentException_WhenSlugIsInvalid(string? slug)
    {
        var act = () => Category.Create("Name", slug!, "desc", "Heart", 1);
        act.Should().Throw<ArgumentException>().WithParameterName("slug");
    }

    [Fact]
    public void Category_Update_Should_ThrowArgumentException_WhenSlugIsEmpty()
    {
        var category = Category.Create("Name", "slug", "desc", "Heart", 1);
        var act = () => category.Update("Name", "", "desc", "Heart", 1, true);
        act.Should().Throw<ArgumentException>().WithParameterName("slug");
    }

    // ==========================================
    // 4. NavigationMenu Validation & Constraints
    // ==========================================
    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void NavigationMenu_Create_Should_ThrowArgumentException_WhenTitleIsInvalid(string? title)
    {
        var act = () => NavigationMenu.Create(title!, "/url", null, 1);
        act.Should().Throw<ArgumentException>().WithParameterName("title");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void NavigationMenu_Create_Should_ThrowArgumentException_WhenUrlIsInvalid(string? url)
    {
        var act = () => NavigationMenu.Create("Title", url!, null, 1);
        act.Should().Throw<ArgumentException>().WithParameterName("url");
    }

    [Fact]
    public void NavigationMenu_Update_Should_ThrowArgumentException_WhenParentIdIsSelf()
    {
        var menu = NavigationMenu.Create("Title", "/url", null, 1);
        var act = () => menu.Update("Title", "/url", menu.Id, 1, "_self", null, null, null, true);
        act.Should().Throw<ArgumentException>().WithParameterName("parentId")
            .WithMessage("*cannot be its own parent*");
    }

    // ==========================================
    // 5. UserCustomization Validation & Constraints
    // ==========================================
    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void UserCustomization_Create_Should_ThrowArgumentException_WhenTitleIsInvalid(string? title)
    {
        var act = () => UserCustomization.Create(Guid.NewGuid(), Guid.NewGuid(), title!, "slug", "{}");
        act.Should().Throw<ArgumentException>().WithParameterName("title");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void UserCustomization_Create_Should_ThrowArgumentException_WhenSlugIsInvalid(string? slug)
    {
        var act = () => UserCustomization.Create(Guid.NewGuid(), Guid.NewGuid(), "Title", slug!, "{}");
        act.Should().Throw<ArgumentException>().WithParameterName("slug");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void UserCustomization_Create_Should_ThrowArgumentException_WhenConfigJsonIsInvalid(string? config)
    {
        var act = () => UserCustomization.Create(Guid.NewGuid(), Guid.NewGuid(), "Title", "slug", config!);
        act.Should().Throw<ArgumentException>().WithParameterName("configJson");
    }

    // ==========================================
    // 6. RsvpEntry Validation & Normalization
    // ==========================================
    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void RsvpEntry_Create_Should_ThrowArgumentException_WhenGuestNameIsInvalid(string? name)
    {
        var act = () => RsvpEntry.Create(Guid.NewGuid(), name!, "email@test.com", "0123456789", "attending", 2, null, null);
        act.Should().Throw<ArgumentException>().WithParameterName("guestName");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public void RsvpEntry_Create_Should_NormalizeNumberOfGuestsToAtLeastOne(int guests)
    {
        var rsvp = RsvpEntry.Create(Guid.NewGuid(), "Guest", null, null, "attending", guests, null, null);
        rsvp.NumberOfGuests.Should().Be(1);
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    [InlineData(null)]
    public void RsvpEntry_Create_Should_DefaultAttendingStatus_WhenEmpty(string? status)
    {
        var rsvp = RsvpEntry.Create(Guid.NewGuid(), "Guest", null, null, status!, 1, null, null);
        rsvp.AttendingStatus.Should().Be("attending");
    }

    // ==========================================
    // 7. GuestbookEntry Validation
    // ==========================================
    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void GuestbookEntry_Create_Should_ThrowArgumentException_WhenSenderNameIsInvalid(string? name)
    {
        var act = () => GuestbookEntry.Create(Guid.NewGuid(), name!, "Best wishes!");
        act.Should().Throw<ArgumentException>().WithParameterName("senderName");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void GuestbookEntry_Create_Should_ThrowArgumentException_WhenMessageIsInvalid(string? message)
    {
        var act = () => GuestbookEntry.Create(Guid.NewGuid(), "Friend", message!);
        act.Should().Throw<ArgumentException>().WithParameterName("message");
    }
}
