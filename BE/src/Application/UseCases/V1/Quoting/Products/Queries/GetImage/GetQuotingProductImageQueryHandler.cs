namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Products.Queries.GetImage;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
public sealed class GetQuotingProductImageQueryHandler(IQuotingProductImageService imageService) : IQueryHandler<GetQuotingProductImageQuery, GetQuotingProductImageResult>
{
    #region Fields
    private readonly IQuotingProductImageService _imageService = imageService;
    #endregion
    #region Read
    public async Task<Result<GetQuotingProductImageResult>> Handle(GetQuotingProductImageQuery request, CancellationToken cancellationToken)
    {
        var image = await _imageService.GetAsync(request.FileName, cancellationToken);
        return image is null ? Result.Failure<GetQuotingProductImageResult>(new Error("QuotingProductImage.NotFound", "Không tìm thấy ảnh sản phẩm.")) : Result.Success(new GetQuotingProductImageResult(image.Data, image.ContentType));
    }
    #endregion
}
