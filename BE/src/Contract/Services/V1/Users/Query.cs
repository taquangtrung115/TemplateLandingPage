namespace OnePortal.Contract.Services.V1.Users;

using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Services.V1.Auth;

public record GetUsersQuery() : IQuery<List<UserResponse>>;

public record GetUserByIdQuery(Guid Id) : IQuery<UserResponse>;
