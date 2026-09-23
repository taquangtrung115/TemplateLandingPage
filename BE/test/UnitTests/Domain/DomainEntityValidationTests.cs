namespace TemplateLandingPage.UnitTests.Domain;

using FluentAssertions;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Infrastructure.Services;
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
    public void User_CreateExternal_Should_InitializeProperly()
    {
        var user = User.CreateExternal("oauth@test.com", "OAuth User", "https://img.com/avatar.jpg", "Google");
        user.Email.Should().Be("oauth@test.com");
        user.FullName.Should().Be("OAuth User");
        user.AvatarUrl.Should().Be("https://img.com/avatar.jpg");
        user.Provider.Should().Be("Google");
        user.Role.Should().Be("User");
        user.IsActive.Should().BeTrue();
        user.PasswordHash.Should().StartWith("EXTERNAL_GOOGLE_");
    }

    [Fact]
    public void User_CreateExternal_Should_FallbackFullName_WhenFullNameIsEmpty()
    {
        var user = User.CreateExternal("john.doe@test.com", "", null, "Facebook");
        user.FullName.Should().Be("john.doe");
        user.Provider.Should().Be("Facebook");
    }

    [Fact]
    public void User_UpdateExternalProfile_Should_UpdateMissingFields()
    {
        var user = User.Create("test@domain.com", "hash", "test");
        user.UpdateExternalProfile("New Full Name", "https://new.avatar/1.jpg", "Google");

        user.FullName.Should().Be("New Full Name");
        user.AvatarUrl.Should().Be("https://new.avatar/1.jpg");
        user.Provider.Should().Be("Google");
        user.ModifiedAtUtc.Should().NotBeNull();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void User_CreateExternal_Should_ThrowArgumentException_WhenEmailIsInvalid(string? email)
    {
        var act = () => User.CreateExternal(email!, "OAuth User", null, "Google");
        act.Should().Throw<ArgumentException>().WithParameterName("email");
    }

    [Fact]
    public void User_CreateExternal_DummyHash_Should_NeverVerifyWithPasswordHasher()
    {
        // Arrange
        var hasher = new PasswordHasher();
        var googleUser = User.CreateExternal("oauth.google@test.com", "Google User", null, "Google");
        var fbUser = User.CreateExternal("oauth.facebook@test.com", "FB User", null, "Facebook");

        // Act & Assert: Empty password
        hasher.VerifyPassword("", googleUser.PasswordHash).Should().BeFalse();
        hasher.VerifyPassword("", fbUser.PasswordHash).Should().BeFalse();

        // Act & Assert: Arbitrary password attempts
        hasher.VerifyPassword("Password@123", googleUser.PasswordHash).Should().BeFalse();
        hasher.VerifyPassword("Admin123!", fbUser.PasswordHash).Should().BeFalse();

        // Act & Assert: Trying the dummy hash string itself
        hasher.VerifyPassword(googleUser.PasswordHash, googleUser.PasswordHash).Should().BeFalse();
        hasher.VerifyPassword(fbUser.PasswordHash, fbUser.PasswordHash).Should().BeFalse();
    }

    [Fact]
    public void User_UpdateExternalProfile_Should_NotOverwriteExistingAvatar_WhenAvatarAlreadySet()
    {
        // Arrange
        var user = User.Create("existing@domain.com", "hash", "Existing User");
        user.UpdateExternalProfile("Existing User", "https://initial.avatar/1.jpg", "Local");

        // Act: External login provides a different avatar URL
        user.UpdateExternalProfile("New Name", "https://new.social.avatar/2.jpg", "Facebook");

        // Assert: Existing avatar must be preserved
        user.AvatarUrl.Should().Be("https://initial.avatar/1.jpg");
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
