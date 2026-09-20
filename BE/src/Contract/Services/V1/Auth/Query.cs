namespace TemplateLandingPage.Contract.Services.V1.Auth;

using TemplateLandingPage.Contract.Abstractions.Message;

public record GetCurrentUserQuery(Guid UserId) : IQuery<UserResponse>;
