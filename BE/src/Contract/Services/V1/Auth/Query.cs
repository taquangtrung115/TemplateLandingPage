namespace OnePortal.Contract.Services.V1.Auth;

using OnePortal.Contract.Abstractions.Message;

public record GetCurrentUserQuery(Guid UserId) : IQuery<UserResponse>;
