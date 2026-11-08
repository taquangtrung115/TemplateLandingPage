from pathlib import Path
p=Path('FE_Quoting/src/pages/quotations/CreateQuotationPage.jsx');s=p.read_text(encoding='utf-8')
s=s.replace("import { useNavigate }", "import { useNavigate, useParams }")
s=s.replace('  const navigate = useNavigate();', '  const navigate = useNavigate();\n  const { id } = useParams();\n  const isEditing = Boolean(id);\n  const [savedTemplateVersion, setSavedTemplateVersion] = useState(null);')
s=s.replace('const [customerList, productList, templateList] = await Promise.all([', 'const [customerList, productList, templateList, draft] = await Promise.all([')
s=s.replace('          quotingCustomerApi.getCustomers(),','          quotingCustomerApi.getCustomers({ includeInactive: isEditing }),').replace('          quotingTemplateApi.getTemplates(),','          quotingTemplateApi.getTemplates({ includeInactive: isEditing }),\n          isEditing ? quotationApi.getQuotationById(id) : Promise.resolve(null),')
s=s.replace('        setSelectedTemplateId(templateList?.[0]?.id || \'\');','''        setSelectedTemplateId(templateList?.[0]?.id || '');
        if (draft) {
          if (draft.status !== 'Draft') throw new Error('Chỉ có thể sửa báo giá ở trạng thái bản nháp.');
          setSelectedCustomerId(draft.customerId || '');
          setIsGenericCustomer(!draft.customerId);
          setSelectedTemplateId(draft.templateId);
          setSavedTemplateVersion(draft.templateVersion);
          setIssueDate(draft.issueDate.slice(0, 10));
          setValidUntil(draft.validUntil?.slice(0, 10) || '');
          setDiscountPercent(draft.discountPercent);
          setTaxPercent(draft.taxPercent);
          setNotes(draft.notes || '');
          setItems(draft.items.map((item) => ({ ...item, catalogPrice: productList.find((product) => product.id === item.productId)?.price ?? item.unitPrice })));
        }''')
s=s.replace('  }, []);\n\n  const selectedCustomer', '  }, [id]);\n\n  const selectedCustomer')
s=s.replace('version.version === selectedTemplate.currentVersion', 'version.version === (savedTemplateVersion || selectedTemplate.currentVersion)')
s=s.replace('templateVersion: selectedTemplate?.currentVersion || 1', 'templateVersion: savedTemplateVersion || selectedTemplate?.currentVersion || 1')
a=s.index('      const res = await quotationApi.createQuotation(payload);');b=s.index('    } catch (err)',a)
s=s[:a]+'''      if (isEditing) {
        await quotationApi.updateQuotation(id, payload);
        toast({ body: 'Đã lưu thay đổi báo giá.', type: 'info' });
        navigate(`/quotations/${id}`);
      } else {
        const quotationId = await quotationApi.createQuotation(payload);
        if (!quotationId || typeof quotationId !== 'string') throw new Error('Máy chủ chưa trả về mã báo giá hợp lệ.');
        toast({ body: 'Đã tạo báo giá.', type: 'info' });
        navigate(`/quotations/${quotationId}`);
      }
''' +s[b:]
s=s.replace('<Heading level={1}>Tạo báo giá</Heading>', '<Heading level={1}>{isEditing ? \'Sửa báo giá\' : \'Tạo báo giá\'}</Heading>')
s=s.replace('label={submitting ? \'Đang tạo báo giá...\' : \'Tạo báo giá\'}', "label={submitting ? 'Đang lưu...' : isEditing ? 'Lưu báo giá' : 'Tạo báo giá'}")
s=s.replace('                          value={selectedTemplateId}', '                          isDisabled={isEditing}\n                          value={selectedTemplateId}')
p.write_text(s,encoding='utf-8')
p=Path('FE_Quoting/src/routes/AppRoutes.jsx');s=p.read_text(encoding='utf-8').replace('        <Route path="quotations/:id"', '        <Route path="quotations/:id/edit" element={<CreateQuotationPage />} />\n        <Route path="quotations/:id"');p.write_text(s,encoding='utf-8')
p=Path('FE_Quoting/src/pages/quotations/QuotationDetailPage.jsx');s=p.read_text(encoding='utf-8')
s=s.replace('  const [changingStatus,', '  const [isDeleteOpen, setIsDeleteOpen] = useState(false);\n  const [deleting, setDeleting] = useState(false);\n  const [changingStatus,')
a=s.index('  const formatVnd');s=s[:a]+'''  const handleDeleteQuotation = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await quotationApi.deleteQuotation(id);
      toast({ body: 'Đã xóa báo giá khỏi danh sách.', type: 'info' });
      navigate('/quotations');
    } catch (error) { toast({ body: error.message || 'Không thể xóa báo giá. Vui lòng thử lại.', type: 'error' }); }
    finally { setDeleting(false); }
  };

''' +s[a:]
s=s.replace('      {/* Confirmation AlertDialog', '''      <AlertDialog isOpen={isDeleteOpen} onOpenChange={setIsDeleteOpen} title="Xóa báo giá?" description="Báo giá sẽ được ẩn khỏi danh sách. Dữ liệu lịch sử vẫn được giữ lại." actionLabel="Xóa báo giá" cancelLabel="Hủy" actionVariant="destructive" isActionLoading={deleting} onAction={handleDeleteQuotation} />
      {/* Confirmation AlertDialog''')
s=s.replace("          {quotation.status === 'Draft' && (\n            <ActionButton", "          {quotation.status === 'Draft' && <Button label=\"Sửa báo giá\" variant=\"secondary\" onClick={() => navigate(`/quotations/${id}/edit`)} />}\n          <Button label=\"Xóa báo giá\" variant=\"destructive\" isDisabled={exporting || changingStatus || deleting} onClick={() => setIsDeleteOpen(true)} />\n          {quotation.status === 'Draft' && (\n            <ActionButton")
p.write_text(s,encoding='utf-8')
