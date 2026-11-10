from pathlib import Path
p=Path('BE/src/Domain/Entities/Quoting/QuotingProduct.cs');s=p.read_text().replace('AssignGroup(QuotingProductGroup group)','AssignGroup(QuotingProductGroup group, bool updateLegacyCategory = true)').replace('        Category = group.Name;','        if (updateLegacyCategory) Category = group.Name;');p.write_text(s)
p=Path('BE/src/Persistence/Data/QuotingSeeder.cs');s=p.read_text().replace('foreach (var product in bucket) product.AssignGroup(group);','foreach (var product in bucket) product.AssignGroup(group, updateLegacyCategory: false);');p.write_text(s)
p=Path('BE/test/IntegrationTests/QuotingRegressionIntegrationTests.cs');s=p.read_text().replace('category = "Nhóm riêng"','category = "A/ DÒNG COMBO"');p.write_text(s)
p=Path('BE/test/IntegrationTests/QuotingProductImageIntegrationTests.cs');s=p.read_text().replace('price = 18000, imageUrl = url','price = 18000, category = "A/ DÒNG COMBO", imageUrl = url').replace('price = 18000, imageUrl = replacement','price = 18000, category = "A/ DÒNG COMBO", imageUrl = replacement');p.write_text(s)
p=Path('BE/test/IntegrationTests/QuotingFullFlowIntegrationTests.cs');s=p.read_text().replace('        // 2. Tạo Sản Phẩm','''        using var createGroupResponse = await ApiTestJson.SendJsonAsync(client, HttpMethod.Post, "/api/v1/quoting/product-groups",
            new { code = $"SURIMI-{Guid.NewGuid():N}", name = "Surimi Chế Biến", sortOrder = 3, isActive = true });
        createGroupResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        using var groupBody = await ApiTestJson.ReadAsync(createGroupResponse);
        var groupId = groupBody.RootElement.GetProperty("value").GetProperty("id").GetGuid();

        // 2. Tạo Sản Phẩm''').replace('            category = "Surimi Chế Biến"','            category = "Surimi Chế Biến", groupId');p.write_text(s)
p=Path('FE_Quoting/test/fixtures.js');s=p.read_text();s='''export const groups = [
  { id: 'a0000000-0000-4000-8000-000000000001', code: 'COMBO', name: 'A/ DÒNG COMBO', sortOrder: 1, isActive: true },
  { id: 'b0000000-0000-4000-8000-000000000002', code: 'XIEN-QUE', name: 'B/ DÒNG SẢN PHẨM XIÊN QUE', sortOrder: 2, isActive: true },
];
'''+s;s=s.replace("code: 'CB-01', name:","groupId: groups[0].id, groupSortOrder: 1, code: 'CB-01', name:");p.write_text(s)
for name in ['astryxControls.test.jsx','createQuotationPage.test.jsx','mobileProducts.test.jsx','productImageUpload.test.jsx','tableFilterPages.test.jsx']:
 p=Path('FE_Quoting/test')/name;s=p.read_text();s="import { groups } from './fixtures';\n"+s;s=s.replace("import { groups } from './fixtures';\nimport React", "import { groups } from './fixtures';\nimport React");marker="vi.mock('../src/api/quotingProductApi'";idx=s.index(marker);s=s[:idx]+"vi.mock('../src/api/quotingProductGroupApi', () => ({ quotingProductGroupApi: { getGroups: vi.fn(async () => (await import('./fixtures')).groups) } }));\n"+s[idx:];p.write_text(s)
# Update action-menu interaction assertions.
p=Path('FE_Quoting/test/astryxControls.test.jsx');s=p.read_text().replace('      fireEvent.click(editBtn);',"      fireEvent.click(editBtn);\n      fireEvent.click(await screen.findByRole('menuitem', { name: 'Sửa khách hàng' }));",1)
# Product edit test previously clicked the first secondary control.
needle="const editBtn = document.querySelector('button[data-variant=\"secondary\"][data-size=\"sm\"]');"
pos=s.find(needle,s.find('8. Switch Controls'))
if pos!=-1:
 sub=s[pos:];sub=sub.replace('fireEvent.click(editBtn);',"fireEvent.click(editBtn);\n      fireEvent.click(await screen.findByRole('menuitem', { name: 'Sửa sản phẩm' }));",1);s=s[:pos]+sub
