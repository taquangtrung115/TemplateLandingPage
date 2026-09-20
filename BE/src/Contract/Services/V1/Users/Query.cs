namespace TemplateLandingPage.Contract.Services.V1.Users;

using TemplateLandingPage.Contract.Abstractions.Message;
using TemplateLandingPage.Contract.Services.V1.Auth;

public record GetUsersQuery() : IQuery<List<UserResponse>>;

public record GetUserByIdQuery(Guid Id) : IQuery<UserResponse>;
