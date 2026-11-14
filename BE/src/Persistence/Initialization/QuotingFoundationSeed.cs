namespace OnePortal.Persistence.Initialization;

using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using OnePortal.Domain.Entities.Quoting;

public sealed class QuotingFoundationSeed : ITenantSeedStep
{
    public string AppKey => "quoting";
    public string Key => "foundation";
    public int Version => 1;

    public async Task ApplyAsync(ApplicationDbContext context, string tenantName, CancellationToken cancellationToken)
    {
        if (!await context.QuotingProductGroups.IgnoreQueryFilters().AnyAsync(group => group.TenantId == context.CurrentTenantId, cancellationToken))
            context.QuotingProductGroups.Add(QuotingProductGroup.Create("GENERAL", "Chung", "Nhóm mặc định của workspace", 0));
        if (await context.QuotationTemplates.IgnoreQueryFilters().AnyAsync(template => template.TenantId == context.CurrentTenantId, cancellationToken)) return;
        var template = QuotationTemplate.Create("SYSTEM-DEFAULT", "Báo giá tiêu chuẩn", "Workspace quotation template", true);
        template.AddNewVersion("BẢNG BÁO GIÁ", JsonSerializer.Serialize(new { companyName = tenantName, address = "", taxCode = "", phone = "" }),
            "Kính gửi Quý khách hàng,", "{\"showStt\":true,\"showCode\":true,\"showUnit\":true,\"showUnitPrice\":true}",
            "{\"validityDays\":30}", "{\"leftTitle\":\"KHÁCH HÀNG\",\"rightTitle\":\"ĐẠI DIỆN CÔNG TY\"}", null, null);
        context.QuotationTemplates.Add(template);
    }
}
