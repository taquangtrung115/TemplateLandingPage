import { resolveApiAssetUrl } from '../../api/apiUrl';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Stepper, Step } from '@astryxdesign/core/Stepper';
import { Card } from '@astryxdesign/core/Card';
import { Button } from '../../components/common/Button';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Switch } from '@astryxdesign/core/Switch';
import { Selector } from '@astryxdesign/core/Selector';
import { MultiSelector } from '@astryxdesign/core/MultiSelector';
import { Calendar } from '@astryxdesign/core/Calendar';
import { useMediaQuery } from '@astryxdesign/core/hooks';
import { useToast } from '@astryxdesign/core/Toast';
import { Icon } from '@astryxdesign/core/Icon';
import { TrashIcon, ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, ArrowPathIcon, SquaresPlusIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { quotingCustomerApi } from '../../api/quotingCustomerApi';
import { quotingProductApi } from '../../api/quotingProductApi';
import { quotingProductGroupApi } from '../../api/quotingProductGroupApi';
import { quotingTemplateApi } from '../../api/quotingTemplateApi';
import { quotationApi } from '../../api/quotationApi';
import { calculateQuotation } from '../../utils/quotationCalculation';
import { QuotingTable, pixel, proportional } from '../../components/common/QuotingTable';
import RowActions from '../../components/common/RowActions';

const STEPS = ['Khách hàng & Mẫu', 'Dòng sản phẩm', 'Điều khoản & VAT', 'Xác nhận tạo'];
const formatVnd = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 2 }).format(value || 0);
const parseConfig = (json) => { try { return JSON.parse(json || '{}'); } catch { return {}; } };
const fromProduct = (product) => ({ id: product.id, productId: product.id, productCode: product.code, productName: product.name,
  description: product.description, unit: product.unit, imageUrl: product.imageUrl, itemGroup: product.category,
  groupId: product.groupId, groupSortOrder: product.groupSortOrder ?? 0, catalogPrice: product.price,
  quantity: 1, unitPrice: product.price, discountPercent: 0, notes: '' });

