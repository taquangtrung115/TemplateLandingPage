from pathlib import Path
import re
p=Path('FE_Quoting/src/pages/products/ProductCatalogPage.jsx');s=p.read_text(encoding='utf-8')
a=s.index('const PDF_SAMPLE_PRODUCTS =');b=s.index('export default function ProductCatalogPage',a);s=s[:a]+s[b:]
a=s.index('      let list = res;');b=s.index('    } finally {',a)
s=s[:a]+'''      setProducts(res || []);
      setLoadError(null);
    } catch (error) {
      setLoadError(error.message || 'Không thể tải sản phẩm. Vui lòng thử lại.');
''' +s[b:]
s=s.replace("import { Card }", "import { Banner } from '@astryxdesign/core/Banner';\nimport { Card }")
s=s.replace("  const [products,", "  const [loadError, setLoadError] = useState(null);\n  const [deleting, setDeleting] = useState(false);\n  const [products,")
s=s.replace("        search: searchTerm || undefined,\n",'')
s=s.replace('  const handleSave = async () => {','  const handleSave = async () => {\n    if (saving || !isAdmin) return;')
s=s.replace('    try {\n      setSaving(true);', "    if (!unit.trim() || price === null || !Number.isFinite(Number(price)) || Number(price) < 0) { setErrorMessage('Nhập đơn vị tính và đơn giá không âm.'); return; }\n    try {\n      setSaving(true);",1)
s=s.replace('if (!deletingProductId) return;', 'if (!deletingProductId || deleting || !isAdmin) return;\n    setDeleting(true);')
s=s.replace("      toast({ body: 'Không thể xóa sản phẩm.', type: 'error' });\n    }", "      toast({ body: err.message || 'Không thể xóa sản phẩm. Vui lòng thử lại.', type: 'error' });\n    } finally { setDeleting(false); }")
s=s.replace('                onClick={() => handleOpenEdit(row)}','                label={`Sửa ${row.name}`}\n                isIconOnly\n                isDisabled={!isAdmin}\n                onClick={() => handleOpenEdit(row)}')
s=s.replace('                onClick={() => handleConfirmDelete(row.id)}','                label={`Xóa ${row.name}`}\n                isIconOnly\n                onClick={() => handleConfirmDelete(row.id)}')
s=s.replace('          onClick={handleOpenAdd}', '          onClick={handleOpenAdd}\n          isDisabled={!isAdmin}')
s=s.replace('                    disabled={!!editingProduct}', '                    isDisabled={!!editingProduct}')
s=s.replace('        onOpenChange={setIsFormOpen}', '        onOpenChange={(open) => { if (!saving) setIsFormOpen(open); }}')
s=s.replace('        onAction={executeDelete}', '        onAction={executeDelete}\n        isActionLoading={deleting}')
s=s.replace('      {/* Main Table or Skeleton */}', '      {loadError && <Banner status="error" title="Không thể tải sản phẩm" description={loadError} />}\n      {loadError && <Button label="Thử lại" onClick={fetchProducts} />}\n      {/* Main Table or Skeleton */}')
s=s.replace('onPageSizeChange={setPageSize}', 'onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}')
s=s.replace('  const paginatedProducts = useMemo', '  useEffect(() => { setPage((current) => Math.min(current, Math.max(1, Math.ceil(filteredProducts.length / pageSize)))); }, [filteredProducts.length, pageSize]);\n\n  const paginatedProducts = useMemo')
p.write_text(s,encoding='utf-8')
p=Path('FE_Quoting/src/pages/customers/CustomerListPage.jsx');s=p.read_text(encoding='utf-8')
s=s.replace("import { Card }", "import { Banner } from '@astryxdesign/core/Banner';\nimport { Card }")
s=s.replace('  const [customers,', '  const [loadError, setLoadError] = useState(null);\n  const [deleting, setDeleting] = useState(false);\n  const [customers,')
s=s.replace('        searchTerm: searchTerm || undefined,\n','')
s=s.replace('      setCustomers(res || []);','      setCustomers(res || []);\n      setLoadError(null);')
s=s.replace('    } catch (err) {\n\n      setCustomers([]);','    } catch (err) {\n      setLoadError(err.message || \'Không thể tải khách hàng. Vui lòng thử lại.\');')
s=s.replace('  const handleSave = async () => {','  const handleSave = async () => {\n    if (saving) return;')
s=s.replace('    try {\n      setSaving(true);', "    if (email.trim() && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.trim())) { setErrorMessage('Nhập địa chỉ email hợp lệ.'); return; }\n    try {\n      setSaving(true);",1)
s=s.replace('if (!deletingCustomerId) return;', 'if (!deletingCustomerId || deleting) return;\n    setDeleting(true);')
s=s.replace("      toast({ body: 'Không thể xóa khách hàng.', type: 'error' });\n    }", "      toast({ body: err.message || 'Không thể xóa khách hàng. Vui lòng thử lại.', type: 'error' });\n    } finally { setDeleting(false); }")
s=s.replace('onPageSizeChange={setPageSize}', 'onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}')
s=s.replace('        onAction={executeDelete}', '        onAction={executeDelete}\n        isActionLoading={deleting}')
s=s.replace('        onOpenChange={setIsFormOpen}', '        onOpenChange={(open) => { if (!saving) setIsFormOpen(open); }}')
s=s.replace('      {/* Main Table', '      {loadError && <Banner status="error" title="Không thể tải khách hàng" description={loadError} />}\n      {loadError && <Button label="Thử lại" onClick={fetchCustomers} />}\n      {/* Main Table')
s=s.replace('  const paginatedCustomers = useMemo', '  useEffect(() => { setPage((current) => Math.min(current, Math.max(1, Math.ceil(filteredCustomers.length / pageSize)))); }, [filteredCustomers.length, pageSize]);\n\n  const paginatedCustomers = useMemo')
s=s.replace("import { Field, FieldLabel }", "import { Field }")
p.write_text(s,encoding='utf-8')
