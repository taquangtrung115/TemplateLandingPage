namespace TemplateLandingPage.Persistence.Repositories.Quoting;

using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Domain.Repositories.Quoting;

public sealed class QuotingSupportRepository(ApplicationDbContext context)
    : RepositoryBase<QuotingSupportRequest, Guid>(context), IQuotingSupportRepository { }
