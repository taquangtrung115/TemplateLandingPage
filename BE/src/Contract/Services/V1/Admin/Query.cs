namespace OnePortal.Contract.Services.V1.Admin;

using OnePortal.Contract.Abstractions.Message;

public record GetAdminOverviewQuery() : IQuery<AdminOverviewResponse>;
