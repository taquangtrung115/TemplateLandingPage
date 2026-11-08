namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Products.Commands.UploadImage;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
public sealed class UploadQuotingProductImageCommandHandler(IQuotingProductImageService imageService) : ICommandHandler<UploadQuotingProductImageCommand, UploadQuotingProductImageResult>
{
    #region Fields
    private readonly IQuotingProductImageService _imageService = imageService;
    #endregion
    #region Upload
    public async Task<Result<UploadQuotingProductImageResult>> Handle(UploadQuotingProductImageCommand request, CancellationToken cancellationToken)
    {
        var uploaded = await _imageService.UploadAsync(request.Content, request.ContentType, cancellationToken);
        return uploaded.IsSuccess ? Result.Success(new UploadQuotingProductImageResult(uploaded.Value)) : Result.Failure<UploadQuotingProductImageResult>(uploaded.Error);
    }
    #endregion
}
