namespace TemplateLandingPage.Contract.Services.V1.Admin;

public sealed record AdminOverviewResponse(int TemplatesCount, int UsersCount, int RsvpsCount, int GuestbookCount);
