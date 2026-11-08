namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Products.Queries.GetImage;
using TemplateLandingPage.Contract.Abstractions.Message;
public sealed record GetQuotingProductImageQuery(string FileName) : IQuery<GetQuotingProductImageResult>;
