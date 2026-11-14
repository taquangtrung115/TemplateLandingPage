namespace OnePortal.Application.UseCases.V1.Admin.Queries;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Admin;
using OnePortal.Domain.Repositories;

public sealed class GetAdminOverviewQueryHandler : IQueryHandler<GetAdminOverviewQuery, AdminOverviewResponse>
{
    private readonly IAdminOverviewRepository _adminOverviewRepository;

    public GetAdminOverviewQueryHandler(IAdminOverviewRepository adminOverviewRepository)
    {
        _adminOverviewRepository = adminOverviewRepository;
    }

    public async Task<Result<AdminOverviewResponse>> Handle(GetAdminOverviewQuery request, CancellationToken cancellationToken)
    {
        var counts = await _adminOverviewRepository.GetCountsAsync(cancellationToken);
        return Result.Success(new AdminOverviewResponse(
            counts.TemplatesCount,
            counts.UsersCount,
            counts.RsvpsCount,
            counts.GuestbookCount));
    }
}
