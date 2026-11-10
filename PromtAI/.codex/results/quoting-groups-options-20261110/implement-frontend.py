from pathlib import Path
def edit(path,old,new):
 p=Path(path);s=p.read_text();assert old in s,(path,old[:60]);p.write_text(s.replace(old,new))
p='FE_Quoting/src/pages/products/ProductCatalogPage.jsx'
edit(p,"import { quotingProductApi }", "import RowActions from '../../components/common/RowActions';\nimport { quotingProductGroupApi } from '../../api/quotingProductGroupApi';\nimport { quotingProductApi }")
edit(p,"  const [products, setProducts] = useState([]);", "  const [products, setProducts] = useState([]);\n  const [groups, setGroups] = useState([]);")
start=Path(p).read_text().index('  const categoryFilterOptions = useMemo(');s=Path(p).read_text();end=s.index('  // Form Drawer State',start);s=s[:start]+'''  const categoryFilterOptions = useMemo(() => [
    { label: 'Tất cả nhóm sản phẩm', value: 'ALL' },
    ...groups.map((group) => ({ value: group.id, label: group.name })),
  ], [groups]);

'''+s[end:];Path(p).write_text(s)
edit(p,"const [category, setCategory] = useState('A/ DÒNG COMBO');", "const [groupId, setGroupId] = useState('');")
edit(p,"      const res = await quotingProductApi.getProducts({\n        includeInactive: true,\n      });", "      const [res, groupList] = await Promise.all([quotingProductApi.getProducts({ includeInactive: true }), quotingProductGroupApi.getGroups({ includeInactive: true })]);\n      setGroups(groupList);")
edit(p,"setCategory('A/ DÒNG COMBO');", "setGroupId(groups.find((group) => group.isActive)?.id || '');")
edit(p,"setCategory(p.category || 'A/ DÒNG COMBO');", "setGroupId(p.groupId || groups.find((group) => group.name === p.category)?.id || '');")
edit(p,"    if (!unit.trim()", "    if (!groupId) { setErrorMessage('Chọn nhóm sản phẩm trong danh mục.'); return; }\n    if (!unit.trim()")
edit(p,"          category,", "          groupId,\n          category: groups.find((group) => group.id === groupId)?.name,")
edit(p,"p.category === selectedCategory", "p.groupId === selectedCategory")
s=Path(p).read_text();start=s.index("        renderCell: (row) => (\n          <HStack gap={1}>",s.index("key: 'actions'"));end=s.index('\n      },',start)
s=s[:start]+'''        renderCell: (row) => <RowActions label={row.name} actions={[
          isAdmin && { label: 'Sửa sản phẩm', icon: PencilSquareIcon, onClick: () => handleOpenEdit(row) },
          isAdmin && { label: 'Xóa sản phẩm', icon: TrashIcon, destructive: true, onClick: () => handleConfirmDelete(row.id) },
        ]} />,'''+s[end:];s=s.replace('[isAdmin]\n  );','[isAdmin, groups]\n  );');Path(p).write_text(s)
start=Path(p).read_text().index('                <TextInput\n                  label="Nhóm sản phẩm"');s=Path(p).read_text();end=s.index('\n              </Field>',start);s=s[:start]+'''                <Selector label="Nhóm sản phẩm" isLabelHidden id="product-field-5" aria-labelledby="product-field-5-label"
                  value={groupId || undefined} onChange={setGroupId} hasSearch placeholder="Chọn nhóm sản phẩm"
                  options={groups.filter((group) => (group.isActive || group.id === groupId) && !group.isDeleted).map((group) => ({ value: group.id, label: group.name }))} />'''+s[end:];Path(p).write_text(s)
# Route and nav registration.
p='FE_Quoting/src/routes/AppRoutes.jsx';edit(p,"const CustomerListPage =", "const ProductGroupPage = lazy(() => import('../pages/products/ProductGroupPage'));\nconst CustomerListPage =");edit(p,'        <Route path="products"', '        <Route path="product-groups" element={<ProductGroupPage />} />\n        <Route path="products"')
p='FE_Quoting/src/layouts/QuotingLayout.jsx';edit(p,"      { label: 'Danh mục sản phẩm'", "      { label: 'Nhóm sản phẩm', path: '/product-groups', icon: ViewColumnsIcon },\n      { label: 'Danh mục sản phẩm'")
p='FE_Quoting/src/api/quotationApi.js';edit(p,'export const quotationApi = {','''export const quotationApi = {
  previewDraft: async (data, signal) => {
    const response = await axiosInstance.post('/quoting/quotations/preview-draft', data, { signal });
    return response.data?.value ?? response.data;
  },''')
p='FE_Quoting/src/pages/quotations/QuotationListPage.jsx';edit(p,"import { quotationApi }", "import RowActions from '../../components/common/RowActions';\nimport { quotationApi }")
edit(p,'{formatVnd(row.totalAmount)}',"{row.showGrandTotal === false ? '—' : formatVnd(row.totalAmount)}")
s=Path(p).read_text();start=s.index('        renderCell: (row) => (',s.index("key: 'actions'"));end=s.index('\n      },',start);s=s[:start]+'''        renderCell: (row) => <RowActions label={row.quotationNumber} actions={[
          { label: 'Xem chi tiết', icon: EyeIcon, onClick: () => navigate(`/quotations/${row.id}`) },
          row.status === 'Draft' && { label: 'Sửa báo giá', onClick: () => navigate(`/quotations/${row.id}/edit`) },
        ]} />,'''+s[end:];s=s.replace('<Grid className="quoting-grid"','<Grid className="quoting-grid quotation-metrics"');Path(p).write_text(s)
print('Group management, product dropdown, actions and routes wired')