export default function CreateQuotationPage() {
  // #region State and effects
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const toast = useToast();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isCompact = useMediaQuery('(max-width: 1023px)');
  const presentation = isCompact ? 'bottom-sheet' : 'popover';
  const [step, setStep] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isGenericCustomer, setIsGenericCustomer] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [savedTemplateVersion, setSavedTemplateVersion] = useState(null);
  const [issueDate, setIssueDate] = useState(new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [includeVat, setIncludeVat] = useState(false);
  const [taxPercent, setTaxPercent] = useState(10);
  const [notes, setNotes] = useState('');
  const [display, setDisplay] = useState({ showDiscount: false, showQuantity: false, showSubTotal: false, showGrandTotal: false });
  const [items, setItems] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewAttempt, setPreviewAttempt] = useState(0);
  const workflowRef = useRef(null);
  const stepContentRef = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true); setLoadError('');
    Promise.all([
      quotingCustomerApi.getCustomers({ includeInactive: isEditing }), quotingProductApi.getProducts(),
      quotingTemplateApi.getTemplates({ includeInactive: isEditing }), quotingProductGroupApi.getGroups(),
      isEditing ? quotationApi.getQuotationById(id) : Promise.resolve(null),
    ]).then(([customerList, productList, templateList, groupList, draft]) => {
      if (!active) return;
      if (draft && draft.status !== 'Draft') throw new Error('Chỉ có thể sửa báo giá ở trạng thái bản nháp.');
      setCustomers(customerList || []); setProducts(productList || []); setTemplates(templateList || []); setGroups(groupList || []);
      setSelectedTemplateId(draft?.templateId || templateList?.[0]?.id || '');
      if (draft) {
        setSelectedCustomerId(draft.customerId || ''); setIsGenericCustomer(!draft.customerId);
        setSavedTemplateVersion(draft.templateVersion); setIssueDate(draft.issueDate.slice(0, 10));
        setValidUntil(draft.validUntil?.slice(0, 10) || ''); setDiscountPercent(draft.discountPercent);
        setIncludeVat(draft.taxPercent > 0); setTaxPercent(draft.taxPercent || 10); setNotes(draft.notes || '');
        setDisplay({ showDiscount: draft.showDiscount ?? true, showQuantity: draft.showQuantity ?? true,
          showSubTotal: draft.showSubTotal ?? true, showGrandTotal: draft.showGrandTotal ?? true });
        const byId = new Map(productList.map((product) => [product.id, product]));
        setItems(draft.items.map((item) => ({ ...item, catalogPrice: byId.get(item.productId)?.price ?? item.unitPrice })));
      }
    }).catch((error) => { if (active) setLoadError(error.message || 'Không thể tải dữ liệu lập báo giá.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, loadAttempt]);

  // Keep the fixed actions aligned with the app content when the sidebar resizes.
  useEffect(() => {
    const element = workflowRef.current;
    if (!element) return;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      element.style.setProperty('--wizard-left', `${rect.left}px`);
      element.style.setProperty('--wizard-width', `${rect.width}px`);
    };
    measure();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    observer?.observe(element);
    window.addEventListener('resize', measure);
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, [loading]);
  // #endregion

  // #region Derived quotation
  const selectedCustomer = isGenericCustomer ? null : customers.find((customer) => customer.id === selectedCustomerId);
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);
  const versionNumber = savedTemplateVersion || selectedTemplate?.currentVersion || 1;
  const templateVersion = selectedTemplate?.versions?.find((version) => version.version === versionNumber);
  const seller = parseConfig(templateVersion?.sellerInfoJson);
  const payment = parseConfig(templateVersion?.paymentTermsJson);
  const bank = payment.bankAccounts?.[0] || {};
  const effectiveItems = useMemo(() => items.map((item) => ({ ...item,
    quantity: display.showQuantity ? item.quantity : 1, discountPercent: display.showDiscount ? item.discountPercent : 0,
  })).sort((a, b) => (a.groupSortOrder ?? 0) - (b.groupSortOrder ?? 0) || (a.itemGroup || '').localeCompare(b.itemGroup || '', 'vi')), [items, display.showQuantity, display.showDiscount]);
  const totals = useMemo(() => calculateQuotation(effectiveItems, display.showDiscount ? discountPercent : 0, includeVat ? taxPercent : 0),
    [effectiveItems, display.showDiscount, discountPercent, includeVat, taxPercent]);
  const payload = useMemo(() => ({
    customerId: isGenericCustomer ? null : selectedCustomerId || null, templateId: selectedTemplateId || null,
    templateVersion: versionNumber, issueDate: issueDate ? new Date(issueDate).toISOString() : null,
    validUntil: validUntil ? new Date(validUntil).toISOString() : null,
    discountPercent: display.showDiscount ? Number(discountPercent) || 0 : 0,
    taxPercent: includeVat ? Number(taxPercent) || 0 : 0, notes: notes || null, ...display,
    items: effectiveItems.map((item, index) => ({ productId: item.productId || null, productCode: item.productCode || null,
      productName: item.productName, description: item.description || null, unit: item.unit || 'Gói', imageUrl: item.imageUrl || null,
      itemGroup: item.itemGroup || null, groupSortOrder: item.groupSortOrder ?? 0, quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0, discountPercent: Number(item.discountPercent) || 0, notes: item.notes || null, sortOrder: index + 1 })),
  }), [isGenericCustomer, selectedCustomerId, selectedTemplateId, versionNumber, issueDate, validUntil, display, discountPercent, includeVat, taxPercent, notes, effectiveItems]);

  useEffect(() => {
    if (step !== 3 || !payload.items.length) return;
    const controller = new AbortController();
    let active = true;
    setPreviewLoading(true); setPreviewError(''); setPreviewHtml('');
    quotationApi.previewDraft(payload, controller.signal).then((preview) => {
      if (active) { if (!preview?.htmlContent) throw new Error('Máy chủ chưa trả về bản xem trước.'); setPreviewHtml(preview.htmlContent); }
    }).catch((error) => { if (active) setPreviewError(error.message || 'Không thể tải bản xem trước.'); })
      .finally(() => { if (active) setPreviewLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [step, payload, previewAttempt]);
  // #endregion

  // #region Handlers
  const addGroup = (groupId) => {
    setSelectedGroup(groupId);
    const group = groups.find((group) => group.id === groupId);
    const members = products.filter((product) => product.groupId === groupId || (!product.groupId && product.category === group?.name));
    setItems((current) => {
      const selected = new Set(current.map((item) => item.productId));
      return [...current, ...members.filter((product) => !selected.has(product.id)).map(fromProduct)];
    });
  };
  const pickProducts = (ids) => setItems((current) => {
    const catalogIds = new Set(products.map((product) => product.id));
    const retained = current.filter((item) => !catalogIds.has(item.productId) || ids.includes(item.productId));
    const selected = new Set(retained.map((item) => item.productId));
    return [...retained, ...products.filter((product) => ids.includes(product.id) && !selected.has(product.id)).map(fromProduct)];
  });
  const updateItem = (item, field, value) => setItems((current) => current.map((row) => row === item ? { ...row, [field]: value } : row));
  const removeItem = (item) => setItems((current) => current.filter((row) => row !== item));
  const goToStep = (target) => {
    if (loading || submitting) return;
    let message = '';
    if (target > 0) {
      if (!isGenericCustomer && !selectedCustomerId) message = 'Chọn khách hàng hoặc chọn Báo giá chung.';
      else if (!selectedTemplateId) message = 'Chưa có mẫu báo giá. Vui lòng liên hệ quản trị viên để tạo mẫu.';
      else if (!issueDate || (validUntil && validUntil < issueDate)) message = 'Hạn hiệu lực phải từ ngày lập báo giá trở đi.';
    }
    if (!message && target > 1 && !items.length) message = 'Thêm ít nhất một sản phẩm vào báo giá.';
    if (message) { setErrorMessage(message); return false; }
    setErrorMessage(''); setStep(target);
    stepContentRef.current?.scrollIntoView?.({ behavior: 'instant', block: 'start' });
    return true;
  };
  const submit = async () => {
    if (submitting || loading || !goToStep(3)) return;
    setSubmitting(true); setErrorMessage('');
    try {
      if (isEditing) {
        await quotationApi.updateQuotation(id, payload); navigate(`/quotations/${id}`);
      } else {
        const createdId = await quotationApi.createQuotation(payload);
        if (!createdId || typeof createdId !== 'string') throw new Error('Máy chủ chưa trả về mã báo giá hợp lệ.');
        navigate(`/quotations/${createdId}`);
      }
      toast({ body: isEditing ? 'Đã lưu thay đổi báo giá.' : 'Đã tạo báo giá.', type: 'info' });
    } catch (error) { setErrorMessage(error.message || 'Không thể lưu báo giá.'); }
    finally { setSubmitting(false); }
  };
  // #endregion

  const optionSwitches = <div className="quotation-display-options">
    <Text weight="semibold">Nội dung hiển thị trên báo giá và tệp xuất</Text>
    <div className="quotation-option-grid">{[
      ['showDiscount', 'Hiển thị CK (%)'], ['showQuantity', 'Hiển thị Số lượng'],
      ['showSubTotal', 'Hiển thị Tạm tính hàng hóa'], ['showGrandTotal', 'Hiển thị TỔNG CỘNG'],
    ].map(([key, label]) => <Switch key={key} label={label} value={display[key]} onChange={(value) => setDisplay((current) => ({ ...current, [key]: value }))} />)}</div>
  </div>;

  const itemColumns = [
    { key: 'productName', header: 'Sản phẩm', width: proportional(1, { minWidth: 230 }), renderCell: (item) => <div className="quotation-product-identity">
      {item.imageUrl && <img src={resolveApiAssetUrl(item.imageUrl)} alt="" />}
      <div><strong>{item.productName}</strong><div className="quotation-item-tags"><Badge label={item.itemGroup || 'Chưa phân loại'} variant="blue" /><Badge label={item.unit} variant="neutral" /></div><Text type="supporting">Giá danh mục: {formatVnd(item.catalogPrice)}</Text></div>
    </div> },
    ...(display.showQuantity ? [{ key: 'quantity', header: 'Số lượng', width: pixel(120), renderCell: (item) => <NumberInput label={`Số lượng ${item.productName}`} isLabelHidden value={item.quantity} min={0.01} step={0.01} onChange={(value) => updateItem(item, 'quantity', Math.max(0.01, Number(value) || 0.01))} /> }] : []),
    { key: 'unitPrice', header: 'Đơn giá báo giá (VNĐ)', width: pixel(170), renderCell: (item) => <NumberInput label={`Đơn giá báo giá (VNĐ) ${item.productName}`} isLabelHidden value={item.unitPrice} min={0} onChange={(value) => updateItem(item, 'unitPrice', Math.max(0, Number(value) || 0))} /> },
    ...(display.showDiscount ? [{ key: 'discountPercent', header: 'CK (%)', width: pixel(120), renderCell: (item) => <NumberInput label={`Chiết khấu (%) ${item.productName}`} isLabelHidden value={item.discountPercent} min={0} max={100} onChange={(value) => updateItem(item, 'discountPercent', Math.max(0, Math.min(100, Number(value) || 0)))} /> }] : []),
    { key: 'actions', header: 'Thao tác', width: pixel(80), renderCell: (item) => <RowActions label={item.productName} actions={[{ label: 'Xóa sản phẩm', icon: TrashIcon, destructive: true, onClick: () => removeItem(item) }]} /> },
  ];

  if (loading) return <div className="quoting-page-stack"><Skeleton height={40} /><Skeleton height={300} /></div>;
  if (loadError) return <div className="quoting-page-stack"><Banner status="error" title="Không thể mở trình lập báo giá" description={loadError} /><Button icon={<Icon icon={ArrowPathIcon} size="sm" />} label="Thử lại" onClick={() => setLoadAttempt((value) => value + 1)} /></div>;

  return <div className="quotation-workflow quoting-page-stack" ref={workflowRef}>
    <div className="page-heading"><Button label="Về danh sách" variant="secondary" icon={<Icon icon={ArrowLeftIcon} size="sm" />} onClick={() => navigate('/quotations')} /><Heading level={1}>{isEditing ? 'Sửa báo giá' : 'Tạo báo giá'}</Heading></div>
    <div className="quotation-wizard-top">
      {isMobile ? <div className="mobile-wizard-progress"><Text weight="semibold">Bước {step + 1}/4 · {STEPS[step]}</Text><progress value={step + 1} max={4} aria-label="Tiến trình tạo báo giá" /></div>
        : <Stepper label="Các bước tạo báo giá" activeStep={step} onStepClick={goToStep}>{STEPS.map((label, index) => <Step key={label} step={index} label={label} />)}</Stepper>}
    </div>
    {errorMessage && <Banner status="error" title="Chưa thể tiếp tục" description={errorMessage} />}
    <div className="quotation-editor" ref={stepContentRef}>
      <div className="quotation-step-content"><Card padding={isMobile ? 4 : 6}>
        {step === 0 && <div className="quoting-page-stack">
          <Heading level={2}>Bước 1: Khách hàng và mẫu báo giá</Heading>
          <Switch label="Bỏ qua chọn khách hàng (Báo giá chung)" value={isGenericCustomer} onChange={setIsGenericCustomer} />
          {!isGenericCustomer && <Selector label="Khách hàng nhận báo giá" hasSearch searchPlaceholder="Tìm tên, số điện thoại, địa chỉ..." presentation={presentation}
            placeholder="Chọn khách hàng" value={selectedCustomerId || undefined} onChange={setSelectedCustomerId}
            options={customers.map((customer) => ({ value: customer.id, label: [customer.name, customer.phone, customer.address].filter(Boolean).join(' · ') }))} emptyText="Chưa có khách hàng. Có thể dùng báo giá chung." />}
          {selectedCustomer && <div className="quotation-recipient"><strong>{selectedCustomer.name}</strong><Text>{[selectedCustomer.phone, selectedCustomer.address, selectedCustomer.taxCode].filter(Boolean).join(' · ')}</Text></div>}
          <Selector label="Mẫu báo giá" hasSearch presentation={presentation} value={selectedTemplateId || undefined} onChange={setSelectedTemplateId} isDisabled={isEditing}
            options={templates.map((template) => ({ value: template.id, label: `${template.name} · v${isEditing ? versionNumber : template.currentVersion}` }))} placeholder="Chọn mẫu báo giá" />
          <Text type="supporting" color="secondary">Mẫu đã chọn sẽ được xem trước tại bước Xác nhận tạo.</Text>
          <div className="quotation-date-grid"><div><Text weight="semibold">Ngày lập báo giá</Text><Calendar mode="single" value={issueDate} onChange={setIssueDate} /></div>
            <div><Text weight="semibold">Hạn hiệu lực báo giá</Text><Calendar mode="single" min={issueDate || undefined} value={validUntil || null} onChange={setValidUntil} /></div></div>
        </div>}
        {step === 1 && <div className="quoting-page-stack">
          <div><Heading level={2}>Bước 2: Sản phẩm và đơn giá</Heading><Text color="secondary">Thêm cả dòng sản phẩm hoặc chọn riêng từng sản phẩm. Đơn giá có thể điều chỉnh cho báo giá này.</Text></div>
          <div className="quotation-group-picker"><Selector label="Thêm theo nhóm sản phẩm" value={selectedGroup || undefined} onChange={addGroup} hasSearch presentation={presentation} placeholder="Chọn Combo, Xiên que hoặc nhóm khác"
            options={groups.map((group) => ({ value: group.id, label: group.name }))} />
            {selectedGroup && <Button icon={<Icon icon={SquaresPlusIcon} size="sm" />} label="Thêm cả nhóm" variant="secondary" onClick={() => addGroup(selectedGroup)} />}</div>
          <MultiSelector label="Chọn sản phẩm" value={items.map((item) => item.productId).filter((id) => products.some((product) => product.id === id))}
            onChange={pickProducts} hasSearch hasSelectAll selectAllLabel="Chọn tất cả" formatValue={(selected) => `${selected.length} sản phẩm đã chọn`} presentation={presentation} searchPlaceholder="Tìm theo mã hoặc tên sản phẩm..." placeholder="Tìm và chọn sản phẩm"
            options={products.map((product) => ({ value: product.id, label: `${product.code} · ${product.name} · ${formatVnd(product.price)}` }))} />
          {optionSwitches}
          <Text type="supporting" color="secondary">Đã chọn {items.length} sản phẩm. Thêm lại một nhóm sẽ chỉ bổ sung các sản phẩm còn thiếu.</Text>
          {items.length ? <QuotingTable data={[...items].sort((a, b) => (a.groupSortOrder ?? 0) - (b.groupSortOrder ?? 0) || (a.itemGroup || '').localeCompare(b.itemGroup || '', 'vi'))} columns={itemColumns} idKey="id" density="balanced" />
            : <div className="empty-records">Chưa có sản phẩm nào trong báo giá. Chọn nhóm hoặc sản phẩm ở trên.</div>}
        </div>}
        {step === 2 && <div className="quoting-page-stack">
          <Heading level={2}>Bước 3: Chiết khấu, thuế và điều khoản</Heading>
          {display.showDiscount && <NumberInput label="Chiết khấu tổng (%)" value={discountPercent} min={0} max={100} precision={2} onChange={setDiscountPercent} />}
          <Switch label="Thêm VAT" value={includeVat} onChange={setIncludeVat} />
          <Text type="supporting" color="secondary">Chỉ bật khi cần cộng thêm thuế vào đơn giá đã chọn.</Text>
          {includeVat && <NumberInput label="Thuế suất VAT (%)" value={taxPercent} min={0} max={100} precision={2} onChange={setTaxPercent} />}
          <div className="quotation-recipient"><Text weight="semibold">Thông tin chuyển khoản theo mẫu</Text>
            <Text>TÊN: <strong>{bank.accountHolder || seller.bankHolder || '—'}</strong></Text><Text>SỐ TK: <strong>{bank.accountNumber || seller.bankAccount || '—'}</strong></Text><Text>NGÂN HÀNG: <strong>{bank.bankName || seller.bankName || '—'}</strong></Text></div>
          <TextArea label="Ghi chú & Điều khoản báo giá" value={notes} onChange={setNotes} rows={4} />
        </div>}
        {step === 3 && <div className="quoting-page-stack">
          <Heading level={2}>Bước 4: Kiểm tra báo giá</Heading>
          <Text color="secondary">{isGenericCustomer ? 'QUÝ KHÁCH HÀNG' : selectedCustomer?.name} · {items.length} sản phẩm · {selectedTemplate?.name} (v{versionNumber})</Text>
          <Heading level={3}>Xem trước mẫu báo giá</Heading>
          {previewLoading && <Skeleton height={300} />}
          {previewError && <><Banner status="error" title="Không thể tải bản xem trước" description={previewError} /><Button icon={<Icon icon={ArrowPathIcon} size="sm" />} label="Thử lại bản xem trước" variant="secondary" onClick={() => setPreviewAttempt((value) => value + 1)} /></>}
          {previewHtml && <div className="draft-preview-container"><iframe title="Bản xem trước trước khi tạo" sandbox="" srcDoc={previewHtml} /></div>}
        </div>}
      </Card></div>
      <aside className="quotation-summary"><Card padding={5}><div className="quoting-page-stack">
        <div className="page-heading"><Heading level={3}>Tóm tắt báo giá</Heading><Badge label={`${items.length} sản phẩm`} variant="blue" /></div>
        <div className="quotation-recipient"><Text type="supporting" color="secondary">Khách hàng nhận báo giá</Text><strong>{isGenericCustomer ? 'QUÝ KHÁCH HÀNG' : selectedCustomer?.name || 'Chưa chọn khách hàng'}</strong></div>
        <div className="quotation-summary-items">{effectiveItems.map((item, index) => <div key={item.productId || index} className="quotation-summary-line"><div><Text weight="semibold">{item.productName}</Text><Text type="supporting" color="secondary">{display.showQuantity ? `${item.quantity} ${item.unit} × ` : `${item.unit} · `}{formatVnd(item.unitPrice)}</Text></div></div>)}</div>
        {display.showSubTotal && <div className="quotation-summary-line"><Text>Tạm tính hàng hóa:</Text><strong>{formatVnd(totals.subTotal)}</strong></div>}
        {display.showDiscount && discountPercent > 0 && <div className="quotation-summary-line"><Text>Chiết khấu tổng ({discountPercent}%):</Text><strong>-{formatVnd(totals.discountAmount)}</strong></div>}
        {includeVat && <div className="quotation-summary-line"><Text>VAT ({taxPercent}%):</Text><strong>{formatVnd(totals.taxAmount)}</strong></div>}
        {display.showGrandTotal && <div className="quotation-summary-total"><Text weight="semibold">TỔNG CỘNG</Text><Heading level={3}>{formatVnd(totals.totalAmount)}</Heading></div>}
        <Text type="supporting" color="secondary">Mẫu áp dụng: {selectedTemplate?.name || 'Chưa chọn mẫu'} (v{versionNumber})</Text>
      </div></Card></aside>
    </div>
    <footer className="quotation-wizard-footer"><div>
      <Button icon={<Icon icon={step > 0 ? ArrowLeftIcon : XMarkIcon} size="sm" />} label={step > 0 ? 'Quay lại' : 'Hủy'} variant="secondary" isDisabled={submitting} onClick={() => step > 0 ? goToStep(step - 1) : navigate('/quotations')} />
      <Text type="supporting" color="secondary" className="wizard-footer-position">Bước {step + 1} / 4</Text>
      <Button variant="primary" label={step < 3 ? 'Tiếp tục' : submitting ? 'Đang lưu...' : isEditing ? 'Lưu báo giá' : 'Tạo báo giá'}
        icon={<Icon icon={step < 3 ? ArrowRightIcon : CheckCircleIcon} size="sm" />} isDisabled={submitting} isLoading={submitting}
        onClick={() => step < 3 ? goToStep(step + 1) : submit()} />
    </div></footer>
  </div>;
}