p.write_text(s)
p=Path('FE_Quoting/src/pages/products/ProductCatalogPage.jsx');s=p.read_text();start=s.index('                      <HStack gap={2} wrap="wrap">',s.index('product-mobile-list'));end=s.index('\n                      </HStack>',start)+len('\n                      </HStack>');s=s[:start]+'''                      {isAdmin && <RowActions label={product.name} actions={[
                        { label: 'Sửa sản phẩm', icon: PencilSquareIcon, onClick: () => handleOpenEdit(product) },
                        { label: 'Xóa sản phẩm', icon: TrashIcon, destructive: true, onClick: () => handleConfirmDelete(product.id) },
                      ]} />}'''+s[end:];p.write_text(s)
p=Path('FE_Quoting/test/mobileProducts.test.jsx');s=p.read_text().replace("fireEvent.click(within(list).getByRole('button', { name: `Sửa ${product.name}` }));", "fireEvent.click(within(list).getByRole('button', { name: `Thao tác ${product.name}` })); fireEvent.click(await screen.findByRole('menuitem', { name: 'Sửa sản phẩm' }));");p.write_text(s)
p=Path('FE_Quoting/test/createQuotationPage.test.jsx');s=p.read_text().replace('getQuotationById: vi.fn()','getQuotationById: vi.fn(), previewDraft: vi.fn(async () => ({ htmlContent: \'<h1>BÁO GIÁ</h1>\' }))');s=s.replace("fireEvent.click(screen.getByRole('button', { name: /Combo nguyên bản ·/ }));", "fireEvent.click(screen.getByRole('combobox', { name: 'Thêm theo nhóm sản phẩm' }));\n  fireEvent.click(await screen.findByRole('option', { name: groups[0].name }));",1);s=s.replace("getByLabelText('Đơn giá báo giá (VNĐ)')","getByLabelText(`Đơn giá báo giá (VNĐ) ${product.name}`)");s=s.replace("fireEvent.click(screen.getByRole('radio', { name: /Chọn khách hàng doanh nghiệp/ }));\n    fireEvent.click(screen.getByRole('radio', { name: customer.name }));", "fireEvent.click(screen.getByRole('switch', { name: /Bỏ qua chọn khách hàng/ }));\n    fireEvent.click(screen.getByRole('combobox', { name: 'Khách hàng nhận báo giá' }));\n    fireEvent.click(await screen.findByRole('option', { name: new RegExp(customer.name) }));");s=s.replace("    fireEvent.click(screen.getByRole('radio', { name: /Báo giá chung/ }));",'');s=s.replace("getByRole('group', { name: 'Thuế suất VAT' }).querySelector('input')", "getByLabelText('Thuế suất VAT (%)')");s=s.replace("queryByRole('group', { name: 'Thuế suất VAT' })", "queryByLabelText('Thuế suất VAT (%)')");s=s.replace("it('adds the same product by increasing quantity without duplicating rows'", "it('adds a group idempotently without changing quantities'");s=s.replace("    fireEvent.click(screen.getByRole('button', { name: /Combo nguyên bản ·/ }));\n    expect(screen.getAllByLabelText('Số lượng')).toHaveLength(1);\n    expect(screen.getByLabelText('Số lượng')).toHaveValue('2');", "    fireEvent.click(screen.getByRole('button', { name: 'Thêm cả nhóm' }));\n    expect(screen.getAllByLabelText(`Đơn giá báo giá (VNĐ) ${product.name}`)).toHaveLength(1);\n    expect(screen.queryByLabelText(`Số lượng ${product.name}`)).not.toBeInTheDocument();");p.write_text(s)
print('Existing regression suites aligned with explicit group selection and picker interactions')
