namespace OnePortal.Application.UseCases.V1.Quoting.Products.Queries.GetImage;
using OnePortal.Contract.Abstractions.Message;
public sealed record GetQuotingProductImageQuery(string FileName) : IQuery<GetQuotingProductImageResult>;
