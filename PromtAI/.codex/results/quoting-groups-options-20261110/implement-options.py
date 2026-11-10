from pathlib import Path
root=Path.cwd()
def edit(path,old,new):
 p=root/path;s=p.read_text(encoding='utf-8-sig');assert old in s or new in s,(path,old[:70]);p.write_text(s if new in s else s.replace(old,new),encoding='utf-8')
flags=['ShowDiscount','ShowQuantity','ShowSubTotal','ShowGrandTotal']
p='BE/src/Domain/Entities/Quoting/Quotation.cs'
edit(p,'    public string? Notes { get; private set; }','    public string? Notes { get; private set; }\n'+''.join(f'    public bool {f} {{ get; private set; }} = true;\n' for f in flags))
edit(p,'    public void RecalculateTotals()', '''    public void SetDisplayOptions(bool showDiscount, bool showQuantity, bool showSubTotal, bool showGrandTotal)
    {
        ShowDiscount = showDiscount;
        ShowQuantity = showQuantity;
        ShowSubTotal = showSubTotal;
        ShowGrandTotal = showGrandTotal;
    }

    public void RecalculateTotals()''')
p='BE/src/Contract/Services/V1/Quoting/Quotations/Command.cs'
edit(p,'    int SortOrder = 0);','    int SortOrder = 0, int GroupSortOrder = 0);')
for suffix in ['ICommand<Guid>;','ICommand;']:
 old='    Guid UserId = default) : '+suffix
 # update only Create and Update (ChangeStatus shares ending, so first occurrence)
 path=root/p;s=path.read_text();idx=s.index(old)
 s=s[:idx]+s[idx:].replace(old,'    Guid UserId = default,\n'+',\n'.join(f'    bool {f} = true' for f in flags)+') : '+suffix,1);path.write_text(s)
p='BE/src/Contract/Services/V1/Quoting/Quotations/Response.cs'
edit(p,'    List<QuotationFileResponse> Files);','    List<QuotationFileResponse> Files,\n'+',\n'.join(f'    bool {f} = true' for f in flags)+');')
edit(p,'    int SortOrder);','    int SortOrder, int GroupSortOrder = 0);')
edit(p,'    DateTime CreatedAtUtc);','    DateTime CreatedAtUtc);') # list visibility added separately
# Need only list response to signal hidden totals.
path=root/p;s=path.read_text();s=s.replace('    DateTime CreatedAtUtc);','    DateTime CreatedAtUtc, bool ShowGrandTotal = true);',1);path.write_text(s)
p='BE/src/Domain/Entities/Quoting/QuotationItem.cs'
edit(p,'    public int SortOrder { get; private set; }','    public int SortOrder { get; private set; }\n    public int GroupSortOrder { get; private set; }')
# Only public factory takes new optional argument; constructor stays unchanged.
path=root/p;s=path.read_text();idx=s.index('    public static QuotationItem Create(');s=s[:idx]+s[idx:].replace('        int sortOrder)','        int sortOrder, int groupSortOrder = 0)',1);s=s.replace('        return new QuotationItem(','        var item = new QuotationItem(',1);end='            sortOrder);';pos=s.index(end,idx)+len(end);s=s[:pos]+'\n        item.GroupSortOrder = groupSortOrder;\n        return item;'+s[pos:];path.write_text(s)
for action in ['Create','Update']:
 p=f'BE/src/Application/UseCases/V1/Quoting/Quotations/Commands/{action}QuotationCommandHandler.cs'
 edit(p,'dto.SortOrder > 0 ? dto.SortOrder : idx + 1)', 'dto.SortOrder > 0 ? dto.SortOrder : idx + 1, dto.GroupSortOrder)')
 edit(p,'        quotation.SetItems(items, request.UserId);','        quotation.SetDisplayOptions(request.ShowDiscount, request.ShowQuantity, request.ShowSubTotal, request.ShowGrandTotal);\n        quotation.SetItems(items, request.UserId);')
p='BE/src/Application/UseCases/V1/Quoting/Quotations/Queries/GetQuotationByIdQueryHandler.cs'
edit(p,'quotation.Items.OrderBy(i => i.SortOrder)','quotation.Items.OrderBy(i => i.GroupSortOrder).ThenBy(i => i.SortOrder)')
edit(p,'            i.SortOrder)', '            i.SortOrder, i.GroupSortOrder)')
edit(p,'            files);','            files, quotation.ShowDiscount, quotation.ShowQuantity, quotation.ShowSubTotal, quotation.ShowGrandTotal);')
p='BE/src/Application/UseCases/V1/Quoting/Quotations/Queries/GetQuotationsQueryHandler.cs'
edit(p,'            q.CreatedAtUtc)', '            q.CreatedAtUtc, q.ShowGrandTotal)')
p='BE/src/Presentation/APIs/Quoting/QuotationApi.cs'
edit(p,'                UserId(user));','                UserId(user), request.ShowDiscount, request.ShowQuantity, request.ShowSubTotal, request.ShowGrandTotal);')
edit(p,'    List<QuotationItemDto>? Items = null);','    List<QuotationItemDto>? Items = null,\n'+',\n'.join(f'    bool {f} = false' for f in flags)+');')
edit(p,'    List<QuotationItemDto> Items);','    List<QuotationItemDto> Items,\n'+',\n'.join(f'    bool {f} = false' for f in flags)+');')
# Seed default groups, retaining any existing legacy category as its own group.
p='BE/src/Persistence/Data/QuotingSeeder.cs'
edit(p,'        // 1. Seed System Template V1','''        // Group identities are reused on seed so catalog edits and quotation snapshots survive.
        var groups = await context.QuotingProductGroups.IgnoreQueryFilters().ToListAsync();
        foreach (var definition in new[] { (Code: "COMBO", Name: "A/ DÒNG COMBO", Order: 1), (Code: "XIEN-QUE", Name: "B/ DÒNG SẢN PHẨM XIÊN QUE", Order: 2) })
        {
            if (groups.Any(group => group.Code == definition.Code)) continue;
            var group = QuotingProductGroup.Create(definition.Code, definition.Name, null, definition.Order);
            context.QuotingProductGroups.Add(group);
            groups.Add(group);
        }
        var ungrouped = await context.QuotingProducts.IgnoreQueryFilters().Where(product => product.GroupId == null).ToListAsync();
        foreach (var bucket in ungrouped.GroupBy(product => string.IsNullOrWhiteSpace(product.Category) ? "Chưa phân loại" : product.Category.Trim()))
        {
            var group = groups.FirstOrDefault(group => group.Name == bucket.Key);
            if (group is null)
            {
                group = QuotingProductGroup.Create($"LEGACY-{Guid.NewGuid():N}", bucket.Key, null, groups.Count + 1);
                context.QuotingProductGroups.Add(group);
                groups.Add(group);
            }
            foreach (var product in bucket) product.AssignGroup(group);
        }
        await context.SaveChangesAsync();

        // 1. Seed System Template V1''')
edit(p,'            context.QuotingProducts.Add(QuotingProduct.Create(product.Code, product.Name, product.Desc, product.Unit, product.Price, product.Img, product.Cat));','''            var entity = QuotingProduct.Create(product.Code, product.Name, product.Desc, product.Unit, product.Price, product.Img, product.Cat);
            entity.AssignGroup(groups.Single(group => group.Code == (product.Code.StartsWith("CB-") ? "COMBO" : "XIEN-QUE")));
            context.QuotingProducts.Add(entity);''')
print('Display flags, snapshot group order and safe idempotent seeding added')

