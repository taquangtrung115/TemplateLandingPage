namespace OnePortal.Contract.Services.V1.PhotoPrint.Products;

using OnePortal.Contract.Abstractions.Message;

public sealed record SaveCategoryCommand(Guid? Id, PhotoCategoryInput Input) : ICommand<object>;

public sealed record DeleteCategoryCommand(Guid Id) : ICommand<object>;

public sealed record SaveProductCommand(Guid? Id, PhotoProductInput Input) : ICommand<object>;

public sealed record DeleteProductCommand(Guid Id) : ICommand<object>;
