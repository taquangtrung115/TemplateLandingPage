from pathlib import Path
root=Path.cwd()
def write(path,text):
 p=root/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text,encoding='utf-8')
def edit(path,old,new):
 p=root/path;s=p.read_text(encoding='utf-8-sig');assert old in s,(path,old[:100]);p.write_text(s.replace(old,new),encoding='utf-8')
base='BE/src/Application/UseCases/V1/Quoting/ProductGroups'
common='''using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Domain.Repositories.Quoting;
'''
write(f'{base}/QuotingProductGroupErrors.cs','''namespace TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups;
using TemplateLandingPage.Contract.Abstractions.Shared;
public static class QuotingProductGroupErrors
{
    public static readonly Error NotFound = new("ProductGroup.NotFound", "Chọn nhóm sản phẩm đang hoạt động trong danh mục.");
    public static readonly Error DuplicateCode = new("ProductGroup.DuplicateCode", "Mã nhóm sản phẩm đã tồn tại.");
    public static readonly Error InUse = new("ProductGroup.InUse", "Nhóm đang có sản phẩm. Chuyển sản phẩm sang nhóm khác trước khi xóa.");
}
''')
for action in ['Create','Update','Delete']:
 ns=f'TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Commands.{action}'
 cls=f'{action}QuotingProductGroup'
 args='string Code, string Name, string? Description, int SortOrder, bool IsActive = true'
 if action=='Update':args='Guid Id, '+args
 if action=='Delete':args='Guid Id'
 write(f'{base}/Commands/{action}/{cls}Command.cs',f'namespace {ns};\nusing TemplateLandingPage.Contract.Abstractions.Message;\npublic sealed record {cls}Command({args}) : ICommand<{cls}Result>;\n')
 write(f'{base}/Commands/{action}/{cls}Result.cs',f'namespace {ns};\npublic sealed record {cls}Result(Guid Id);\n')
 body=''
 if action!='Create':
  body+='''        var group = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (group is null || group.IsDeleted) return Result.Failure<RESULT>(QuotingProductGroupErrors.NotFound);
'''
 if action!='Delete':
  body+='''        if (!await repository.IsCodeUniqueAsync(request.Code, EXCLUDE, cancellationToken))
            return Result.Failure<RESULT>(QuotingProductGroupErrors.DuplicateCode);
'''.replace('EXCLUDE','null' if action=='Create' else 'request.Id')
  body+=('        var group = QuotingProductGroup.Create' if action=='Create' else '        group.Update')+'(request.Code, request.Name, request.Description, request.SortOrder, request.IsActive);\n'
 else:
  body+='''        if (await repository.HasProductsAsync(request.Id, cancellationToken))
            return Result.Failure<RESULT>(QuotingProductGroupErrors.InUse);
        group.Delete();
'''
 body+=f'        repository.{"Add" if action=="Create" else "Update"}(group);\n        await unitOfWork.SaveChangesAsync(cancellationToken);\n        return Result.Success(new {cls}Result(group.Id));\n'
 write(f'{base}/Commands/{action}/{cls}CommandHandler.cs',f'''namespace {ns};
{common}
public sealed class {cls}CommandHandler(IQuotingProductGroupRepository repository, IUnitOfWork unitOfWork)
    : ICommandHandler<{cls}Command, {cls}Result>
{{
    public async Task<Result<{cls}Result>> Handle({cls}Command request, CancellationToken cancellationToken)
    {{
{body.replace('RESULT',cls+'Result')}    }}
}}
''')
 if action!='Delete':
  write(f'{base}/Commands/{action}/{cls}CommandValidator.cs',f'''namespace {ns};
using FluentValidation;
public sealed class {cls}CommandValidator : AbstractValidator<{cls}Command>
{{
    public {cls}CommandValidator()
    {{
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
    }}
}}
''')
ns='TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Queries.Search'
write(f'{base}/Queries/Search/SearchQuotingProductGroupsQuery.cs',f'''namespace {ns};
using TemplateLandingPage.Contract.Abstractions.Message;
public sealed record SearchQuotingProductGroupsQuery(bool IncludeInactive = false) : IQuery<SearchQuotingProductGroupsResult>;
''')
write(f'{base}/Queries/Search/SearchQuotingProductGroupsResult.cs',f'''namespace {ns};
using TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Dtos;
public sealed record SearchQuotingProductGroupsResult(List<QuotingProductGroupDto> Groups);
''')
write(f'{base}/Dtos/QuotingProductGroupDto.cs','''namespace TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Dtos;
public sealed record QuotingProductGroupDto(Guid Id, string Code, string Name, string? Description, int SortOrder, bool IsActive);
''')
write(f'{base}/Queries/Search/SearchQuotingProductGroupsQueryHandler.cs',f'''namespace {ns};
{common}using TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Dtos;
public sealed class SearchQuotingProductGroupsQueryHandler(IQuotingProductGroupRepository repository)
    : IQueryHandler<SearchQuotingProductGroupsQuery, SearchQuotingProductGroupsResult>
{{
    public async Task<Result<SearchQuotingProductGroupsResult>> Handle(SearchQuotingProductGroupsQuery request, CancellationToken cancellationToken)
    {{
        var groups = await repository.SearchAsync(request.IncludeInactive, cancellationToken);
        return Result.Success(new SearchQuotingProductGroupsResult(groups.Select(group =>
            new QuotingProductGroupDto(group.Id, group.Code, group.Name, group.Description, group.SortOrder, group.IsActive)).ToList()));
    }}
}}
''')
write('BE/src/Presentation/APIs/Quoting/QuotingProductGroupApi.cs','''namespace TemplateLandingPage.Presentation.APIs.Quoting;

using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Commands.Create;
using TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Commands.Update;
using TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Commands.Delete;
using TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Queries.Search;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Presentation.Abstractions;
using TemplateLandingPage.Presentation.Authorization;

public sealed class QuotingProductGroupApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/quoting/product-groups").WithTags("QuotingProductGroups").RequireAuthorization();
        group.MapGet("", async (bool? includeInactive, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new SearchQuotingProductGroupsQuery(includeInactive == true), ct)));
        group.MapPost("", async (CreateQuotingProductGroupCommand request, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(request, ct), StatusCodes.Status201Created)).RequireAuthorization(AuthorizationPolicies.AdminOnly);
        group.MapPut("{id:guid}", async (Guid id, UpdateQuotingProductGroupCommand request, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(request with { Id = id }, ct))).RequireAuthorization(AuthorizationPolicies.AdminOnly);
        group.MapDelete("{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new DeleteQuotingProductGroupCommand(id), ct))).RequireAuthorization(AuthorizationPolicies.AdminOnly);
    }

    private static IResult Respond<T>(Result<T> result, int status = StatusCodes.Status200OK)
    {
        if (result.IsSuccess) return Results.Json(result, statusCode: status);
        if (result is IValidationResult validation)
            return Results.BadRequest(new { title = "Validation Error", errors = validation.Errors });
        var errorStatus = result.Error.Code.EndsWith("NotFound") ? StatusCodes.Status404NotFound :
            result.Error.Code.EndsWith("DuplicateCode") || result.Error.Code.EndsWith("InUse") ? StatusCodes.Status409Conflict : StatusCodes.Status400BadRequest;
        return Results.Json(new { title = "Request failed", error = result.Error }, statusCode: errorStatus);
    }
}
''')
edit('BE/src/Persistence/ApplicationDbContext.cs','    public DbSet<QuotingProduct> QuotingProducts','    public DbSet<QuotingProductGroup> QuotingProductGroups => Set<QuotingProductGroup>();\n    public DbSet<QuotingProduct> QuotingProducts')
edit('BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs','        services.AddScoped<IQuotingProductRepository','        services.AddScoped<IQuotingProductGroupRepository, QuotingProductGroupRepository>();\n        services.AddScoped<IQuotingProductRepository')
edit('BE/src/Domain/Entities/Quoting/QuotingProduct.cs','    public string? Category { get; private set; }','    public string? Category { get; private set; }\n    public Guid? GroupId { get; private set; }\n    public QuotingProductGroup? Group { get; private set; }')
edit('BE/src/Domain/Entities/Quoting/QuotingProduct.cs','    public void Delete()','    public void AssignGroup(QuotingProductGroup group)\n    {\n        GroupId = group.Id;\n        Category = group.Name;\n    }\n\n    public void Delete()')
edit('BE/src/Persistence/Configurations/Quoting/QuotingProductConfiguration.cs','        builder.Property(p => p.Category)','        builder.HasOne(p => p.Group).WithMany().HasForeignKey(p => p.GroupId).OnDelete(DeleteBehavior.Restrict);\n\n        builder.Property(p => p.Category)')
edit('BE/src/Contract/Services/V1/Quoting/Products/Command.cs','bool IsActive = true) : ICommand<Guid>;','bool IsActive = true, Guid? GroupId = null) : ICommand<Guid>;')
edit('BE/src/Contract/Services/V1/Quoting/Products/Command.cs','bool IsActive) : ICommand;','bool IsActive, Guid? GroupId = null) : ICommand;')
edit('BE/src/Contract/Services/V1/Quoting/Products/Response.cs','DateTime? ModifiedAtUtc);','DateTime? ModifiedAtUtc, Guid? GroupId = null, int GroupSortOrder = 0);')
for action in ['Create','Update']:
 p=f'BE/src/Application/UseCases/V1/Quoting/Products/Commands/{action}QuotingProductCommandHandler.cs'
 edit(p,'    private readonly IUnitOfWork _unitOfWork;','    private readonly IUnitOfWork _unitOfWork;\n    private readonly IQuotingProductGroupRepository _groupRepository;')
 edit(p,f'ILogger<{action}QuotingProductCommandHandler> logger)',f'ILogger<{action}QuotingProductCommandHandler> logger,\n        IQuotingProductGroupRepository groupRepository)')
 edit(p,'        _logger = logger;','        _logger = logger;\n        _groupRepository = groupRepository;')
 marker='        var isUnique = '
 pth=root/p;s=pth.read_text();idx=s.index(marker)
 check='''        var group = await _groupRepository.ResolveAsync(request.GroupId, request.Category, cancellationToken);
        if (group is null || (!group.IsActiveINACTIVE))
            return Result.FailureGENERIC(TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.QuotingProductGroupErrors.NotFound);

'''.replace('INACTIVE','' if action=='Create' else ' && product.GroupId != group.Id').replace('GENERIC','<Guid>' if action=='Create' else '')
 pth.write_text(s[:idx]+check+s[idx:])
 edit(p,'        _productRepository.'+('Add' if action=='Create' else 'Update')+'(product);','        product.AssignGroup(group);\n        _productRepository.'+('Add' if action=='Create' else 'Update')+'(product);')
