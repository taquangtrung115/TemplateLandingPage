namespace TemplateLandingPage.Application.UseCases.V1.Admin.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Admin;
using TemplateLandingPage.Domain.Repositories;

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
