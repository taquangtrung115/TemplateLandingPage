from pathlib import Path
p=Path('FE_Quoting/src/pages/quotations/QuotationListPage.jsx');s=p.read_text(encoding='utf-8')
s=s.replace("import { Card }", "import { Banner } from '@astryxdesign/core/Banner';\nimport { Card }")
s=s.replace('  const [quotations,', '  const [errorMessage, setErrorMessage] = useState(null);\n  const [totalItems, setTotalItems] = useState(0);\n  const [summary, setSummary] = useState(null);\n  const [quotations,')
a=s.index('  const fetchQuotations =');b=s.index('  // Columns definition',a)
s=s[:a]+'''  useEffect(() => {
    let isMounted = true;
    quotationApi.getSummary().then((result) => { if (isMounted) setSummary(result); }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const result = await quotationApi.getQuotations({ search: searchTerm.trim() || undefined, status: selectedStatus === 'ALL' ? undefined : selectedStatus, page, pageSize });
        if (!isMounted) return;
        setQuotations(result?.data || []);
        setTotalItems(result?.total || 0);
        setErrorMessage(null);
      } catch (error) {
        if (isMounted) setErrorMessage(error.message || 'Không thể tải danh sách báo giá. Vui lòng thử lại.');
      } finally { if (isMounted) setLoading(false); }
    }, 250);
    return () => { isMounted = false; clearTimeout(timer); };
  }, [searchTerm, selectedStatus, page, pageSize]);

  const totalCount = summary?.totalCount ?? '—';
  const draftCount = summary?.draftCount ?? '—';
  const sentCount = summary?.sentCount ?? '—';
  const approvedCount = summary?.approvedCount ?? '—';

''' + s[b:]
s=s.replace("  { label: 'Đã phê duyệt (Approved)', value: 'Approved' },", "  { label: 'Đã phê duyệt', value: 'Approved' },\n  { label: 'Đã từ chối', value: 'Rejected' },\n  { label: 'Đã hủy', value: 'Cancelled' },")
s=s.replace('visibleQuotations.length', 'totalItems').replace('data={paginatedQuotations}', 'data={quotations}')
s=s.replace('onChange={(val) => setSelectedStatus(val)}', 'onChange={(val) => { setSelectedStatus(val); setPage(1); }}').replace('onChange={(val) => setSearchTerm(val)}', 'onChange={(val) => { setSearchTerm(val); setPage(1); }}')
s=s.replace('onPageSizeChange={setPageSize}', 'onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}')
s=s.replace('      {/* Main Table', '      {errorMessage && <Banner status="error" title="Không thể tải báo giá" description={errorMessage} />}\n      {/* Main Table')
s=s.replace('        ) : totalItems === 0 ? (', '        ) : errorMessage ? <div style={{ padding: 24 }}><Text>Vui lòng tải lại trang để thử lại.</Text></div> : totalItems === 0 ? (')
p.write_text(s,encoding='utf-8')
p=Path('FE_Quoting/src/pages/dashboard/DashboardPage.jsx');s=p.read_text(encoding='utf-8')
s=s.replace("import { Card }", "import { Banner } from '@astryxdesign/core/Banner';\nimport { Skeleton } from '@astryxdesign/core/Skeleton';\nimport { Card }")
s=s.replace('  const [quotations,','  const [summary, setSummary] = useState(null);\n  const [errorMessage, setErrorMessage] = useState(null);\n  const [quotations,')
s=s.replace('const result = await quotationApi.getQuotations({ pageSize: 50 });', 'const [result, summaryResult] = await Promise.all([quotationApi.getQuotations({ page: 1, pageSize: 5 }), quotationApi.getSummary()]);')
s=s.replace('          setQuotations(result?.data || []);','          setQuotations(result?.data || []);\n          setSummary(summaryResult);')
s=s.replace('          setQuotations([]);', "          setErrorMessage(err.message || 'Không thể tải tổng quan báo giá. Vui lòng thử lại.');")
a=s.index('  // Tính toán KPI');b=s.index('  const columns =',a)
s=s[:a]+'''  const totalQuotations = summary?.totalCount ?? 0;
  const pendingCount = (summary?.draftCount ?? 0) + (summary?.sentCount ?? 0);
  const approvedCount = summary?.approvedCount ?? 0;
  const totalEstimatedRevenue = summary?.totalAmount ?? 0;
  const chartData = useMemo(() => Object.entries(summary?.monthlyAmounts || {}).map(([month, value]) => ({ name: `${month.slice(5)}/${month.slice(0, 4)}`, value })), [summary]);

''' +s[b:]
s=s.replace('change="+12% tháng này"', 'change="Toàn bộ báo giá"').replace("quotations.filter((q) => q.status === 'Draft').length", "summary?.draftCount ?? 0").replace("quotations.filter((q) => q.status === 'Sent').length", "summary?.sentCount ?? 0")
s=s.replace('  return (\n    <VStack gap={6}>', '''  if (loading) return <VStack gap={4} aria-label="Đang tải tổng quan"><Skeleton height={40} /><Skeleton height={120} /><Skeleton height={300} /></VStack>;
  if (errorMessage) return <Banner status="error" title="Không thể tải tổng quan" description={errorMessage} />;

  return (
    <VStack gap={6}>''')
p.write_text(s,encoding='utf-8')
