namespace OnePortal.Application.UseCases.V1.Users.Commands;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Users;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Repositories;

public sealed class DeleteUserCommandHandler : ICommandHandler<DeleteUserCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteUserCommandHandler(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        if (request.Id == request.CurrentUserId)
        {
            return Result.Failure(UserErrors.CannotDeleteSelf);
        }

        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        if (user is null)
        {
            return Result.Failure(UserErrors.NotFound);
        }

        user.Delete();
        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
