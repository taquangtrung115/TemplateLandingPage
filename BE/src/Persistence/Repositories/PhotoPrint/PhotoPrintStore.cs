namespace OnePortal.Persistence.Repositories.PhotoPrint;

using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;

public sealed partial class PhotoPrintStore(ApplicationDbContext database, IRequestActor actor, ITenantContext scope) : IPhotoPrintStore
{
    private readonly ApplicationDbContext _database = database;
    private readonly IRequestActor _actor = actor;
    private readonly ITenantContext _scope = scope;
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static readonly string[] Models = ["framed_photo", "crystal_mirror", "canvas_wrap", "polaroid_card", "photobook_open"];
    private static readonly string[] PricingModes = ["PerPrintSizeTier", "PerUnit", "PerSqm"];
    private static readonly string[] UsageTypes = ["memories", "decor", "gifts", "events"];
    private static readonly string[] ChargeUnits = ["PerUnit", "PerSqm"];
    private static readonly string[] FrameColors = ["oak", "black", "gold", "white"];

    private static Result<object> Success(object value) => Result.Success(value);
    private static Result<object> Invalid(string message = "Dữ liệu Photo Print chưa hợp lệ.") => Result.Failure<object>(new Error("PhotoPrint.Invalid", message));
    private static Result<object> Missing(string message = "Không tìm thấy bản ghi.") => Result.Failure<object>(new Error("PhotoPrint.NotFound", message));
    private static Result<object> Conflict(string message = "Dữ liệu đã thay đổi. Vui lòng tải lại.") => Result.Failure<object>(new Error("PhotoPrint.Conflict", message));
    private static Result<object> Forbidden() => Result.Failure<object>(new Error("PhotoPrint.Forbidden", "Yêu cầu quyền quản trị tiệm ảnh."));
    private static string Serialize<T>(T value) => JsonSerializer.Serialize(value, Json);
    private static T[] ReadArray<T>(string value) => JsonSerializer.Deserialize<T[]>(value, Json) ?? [];
    private static string? Trim(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private static bool Fits(string? value, int length) => value is null || value.Length <= length;
    private static bool Required(string? value, int length) => !string.IsNullOrWhiteSpace(value) && value.Length <= length;
    private static bool Unit(string? value) => value is null or "PerUnit" or "PerSqm";
    private static bool IsPrice(decimal price) => price is >= 0 and <= 1_000_000_000;
    private static bool IsSize(decimal width, decimal height) => width is >= .1m and <= 500m && height is >= .1m and <= 500m;
    private static bool IsSlug(string? value) => Required(value, 100) && Regex.IsMatch(value!, "^[a-z0-9]+(?:-[a-z0-9]+)*$");
    private static bool IsHttps(string? value) => value is not null && !value.Any(char.IsControl) && !value.Contains('\\') &&
        Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme == "https" && string.IsNullOrEmpty(uri.UserInfo);
    private static bool Asset(string? value) => string.IsNullOrWhiteSpace(value) || (value.Length <= 2048 &&
        (IsHttps(value) || Regex.IsMatch(value, "^/(?:assets/|api/v1/photoprint/uploads/|t/[a-z0-9-]+/api/v1/photoprint/uploads/)[a-zA-Z0-9_.-]+$")));
    private static (int Page, int Size) Paging(int page, int size) => (Math.Clamp(page, 1, 100_000), Math.Clamp(size, 1, 100));

    private async Task<Result<object>> SaveAsync(Func<object> response, CancellationToken cancellationToken)
    {
        try { await _database.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateConcurrencyException) { return Conflict(); }
        catch (DbUpdateException error) when (error.InnerException is PostgresException { SqlState: "23505" })
        { return Conflict("Mã hoặc tên đường dẫn đã tồn tại."); }
        return Success(response());
    }
}
