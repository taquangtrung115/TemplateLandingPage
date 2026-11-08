namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Products.Dtos;
public sealed record UploadedQuotingProductImageDto(string ImageUrl, string FileName, string ContentType, int Width, int Height, int Size);
