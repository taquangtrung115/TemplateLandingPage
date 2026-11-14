namespace OnePortal.Application.UseCases.V1.Quoting.Quotations.Queries.Download;

public sealed record DownloadQuotationFileResult(Stream Content, string ContentType, string FileName);
