namespace TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Dtos;
public sealed record QuotingProductGroupDto(Guid Id, string Code, string Name, string? Description, int SortOrder, bool IsActive);
