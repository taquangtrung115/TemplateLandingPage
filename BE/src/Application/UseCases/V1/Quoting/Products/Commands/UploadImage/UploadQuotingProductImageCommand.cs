namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Products.Commands.UploadImage;
using TemplateLandingPage.Contract.Abstractions.Message;
public sealed record UploadQuotingProductImageCommand(Stream Content, string ContentType, long Length) : ICommand<UploadQuotingProductImageResult>;