for p,var in [('BE/src/Application/UseCases/V1/Quoting/Products/Queries/GetQuotingProductsQueryHandler.cs','p'),('BE/src/Application/UseCases/V1/Quoting/Products/Queries/GetQuotingProductByIdQueryHandler.cs','product')]:
 edit(p,f'            {var}.Category,',f'            {var}.Group?.Name ?? {var}.Category,')
 edit(p,f'            {var}.ModifiedAtUtc)',f'            {var}.ModifiedAtUtc, {var}.GroupId, {var}.Group?.SortOrder ?? 0)')
edit('BE/src/Persistence/Repositories/Quoting/QuotingProductRepository.cs','var query = DbSet.AsNoTracking().Where(p => !p.IsDeleted);','var query = DbSet.AsNoTracking().Include(p => p.Group).Where(p => !p.IsDeleted);')
edit('BE/src/Persistence/Repositories/Quoting/QuotingProductRepository.cs','query = query.Where(p => p.IsActive);','query = query.Where(p => p.IsActive && (p.Group == null || (p.Group.IsActive && !p.Group.IsDeleted)));')
edit('BE/src/Persistence/Repositories/Quoting/QuotingProductRepository.cs','p.Category != null && p.Category.ToLower() == normalizedCat','(p.Group != null ? p.Group.Name : p.Category) != null && (p.Group != null ? p.Group.Name : p.Category)!.ToLower() == normalizedCat')
edit('BE/src/Persistence/Repositories/Quoting/QuotingProductRepository.cs','query.OrderBy(p => p.Code)','query.OrderBy(p => p.Group != null ? p.Group.SortOrder : 0).ThenBy(p => p.Code)')
# Include group in single-product reads through a dedicated no-tracking method.
edit('BE/src/Domain/Repositories/Quoting/IQuotingProductRepository.cs','    Task<bool> IsCodeUniqueAsync','    Task<QuotingProduct?> GetForReadAsync(Guid id, CancellationToken cancellationToken);\n    Task<bool> IsCodeUniqueAsync')
edit('BE/src/Persistence/Repositories/Quoting/QuotingProductRepository.cs','    public async Task<bool> IsCodeUniqueAsync','    public Task<QuotingProduct?> GetForReadAsync(Guid id, CancellationToken cancellationToken) =>\n        DbSet.AsNoTracking().Include(p => p.Group).FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);\n\n    public async Task<bool> IsCodeUniqueAsync')
edit('BE/src/Application/UseCases/V1/Quoting/Products/Queries/GetQuotingProductByIdQueryHandler.cs','_productRepository.GetByIdAsync','_productRepository.GetForReadAsync')
edit('BE/src/Presentation/APIs/Quoting/QuotingProductApi.cs','                request.IsActive);','                request.IsActive, request.GroupId);')
edit('BE/src/Presentation/APIs/Quoting/QuotingProductApi.cs','bool IsActive = true);','bool IsActive = true, Guid? GroupId = null);')
edit('BE/src/Presentation/APIs/Quoting/QuotingProductApi.cs','bool IsActive);','bool IsActive, Guid? GroupId = null);')
print('Product group domain, CQRS, API and catalog contracts updated')
