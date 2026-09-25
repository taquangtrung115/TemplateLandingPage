namespace TemplateLandingPage.Persistence.Repositories;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Domain.ReadModels;
using TemplateLandingPage.Domain.Repositories;

public sealed class AdminOverviewRepository(ApplicationDbContext dbContext) : IAdminOverviewRepository
{
    public async Task<AdminOverviewCounts> GetCountsAsync(CancellationToken cancellationToken = default)
    {
        var templatesCount = await dbContext.Templates.CountAsync(template => !template.IsDeleted, cancellationToken);
        var usersCount = await dbContext.Users.CountAsync(user => !user.IsDeleted, cancellationToken);
        var rsvpsCount = await dbContext.RsvpEntries.CountAsync(cancellationToken);
        var guestbookCount = await dbContext.GuestbookEntries.CountAsync(cancellationToken);

        return new AdminOverviewCounts(templatesCount, usersCount, rsvpsCount, guestbookCount);
    }
}
