namespace TemplateLandingPage.UnitTests.Application.Behaviors;

using FluentAssertions;
using FluentValidation;
using MediatR;
using Moq;
using TemplateLandingPage.Application.Behaviors;
using TemplateLandingPage.Application.UseCases.V1.Auth.Validators;
using TemplateLandingPage.Application.UseCases.V1.Categories.Commands.Validators;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Auth;
using TemplateLandingPage.Contract.Services.V1.Categories;
using Xunit;

public class ValidationPipelineBehaviorTests
{
    [Fact]
    public async Task Handle_Should_CallNext_WhenNoValidatorsAreRegistered()
    {
        // Arrange
        var validators = Enumerable.Empty<IValidator<UpdateCategoryCommand>>();
        var behavior = new ValidationPipelineBehavior<UpdateCategoryCommand, Result>(validators);
        var command = new UpdateCategoryCommand(Guid.NewGuid(), "Valid Category", "valid-slug", null, null, 1, true);

        var nextCalled = false;
        RequestHandlerDelegate<Result> next = () =>
        {
            nextCalled = true;
            return Task.FromResult(Result.Success());
        };

        // Act
        var result = await behavior.Handle(command, next, CancellationToken.None);

        // Assert
        nextCalled.Should().BeTrue();
        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_Should_CallNext_WhenCommandIsValid_NonGenericResult()
    {
        // Arrange
        var validator = new UpdateCategoryCommandValidator();
        var validators = new IValidator<UpdateCategoryCommand>[] { validator };
        var behavior = new ValidationPipelineBehavior<UpdateCategoryCommand, Result>(validators);
        var command = new UpdateCategoryCommand(Guid.NewGuid(), "Valid Category", "valid-slug", null, null, 1, true);

        var nextCalled = false;
        RequestHandlerDelegate<Result> next = () =>
        {
            nextCalled = true;
            return Task.FromResult(Result.Success());
        };

        // Act
        var result = await behavior.Handle(command, next, CancellationToken.None);

        // Assert
        nextCalled.Should().BeTrue();
        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_Should_ReturnValidationResult_WithoutCallingNext_WhenCommandIsInvalid_NonGenericResult()
    {
        // Arrange
        var validator = new UpdateCategoryCommandValidator();
        var validators = new IValidator<UpdateCategoryCommand>[] { validator };
        var behavior = new ValidationPipelineBehavior<UpdateCategoryCommand, Result>(validators);
        // Invalid: empty Id, empty Name, empty Slug
        var command = new UpdateCategoryCommand(Guid.Empty, string.Empty, string.Empty, null, null, 1, true);

        var nextCalled = false;
        RequestHandlerDelegate<Result> next = () =>
        {
            nextCalled = true;
            return Task.FromResult(Result.Success());
        };

        // Act
        var result = await behavior.Handle(command, next, CancellationToken.None);

        // Assert
        nextCalled.Should().BeFalse();
        result.IsFailure.Should().BeTrue();
        result.Should().BeAssignableTo<IValidationResult>();

        var validationResult = (IValidationResult)result;
        validationResult.Errors.Should().NotBeEmpty();
        validationResult.Errors.Should().Contain(e => e.Code == nameof(UpdateCategoryCommand.Id));
        validationResult.Errors.Should().Contain(e => e.Code == nameof(UpdateCategoryCommand.Name));
        validationResult.Errors.Should().Contain(e => e.Code == nameof(UpdateCategoryCommand.Slug));
    }

    [Fact]
    public async Task Handle_Should_CallNext_WhenCommandIsValid_GenericResult()
    {
        // Arrange
        var validator = new LoginCommandValidator();
        var validators = new IValidator<LoginCommand>[] { validator };
        var behavior = new ValidationPipelineBehavior<LoginCommand, Result<LoginResponse>>(validators);
        var command = new LoginCommand("valid@example.com", "Password123!");

        var userResponse = new UserResponse(Guid.NewGuid(), "valid@example.com", "Valid User", "User", true, null, DateTime.UtcNow);
        var expectedResponse = new LoginResponse("test-token", userResponse);
        var nextCalled = false;
        RequestHandlerDelegate<Result<LoginResponse>> next = () =>
        {
            nextCalled = true;
            return Task.FromResult(Result.Success(expectedResponse));
        };

        // Act
        var result = await behavior.Handle(command, next, CancellationToken.None);

        // Assert
        nextCalled.Should().BeTrue();
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(expectedResponse);
    }

    [Fact]
    public async Task Handle_Should_ReturnValidationResult_WithoutCallingNext_WhenCommandIsInvalid_GenericResult()
    {
        // Arrange
        var validator = new LoginCommandValidator();
        var validators = new IValidator<LoginCommand>[] { validator };
        var behavior = new ValidationPipelineBehavior<LoginCommand, Result<LoginResponse>>(validators);
        // Invalid: invalid email and empty password
        var command = new LoginCommand("invalid-email", string.Empty);

        var nextCalled = false;
        RequestHandlerDelegate<Result<LoginResponse>> next = () =>
        {
            nextCalled = true;
            var user = new UserResponse(Guid.NewGuid(), "dummy@example.com", "Dummy", "User", true, null, DateTime.UtcNow);
            return Task.FromResult(Result.Success(new LoginResponse("token", user)));
        };

        // Act
        var result = await behavior.Handle(command, next, CancellationToken.None);

        // Assert
        nextCalled.Should().BeFalse();
        result.IsFailure.Should().BeTrue();
        result.Should().BeAssignableTo<IValidationResult>();

        var validationResult = (IValidationResult)result;
        validationResult.Errors.Should().NotBeEmpty();
        validationResult.Errors.Should().Contain(e => e.Code == nameof(LoginCommand.Email));
        validationResult.Errors.Should().Contain(e => e.Code == nameof(LoginCommand.Password));
    }
}
