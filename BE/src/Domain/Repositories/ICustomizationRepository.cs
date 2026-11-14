namespace OnePortal.Domain.Repositories;

using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities;
using OnePortal.Domain.ReadModels;

public interface ICustomizationRepository : IRepositoryBase<UserCustomization, Guid>
{
    Task<UserCustomization?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<List<UserCustomization>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<bool> ExistsBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<UserCustomization?> ReadByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CustomizationAccess?> ReadAccessAsync(Guid id, CancellationToken cancellationToken = default);
    Task<UserCustomization?> GetByClientDraftIdAsync(Guid userId, Guid clientDraftId, CancellationToken cancellationToken = default);
    Task<Guid?> FindSlugOwnerAsync(string slug, CancellationToken cancellationToken = default);
    void AddAlias(CustomizationSlugAlias alias);
    void AddVersion(CustomizationVersion version);
    Task<CustomizationVersion?> GetVersionAsync(Guid customizationId, Guid versionId, CancellationToken cancellationToken = default);
    Task<CustomizationVersion?> ReadVersionAsync(Guid customizationId, Guid versionId, CancellationToken cancellationToken = default);
    Task<CustomizationVersion?> GetVersionByRequestAsync(Guid customizationId, Guid requestId, CancellationToken cancellationToken = default);
    Task<PublishedCustomization?> GetPublicVersionAsync(Guid versionId, CancellationToken cancellationToken = default);
    Task<PublishedCustomization?> GetPublicAsync(string slug, int? versionNumber, CancellationToken cancellationToken = default);
    Task<List<CustomizationVersion>> GetPublishedVersionsAsync(Guid customizationId, CancellationToken cancellationToken = default);
    Task<(List<CustomizationSummary> Data, int Total)> SearchAsync(Guid? userId, bool ownerless, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<(List<CustomizationVersionSummary> Data, int Total)> GetVersionsAsync(Guid customizationId, int page, int pageSize, CancellationToken cancellationToken = default);
}
