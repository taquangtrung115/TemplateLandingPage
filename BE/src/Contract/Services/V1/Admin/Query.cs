namespace TemplateLandingPage.Contract.Services.V1.Admin;

using TemplateLandingPage.Contract.Abstractions.Message;

public record GetAdminOverviewQuery() : IQuery<AdminOverviewResponse>;
