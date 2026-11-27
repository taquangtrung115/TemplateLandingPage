namespace OnePortal.Contract.Services.V1.PhotoPrint.Demos;

using OnePortal.Contract.Abstractions.Message;

public sealed record GetDemosQuery(string? Model3DType, string? Search, bool IncludeInactive, int Page, int PageSize) : IQuery<object>;
