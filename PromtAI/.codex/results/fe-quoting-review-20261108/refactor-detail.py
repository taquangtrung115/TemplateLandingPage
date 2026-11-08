from pathlib import Path
p=Path('FE_Quoting/src/pages/quotations/QuotationDetailPage.jsx')
s=p.read_text(encoding='utf-8').replace('useMemo }','useMemo, useRef }')
s=s.replace("import { Skeleton }", "import { Banner } from '@astryxdesign/core/Banner';\nimport { downloadBlob } from '../../utils/downloadFile';\nimport { Skeleton }")
s=s.replace("  const [activeTab,", "  const [changingStatus, setChangingStatus] = useState(false);\n  const [errorMessage, setErrorMessage] = useState(null);\n  const detailRequest = useRef(0);\n  const [activeTab,")
a=s.index('  const fetchDetail =');b=s.index('  const handleOpenStatusConfirm',a)
s=s[:a]+'''  const fetchDetail = async () => {
    const requestId = ++detailRequest.current;
    try {
      setLoading(true);
      setErrorMessage(null);
      const [detail, preview] = await Promise.all([
        quotationApi.getQuotationById(id),
        quotationApi.previewQuotation(id).catch(() => null),
      ]);
      if (requestId !== detailRequest.current) return;
      setQuotation(detail);
      setPreviewHtml(preview?.htmlContent || '');
    } catch (error) {
      if (requestId === detailRequest.current) setErrorMessage(error.message || 'Không thể tải báo giá. Vui lòng thử lại.');
    } finally {
      if (requestId === detailRequest.current) setLoading(false);
    }
  };

  useEffect(() => {
    setQuotation(null);
    setPreviewHtml('');
    fetchDetail();
    return () => { detailRequest.current += 1; };
  }, [id]);

''' + s[b:]
s=s.replace("Sent: 'Xác nhận gửi báo giá cho đối tác'", "Sent: 'Đánh dấu báo giá đã gửi?'").replace("Approved: 'Xác nhận phê duyệt báo giá'", "Approved: 'Phê duyệt báo giá?'").replace("Rejected: 'Xác nhận từ chối báo giá'", "Rejected: 'Từ chối báo giá?'")
s=s.replace('Báo giá sẽ được chuyển sang trạng thái "Đã gửi" và không thể hoàn tác về bản nháp.', 'Chỉ cập nhật trạng thái. Hãy gửi báo giá cho khách hàng qua kênh liên lạc của bạn trước khi xác nhận.').replace('Báo giá sẽ chính thức có hiệu lực hợp đồng với đối tác.', 'Ghi nhận báo giá đã được phê duyệt. Bạn sẽ không thể sửa nội dung báo giá sau bước này.')
a=s.index('  const executeStatusChange ='); b=s.index('  const formatVnd',a)
s=s[:a]+'''  const executeStatusChange = async () => {
    if (!statusDialog.targetStatus || changingStatus) return;
    setChangingStatus(true);
    try {
      await quotationApi.changeStatus(id, statusDialog.targetStatus, 'Cập nhật trên trang chi tiết báo giá');
      setStatusDialog({ isOpen: false, targetStatus: null, title: '', description: '' });
      toast({ body: 'Đã cập nhật trạng thái báo giá.', type: 'info' });
      await fetchDetail();
    } catch (error) {
      toast({ body: error.message || 'Không thể cập nhật trạng thái báo giá. Vui lòng thử lại.', type: 'error' });
    } finally { setChangingStatus(false); }
  };

  const handleExport = async (fileType) => {
    if (exporting) return;
    setExporting(true);
    try {
      const file = await quotationApi.exportFile(id, fileType);
      const blob = await quotationApi.downloadFile(id, file.id);
      downloadBlob(blob, file.fileName);
      toast({ body: `Đã tải báo giá ${fileType.toUpperCase()}.`, type: 'info' });
      await fetchDetail();
    } catch (error) {
      toast({ body: error.message || 'Không thể tải báo giá. Vui lòng thử lại.', type: 'error' });
    } finally { setExporting(false); }
  };

  const handleDownloadFile = async (file) => {
    if (exporting) return;
    setExporting(true);
    try {
      downloadBlob(await quotationApi.downloadFile(id, file.id), file.fileName);
    } catch (error) {
      toast({ body: error.message || 'Không thể tải tệp. Vui lòng thử lại.', type: 'error' });
    } finally { setExporting(false); }
  };

''' + s[b:]
s=s.replace("onClick={() => window.open(row.fileUrl, '_blank')}", 'onClick={() => handleDownloadFile(row)}\n          isDisabled={exporting}')
pos=s.index('  const fileColumns =');a=s.index('  ], []);',pos);s=s[:a]+s[a:].replace('  ], []);','  ], [id, exporting]);',1)
s=s.replace('  if (loading || !quotation) {', '''  if (!loading && (errorMessage || !quotation)) return (
    <VStack gap={4}>
      <Banner status="error" title="Không thể mở báo giá" description={errorMessage || 'Báo giá không tồn tại.'} />
      <Button label="Thử lại" onClick={fetchDetail} />
      <Button label="Về danh sách báo giá" variant="secondary" onClick={() => navigate('/quotations')} />
    </VStack>
  );

  if (loading) {''')
s=s.replace('        actionLabel="Đồng Ý"', '''        actionLabel={statusDialog.targetStatus === 'Sent' ? 'Đánh dấu đã gửi' : statusDialog.targetStatus === 'Approved' ? 'Phê duyệt' : 'Từ chối'}
        isActionLoading={changingStatus}''')
s=s.replace('                  title="PDF Preview"','                  title="Bản xem trước báo giá"\n                  sandbox=""')
s=s.replace('<HStack gap={3} vAlign="center">\n          <Button','<HStack gap={3} vAlign="center" wrap="wrap">\n          <Button',1)
s=s.replace('<HStack hAlign="between" vAlign="center">\n        <SegmentedControl', '<div className="quotation-tabs">\n        <SegmentedControl').replace('        </SegmentedControl>\n      </HStack>', '        </SegmentedControl>\n      </div>')
s=s.replace("disabled={exporting}", "isDisabled={exporting}") # ActionButton accepts native isDisabled through props too
p.write_text(s,encoding='utf-8')
p=Path('FE_Quoting/src/pages/quotations/CreateQuotationPage.jsx');s=p.read_text(encoding='utf-8');s=s.replace("      } catch (err) {\n\n      } finally {\n        setLoading(false);", "      } catch (err) {\n        if (isMounted) setErrorMessage(err.message || 'Không thể tải dữ liệu lập báo giá. Vui lòng tải lại trang.');\n      } finally {\n        if (isMounted) setLoading(false);")
s=s.replace("isGuid(selectedCustomerId) ? selectedCustomerId : null", "selectedCustomerId || null").replace("isGuid(selectedTemplateId) ? selectedTemplateId : null", "selectedTemplateId || null").replace("isGuid(it.productId) ? it.productId : null", "it.productId || null")
s=s.replace('const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;\nconst isGuid = (val) => typeof val === \'string\' && GUID_REGEX.test(val);\n\n','')
s=s.replace('const animatedLayout = useAnimatedLayout', 'useAnimatedLayout').replace('HStack, VStack, StackItem','HStack, VStack')
s=s.replace("import { TextInput } from '@astryxdesign/core/TextInput';\n",'').replace("import { HoverCard } from '@astryxdesign/core/HoverCard';\n",'')
p.write_text(s,encoding='utf-8')
