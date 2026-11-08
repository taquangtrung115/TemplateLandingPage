import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Stepper, Step } from '@astryxdesign/core/Stepper';
import { Card } from '@astryxdesign/core/Card';
import { Button } from '@astryxdesign/core/Button';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { calculateQuotation } from '../../utils/quotationCalculation';
import { FormLayout } from '@astryxdesign/core/FormLayout';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Badge } from '@astryxdesign/core/Badge';
import { Divider } from '@astryxdesign/core/Divider';
import { Banner } from '@astryxdesign/core/Banner';
import { Heading, Text } from '@astryxdesign/core/Text';
import { HStack, VStack, StackItem } from '@astryxdesign/core/Stack';
import { Grid } from '@astryxdesign/core/Grid';
import { Icon } from '@astryxdesign/core/Icon';
import {
  UserGroupIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BuildingStorefrontIcon,
  BanknotesIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { quotingCustomerApi } from '../../api/quotingCustomerApi';
import { quotingProductApi } from '../../api/quotingProductApi';
import { quotingTemplateApi } from '../../api/quotingTemplateApi';
import { quotationApi } from '../../api/quotationApi';
import { ProductCategoryBadge, UnitBadge } from '../../components/common/StatusBadge';
import { ActionButton } from '../../components/common/ActionButton';
import { useToast } from '@astryxdesign/core/Toast';
import { Switch } from '@astryxdesign/core/Switch';
import { Calendar } from '@astryxdesign/core/Calendar';
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList';
import { InputGroup, InputGroupText } from '@astryxdesign/core/InputGroup';
import { useAnimatedLayout } from '@astryxdesign/core/hooks';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { createAnimator } from '@astryxdesign/core';

const STEPS = [
  { label: 'Khách hàng & Mẫu', icon: UserGroupIcon },
  { label: 'Dòng sản phẩm', icon: ShoppingCartIcon },
  { label: 'Điều khoản & VAT', icon: DocumentTextIcon },
  { label: 'Xác nhận tạo', icon: CheckCircleIcon },
];

export default function CreateQuotationPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [savedTemplateVersion, setSavedTemplateVersion] = useState(null);
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isGenericCustomer, setIsGenericCustomer] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [includeVat, setIncludeVat] = useState(false);
  const [taxPercent, setTaxPercent] = useState(10);
  const [notes, setNotes] = useState('');

  // Items in quote
  const [items, setItems] = useState([]);

  // Animated layout hook for smooth Stepper Wizard transitions
  const wizardContainerRef = useRef(null);
  const summaryContainerRef = useRef(null);
  const summaryLayout = useAnimatedLayout({ containerRef: summaryContainerRef });
  useEffect(() => {
    const element = wizardContainerRef.current;
    if (!element || typeof element.animate !== 'function' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const animator = createAnimator(element);
    animator.set({ opacity: 0, y: 4 });
    void animator.animate({ opacity: 1, y: 0 });
    return () => animator.destroy();
  }, [step, loading]);

  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const [customerList, productList, templateList, draft] = await Promise.all([
          quotingCustomerApi.getCustomers({ includeInactive: isEditing }),
          quotingProductApi.getProducts(),
          quotingTemplateApi.getTemplates({ includeInactive: isEditing }),
          isEditing ? quotationApi.getQuotationById(id) : Promise.resolve(null),
        ]);
        if (!isMounted) return;
        setCustomers(customerList || []);
        setProducts(productList || []);
        setTemplates(templateList || []);
        setSelectedCustomerId(customerList?.[0]?.id || '');
        setSelectedTemplateId(templateList?.[0]?.id || '');
        if (draft) {
          if (draft.status !== 'Draft') throw new Error('Chỉ có thể sửa báo giá ở trạng thái bản nháp.');
          setSelectedCustomerId(draft.customerId || '');
          setIsGenericCustomer(!draft.customerId);
          setSelectedTemplateId(draft.templateId);
          setSavedTemplateVersion(draft.templateVersion);
          setIssueDate(draft.issueDate.slice(0, 10));
          setValidUntil(draft.validUntil?.slice(0, 10) || '');
          setDiscountPercent(draft.discountPercent);
          setIncludeVat(draft.taxPercent > 0);
          setTaxPercent(draft.taxPercent || 10);
          setNotes(draft.notes || '');
          setItems(draft.items.map((item) => ({ ...item, catalogPrice: productList.find((product) => product.id === item.productId)?.price ?? item.unitPrice })));
        }
      } catch (err) {
        if (isMounted) setLoadError(err.message || 'Không thể tải dữ liệu lập báo giá. Vui lòng thử lại.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    initData();
    return () => { isMounted = false; };
  }, [id, loadAttempt]);

  const selectedCustomer = useMemo(() => {
    if (isGenericCustomer) return null;
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId, isGenericCustomer]);

  const selectedTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || null;
  }, [templates, selectedTemplateId]);

  const templateVersion = selectedTemplate?.versions?.find((version) => version.version === (savedTemplateVersion || selectedTemplate.currentVersion));
  const parseConfig = (json) => { try { return JSON.parse(json || '{}'); } catch { return {}; } };
  const seller = parseConfig(templateVersion?.sellerInfoJson);
  const payment = parseConfig(templateVersion?.paymentTermsJson);
  const bank = payment.bankAccounts?.[0] || {};

  // Financial calculations
  const { subTotal, discountAmount, taxAmount, totalAmount } = useMemo(() => {
    return calculateQuotation(items, discountPercent, includeVat ? taxPercent : 0);
  }, [items, discountPercent, taxPercent, includeVat]);

  const formatVnd = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val || 0);
  };

  const handleAddItem = (prod) => {
    setItems((items) => {
    const existing = items.find((i) => i.productId === prod.id);
    if (existing) {
      return items.map((i) => (i.productId === prod.id ? { ...i, quantity: (Number(i.quantity) || 1) + 1 } : i));
    } else {
      return [
        ...items,
        {
          productId: prod.id,
          productCode: prod.code,
          productName: prod.name,
          description: prod.description,
          unit: prod.unit,
          imageUrl: prod.imageUrl,
          itemGroup: prod.category || 'Chưa phân loại',
          catalogPrice: prod.price,
          quantity: 1,
          unitPrice: prod.price,
          discountPercent: 0,
          notes: '',
          sortOrder: items.length + 1,
        },
      ];
    }
    });
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...items];
    let val = value;
    if (field === 'quantity') {
      val = Math.max(0.01, Number(value) || 0.01);
    } else if (field === 'unitPrice') {
      val = Math.max(0, Number(value) || 0);
    } else if (field === 'discountPercent') {
      val = Math.max(0, Math.min(100, Number(value) || 0));
    }
    updated[index] = { ...updated[index], [field]: val };
    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const validateStep = (targetStep) => {
    let message = null;
    let invalidStep = 0;
    if (!isGenericCustomer && !selectedCustomerId) message = 'Chọn khách hàng hoặc chọn Báo giá chung.';
    else if (!selectedTemplateId) message = 'Chưa có mẫu báo giá. Vui lòng liên hệ quản trị viên để tạo mẫu.';
    else if (!issueDate || (validUntil && validUntil < issueDate)) message = 'Hạn hiệu lực phải từ ngày lập báo giá trở đi.';
    else if (targetStep > 1 && items.length === 0) { message = 'Thêm ít nhất một sản phẩm vào báo giá.'; invalidStep = 1; }
    if (message) { setErrorMessage(message); setStep(invalidStep); return false; }
    setErrorMessage(null);
    return true;
  };

  const handleGoToStep = (nextStep) => {
    if (submitting || loading) return;
    if (nextStep > step && !validateStep(nextStep)) return;
    setStep(nextStep);
  };

  const handleSubmit = async () => {
    if (submitting || loading || !validateStep(3)) return;
    try {
      setSubmitting(true);
      setErrorMessage(null);

      const payload = {
        customerId: isGenericCustomer ? null : (selectedCustomerId || null),
        templateId: selectedTemplateId || null,
        templateVersion: savedTemplateVersion || selectedTemplate?.currentVersion || 1,
        issueDate: issueDate ? new Date(issueDate).toISOString() : new Date().toISOString(),
        validUntil: validUntil ? new Date(validUntil).toISOString() : null,
        discountPercent: Number(discountPercent) || 0,
        taxPercent: includeVat ? Number(taxPercent) || 0 : 0,
        notes: notes || undefined,
        items: items.map((it, idx) => ({
          productId: it.productId || null,
          productCode: it.productCode || null,
          productName: it.productName,
          description: it.description || null,
          unit: it.unit || 'Gói',
          imageUrl: it.imageUrl || null,
          itemGroup: it.itemGroup || null,
          quantity: Math.max(0.01, Number(it.quantity) || 0.01),
          unitPrice: Number(it.unitPrice) || 0,
          discountPercent: Number(it.discountPercent) || 0,
          notes: it.notes || null,
          sortOrder: idx + 1,
        })),
      };

      if (isEditing) {
        await quotationApi.updateQuotation(id, payload);
        toast({ body: 'Đã lưu thay đổi báo giá.', type: 'info' });
        navigate(`/quotations/${id}`);
      } else {
        const quotationId = await quotationApi.createQuotation(payload);
        if (!quotationId || typeof quotationId !== 'string') throw new Error('Máy chủ chưa trả về mã báo giá hợp lệ.');
        toast({ body: 'Đã tạo báo giá.', type: 'info' });
        navigate(`/quotations/${quotationId}`);
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setSubmitting(false);
    }
  };

  // Sticky Summary Card với thiết kế nổi bật & chuẩn hóa màu sắc
  const summaryCard = (
    <Card padding={6} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
      <VStack gap={5}>
        <HStack gap={2} vAlign="center" hAlign="between">
          <Heading level={3}>Tóm tắt báo giá</Heading>
          <Badge label={`${items.length} sản phẩm`} variant="blue" />
        </HStack>

        {isGenericCustomer ? (
          <VStack gap={1} style={{ padding: 12, borderRadius: 8, backgroundColor: 'var(--color-background-blue)', border: '1px solid var(--color-border-blue)' }}>
            <Text type="supporting" color="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Đối tượng nhận báo giá
            </Text>
            <Text type="body" weight="semibold" style={{ color: 'var(--color-text-info)' }}>QUÝ KHÁCH HÀNG</Text>
            <Text type="supporting" color="secondary">Báo giá chung (Không gán khách hàng cụ thể)</Text>
          </VStack>
        ) : selectedCustomer ? (
          <VStack gap={1} style={{ padding: 12, borderRadius: 8, backgroundColor: 'var(--color-background-muted)', border: '1px solid var(--color-border)' }}>
            <Text type="supporting" color="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Khách hàng nhận báo giá
            </Text>
            <Text type="body" weight="semibold">{selectedCustomer.name}</Text>
            <Text type="supporting" color="secondary">{selectedCustomer.phone || selectedCustomer.email}</Text>
          </VStack>
        ) : null}

        {/* Selected Items mini list */}
        <Collapsible trigger={`Sản phẩm đã chọn (${items.length})`} defaultIsOpen animatedLayout={summaryLayout}>
        <VStack gap={3} style={{ maxHeight: '240px', overflowY: 'auto' }}>
          {items.map((it, idx) => (
            <HStack key={idx} gap={3} vAlign="center" hAlign="between">
              <HStack gap={2} vAlign="center">
                {it.imageUrl ? (
                  <img
                    src={it.imageUrl}
                    alt={it.productName}
                    style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon icon={ShoppingCartIcon} size="sm" />
                  </div>
                )}
                <VStack gap={0}>
                  <Text type="body" weight="medium" style={{ fontSize: 12, maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {it.productName}
                  </Text>
                  <Text type="supporting" color="secondary" style={{ fontSize: 11 }}>
                    {it.quantity} {it.unit} x {formatVnd(it.unitPrice)}
                  </Text>
                </VStack>
              </HStack>
              <Text type="body" weight="semibold" style={{ fontSize: 12 }}>
                {formatVnd(calculateQuotation([it], 0, 0).totalAmount)}
              </Text>
            </HStack>
          ))}
        </VStack>
        </Collapsible>

        <Divider />

        {/* Cost breakdown */}
        <VStack gap={2}>
          <HStack hAlign="between">
            <Text type="body" color="secondary">Tạm tính ({items.length} sản phẩm)</Text>
            <Text type="body">{formatVnd(subTotal)}</Text>
          </HStack>
          {discountPercent > 0 && (
            <HStack hAlign="between">
              <Text type="body" color="secondary">Chiết khấu đơn ({discountPercent}%)</Text>
              <Text type="body" style={{ color: 'var(--color-text-error)', fontWeight: 500 }}>- {formatVnd(discountAmount)}</Text>
            </HStack>
          )}
          {includeVat && <HStack hAlign="between">
            <Text type="body" color="secondary">Thuế GTGT ({taxPercent}%)</Text>
            <Text type="body">{formatVnd(taxAmount)}</Text>
          </HStack>}

          {/* Khối làm nổi bật Tổng tiền thanh toán */}
          <div
            style={{
              marginTop: 6,
              padding: '14px 16px',
              borderRadius: 8,
              backgroundColor: 'var(--color-background-blue)',
              border: '1px solid var(--color-border-blue)',
            }}
          >
            <HStack hAlign="between" vAlign="center">
              <VStack gap={0.5}>
                <Text type="body" weight="semibold" style={{ color: 'var(--color-text-info)' }}>
                  Tổng tiền
                </Text>
                <Text type="supporting" color="secondary" style={{ fontSize: 11 }}>
                  {includeVat ? 'Đã cộng VAT' : 'Theo đơn giá đã chọn'}
                </Text>
              </VStack>
              <Heading level={2} style={{ color: 'var(--color-text-info)', margin: 0 }}>
                {formatVnd(totalAmount)}
              </Heading>
            </HStack>
          </div>
        </VStack>

        <Text type="supporting" color="secondary">Mẫu áp dụng: {selectedTemplate?.name || 'Chưa chọn mẫu'} (v{selectedTemplate?.currentVersion || '—'})</Text>
      </VStack>
    </Card>
  );

  if (loading) return <VStack gap={3} aria-label="Đang tải dữ liệu lập báo giá"><Skeleton height={40} /><Skeleton height={300} /></VStack>;
  if (loadError) return <VStack gap={4}><Banner status="error" title="Không thể mở trình lập báo giá" description={loadError} /><Button label="Thử lại" onClick={() => setLoadAttempt((attempt) => attempt + 1)} /><Button label="Về danh sách" variant="secondary" onClick={() => navigate('/quotations')} /></VStack>;

  return (
    <VStack gap={6}>
      {/* Header */}
      <HStack gap={3} vAlign="center" hAlign="between">
        <HStack gap={2} vAlign="center">
          <ActionButton
            actionType="secondary"
            size="sm"
            label="Về danh sách"
            icon={<Icon icon={ArrowLeftIcon} size="sm" />}
            onClick={() => navigate('/quotations')}
          />
          <Heading level={1}>{isEditing ? 'Sửa báo giá' : 'Tạo báo giá'}</Heading>
        </HStack>
      </HStack>

      {errorMessage && (
        <Banner
          status="error"
          title="Lỗi nhập liệu"
          description={errorMessage}
        />
      )}

      {!loading && products.length === 0 && !errorMessage && <Banner status="info" title="Danh mục sản phẩm đang trống" description="Thêm sản phẩm đang bán trước khi lập báo giá." />}

      {/* Main 2-Column Wizard Layout: Side-by-side, no wrap on desktop */}
      <div
        className="quotation-editor"
      >
        {/* Left Column: Stepper and Form Steps */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Card padding={6}>
            <VStack gap={6}>
              <Stepper label="Các bước tạo báo giá" activeStep={step} onStepClick={handleGoToStep}>
                {STEPS.map((item, index) => <Step key={item.label} step={index} label={item.label} />)}
              </Stepper>

              <div
                ref={wizardContainerRef}
                style={{
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  minHeight: 380,
                }}
              >
                {/* STEP 0: Chọn Khách hàng & Chọn Mẫu */}
                {step === 0 && (
                  <VStack gap={5}>
                    <VStack gap={1}>
                      <Heading level={2}>Bước 1: Khách hàng và mẫu báo giá</Heading>
                      <Text type="body" color="secondary">
                        Chọn đối tượng khách hàng nhận bảng giá và mẫu định dạng xuất bản.
                      </Text>
                    </VStack>

                    <FormLayout>
                      <VStack gap={3}>
                        <Text type="body" weight="medium">Đối tượng khách hàng nhận báo giá</Text>
                        <RadioList
                          label="Chọn phân loại đối tượng nhận bảng báo giá"
                          isLabelHidden
                          value={isGenericCustomer ? 'generic' : 'specific'}
                          onChange={(val) => {
                            const nextIsGeneric = val === 'generic';
                            setIsGenericCustomer(nextIsGeneric);
                            if (nextIsGeneric) {
                              setSelectedCustomerId('');
                            } else if (customers.length > 0 && !selectedCustomerId) {
                              setSelectedCustomerId(customers[0].id);
                            }
                          }}
                        >
                          <RadioListItem
                            value="generic"
                            label="Bỏ qua chọn khách hàng (Báo giá chung cho QUÝ KHÁCH HÀNG)"
                            description="Áp dụng cho bảng báo giá gửi đại trà, bảng niêm yết công khai hoặc khách vãng lai."
                            style={{ cursor: 'pointer' }}
                          />
                          <RadioListItem
                            value="specific"
                            label="Chọn khách hàng doanh nghiệp / đại lý cụ thể"
                            description="Gắn báo giá với khách hàng từ danh bạ đã lưu để ghi nhận đúng MST, địa chỉ và số điện thoại."
                            style={{ cursor: 'pointer' }}
                          />
                        </RadioList>

                        {!isGenericCustomer && (
                          <VStack gap={2}>
                            <Text type="body" weight="medium">Danh bạ khách hàng đã lưu:</Text>
                            {customers.length === 0 && <Text>Chưa có khách hàng. Bạn có thể chọn Báo giá chung.</Text>}
                            <RadioList label="Khách hàng nhận báo giá" value={selectedCustomerId} onChange={setSelectedCustomerId}>
                              {customers.map((customer) => <RadioListItem key={customer.id} value={customer.id} label={customer.name} description={[customer.phone, customer.address].filter(Boolean).join(' · ')} />)}
                            </RadioList>
                          </VStack>
                        )}
                      </VStack>

                      <Divider />

                      <VStack gap={2}>
                        <Text type="body" weight="medium">Mẫu báo giá</Text>
                        <RadioList
                          label="Chọn mẫu giao diện xuất bản báo giá"
                          isLabelHidden
                          isDisabled={isEditing}
                          value={selectedTemplateId}
                          onChange={setSelectedTemplateId}
                        >
                          {templates.map((t) => (
                            <RadioListItem
                              key={t.id}
                              value={t.id}
                              label={
                                <HStack gap={2} vAlign="center">
                                  <Text type="body" weight="semibold">{t.name}</Text>
                                  <Badge variant={t.isSystem ? 'success' : 'neutral'} label={t.isSystem ? 'Mẫu hệ thống' : `v${t.currentVersion}`} />
                                </HStack>
                              }
                              description={t.description || 'Mẫu chuẩn Chuỗi Ăn Vặt PDF'}
                              style={{ cursor: 'pointer' }}
                            />
                          ))}
                        </RadioList>
                      </VStack>

                      <Divider />

                      <VStack gap={3}>
                        <Text type="body" weight="medium">Thời hạn báo giá</Text>
                        <Grid className="quoting-grid" columns={{ minWidth: 260, repeat: 'fit' }} gap={4}>
                          <Card padding={3} style={{ border: '1px solid var(--color-border)', borderRadius: 8 }}>
                            <VStack gap={2}>
                              <HStack hAlign="between" vAlign="center">
                                <Text type="body" weight="semibold">Ngày lập báo giá</Text>
                                <Badge label={issueDate || 'Hôm nay'} variant="blue" />
                              </HStack>
                              <Calendar
                                mode="single"
                                value={issueDate}
                                onChange={(val) => setIssueDate(val)}
                              />
                            </VStack>
                          </Card>

                          <Card padding={3} style={{ border: '1px solid var(--color-border)', borderRadius: 8 }}>
                            <VStack gap={2}>
                              <HStack hAlign="between" vAlign="center">
                                <Text type="body" weight="semibold">Hạn hiệu lực báo giá</Text>
                                <Badge label={validUntil || 'Chưa chọn'} variant="neutral" />
                              </HStack>
                              <Calendar
                                mode="single"
                                min={issueDate || undefined}
                                value={validUntil || null}
                                onChange={(val) => setValidUntil(val)}
                              />
                            </VStack>
                          </Card>
                        </Grid>
                      </VStack>
                    </FormLayout>
                  </VStack>
                )}

              {/* STEP 1: Chọn Sản Phẩm & Mapping Giá */}
              {step === 1 && (
                <VStack gap={5}>
                  <VStack gap={1}>
                    <Heading level={2}>Bước 2: Sản phẩm và đơn giá</Heading>
                    <Text type="body" color="secondary">
                      Chọn sản phẩm, nhập số lượng và điều chỉnh đơn giá riêng cho khách hàng. Giá trong danh mục được giữ nguyên.
                    </Text>
                  </VStack>

                  {/* Picked items list */}
                  <VStack gap={3}>
                    {items.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--color-background-surface)', borderRadius: 8, border: '1px dashed var(--color-border)' }}>
                        <Text type="body" color="secondary">Chưa có sản phẩm nào trong báo giá. Vui lòng bấm thêm bên dưới.</Text>
                      </div>
                    ) : (
                      items.map((it, idx) => (
                        <Card key={idx} padding={4} style={{ border: '1px solid var(--color-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                          <HStack gap={4} vAlign="center" hAlign="between" wrap="wrap">
                            <HStack gap={3} vAlign="center">
                              {it.imageUrl && (
                                <img
                                  src={it.imageUrl}
                                  alt={it.productName}
                                  style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
                                />
                              )}
                              <VStack gap={0.5}>
                                <HStack gap={2} vAlign="center">
                                  <Text type="body" weight="semibold">{it.productName}</Text>
                                  <UnitBadge unit={it.unit} />
                                  <ProductCategoryBadge category={it.itemGroup} />
                                </HStack>
                                <Text type="supporting" color="secondary">
                                  Giá danh mục: {formatVnd(it.catalogPrice)}
                                </Text>
                              </VStack>
                            </HStack>

                            <HStack className="quotation-item-fields" gap={3} vAlign="center" wrap="wrap">
                              <VStack width={100}>
                                <NumberInput
                                  label="Số lượng"
                                  value={it.quantity}
                                  onChange={(val) => handleUpdateItem(idx, 'quantity', val)}
                                  min={0.01}
                                  step={0.01}
                                />
                              </VStack>
                              <VStack width={130}>
                                <NumberInput
                                  label="Đơn giá báo giá (VNĐ)"
                                  value={it.unitPrice}
                                  onChange={(val) => handleUpdateItem(idx, 'unitPrice', val)}
                                  min={0}
                                />
                              </VStack>
                              <VStack width={90}>
                                <NumberInput
                                  label="Chiết khấu (%)"
                                  value={it.discountPercent}
                                  onChange={(val) => handleUpdateItem(idx, 'discountPercent', val)}
                                  min={0}
                                  max={100}
                                />
                              </VStack>
                              <ActionButton
                                actionType="danger"
                                size="sm"
                                icon={<Icon icon={TrashIcon} size="sm" />}
                                label={`Xóa ${it.productName}`}
                                aria-label={`Xóa ${it.productName}`}
                                onClick={() => handleRemoveItem(idx)}
                              />
                            </HStack>
                          </HStack>
                        </Card>
                      ))
                    )}
                  </VStack>

                  <Divider />

                  <VStack gap={3}>
                    <Heading level={3}>Thêm sản phẩm</Heading>
                    {products.length === 0 && <Text>Chưa có sản phẩm đang bán. Vui lòng thêm sản phẩm trong danh mục.</Text>}
                    <div className="quotation-product-picker">
                      {products.map((product) => (
                        <Button key={product.id} variant="secondary"
                          label={`${product.name} · ${formatVnd(product.price)}`}
                          icon={<Icon icon={PlusIcon} size="sm" />}
                          onClick={() => handleAddItem(product)} />
                      ))}
                    </div>
                  </VStack>
                </VStack>
              )}

              {/* STEP 2: Điều khoản, Chiết khấu & VAT */}
              {step === 2 && (
                <VStack gap={5}>
                  <VStack gap={1}>
                    <Heading level={2}>Bước 3: Chiết khấu, thuế và điều khoản</Heading>
                    <Text type="body" color="secondary">
                      Thiết lập chiết khấu tổng đơn, thuế suất và thông tin chuyển khoản ngân hàng.
                    </Text>
                  </VStack>

                  <FormLayout>
                    <HStack gap={4}>
                      <StackItem size="fill">
                        <InputGroup label="Chiết khấu tổng đơn">
                          <NumberInput
                            value={discountPercent}
                            onChange={setDiscountPercent}
                            min={0}
                            max={100}
                          />
                          <InputGroupText>%</InputGroupText>
                        </InputGroup>
                      </StackItem>
                      <StackItem size="fill">
                        <Switch label="Thêm VAT" value={includeVat} onChange={setIncludeVat} />
                        <Text type="supporting" color="secondary">Giá danh mục theo PDF đã gồm VAT. Chỉ bật khi cần cộng thêm thuế vào đơn giá đã chọn.</Text>
                        {includeVat && <InputGroup label="Thuế suất VAT">
                          <NumberInput
                            value={taxPercent}
                            precision={2}
                            onChange={setTaxPercent}
                            min={0}
                            max={100}
                          />
                          <InputGroupText>%</InputGroupText>
                        </InputGroup>}
                      </StackItem>
                    </HStack>

                    <div style={{ padding: 16, borderRadius: 8, backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)' }}>
                      <VStack gap={2}>
                        <HStack gap={2} vAlign="center">
                          <Icon icon={BanknotesIcon} size="sm" color="accent" />
                          <Text type="body" weight="semibold">Thông tin tài khoản ngân hàng chuyển khoản (Mẫu PDF)</Text>
                        </HStack>
                        <Text type="body">TÊN: <strong>{bank.accountHolder || seller.bankHolder || '—'}</strong></Text>
                        <Text type="body">SỐ TK: <strong>{bank.accountNumber || seller.bankAccount || '—'}</strong></Text>
                        <Text type="body">NGÂN HÀNG: <strong>{bank.bankName || seller.bankName || '—'}</strong></Text>
                      </VStack>
                    </div>

                    <TextArea
                      label="Ghi chú & Điều khoản báo giá"
                      value={notes}
                      onChange={setNotes}
                      rows={3}
                    />
                  </FormLayout>
                </VStack>
              )}

              {/* STEP 3: Xác nhận & Hoàn tất */}
              {step === 3 && (
                <VStack gap={5}>
                  <VStack gap={1}>
                    <Heading level={2}>Bước 4: Kiểm tra báo giá</Heading>
                    <Text type="body" color="secondary">
                      Kiểm tra toàn bộ thông tin báo giá trước khi lưu và xuất bản tệp tin.
                    </Text>
                  </VStack>

                  <div style={{ padding: 20, borderRadius: 8, backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)' }}>
                    <VStack gap={3}>
                      <HStack hAlign="between">
                        <Text type="body" color="secondary">Đơn vị bán hàng:</Text>
                        <Text type="body" weight="semibold">{[seller.companyName, seller.address].filter(Boolean).join(' · ') || selectedTemplate?.name || '—'}</Text>
                      </HStack>
                      <HStack hAlign="between">
                        <Text type="body" color="secondary">Khách hàng nhận:</Text>
                        <Text type="body" weight="semibold">
                          {isGenericCustomer ? 'QUÝ KHÁCH HÀNG (Báo giá chung)' : (selectedCustomer?.name || '—')}
                        </Text>
                      </HStack>
                      <HStack hAlign="between">
                        <Text type="body" color="secondary">Số lượng mặt hàng:</Text>
                        <Text type="body" weight="semibold">{items.length} mặt hàng</Text>
                      </HStack>
                      <HStack hAlign="between">
                        <Text type="body" color="secondary">Mẫu báo giá:</Text>
                        <Text type="body" weight="semibold">{selectedTemplate?.name || 'Mẫu chuẩn hệ thống'}</Text>
                      </HStack>
                      <Divider />
                      <HStack hAlign="between">
                        <Heading level={3}>Tổng tiền thanh toán:</Heading>
                        <Heading level={3} color="accent">{formatVnd(totalAmount)}</Heading>
                      </HStack>
                    </VStack>
                  </div>
                </VStack>
              )}
              </div>

              {/* Stepper Navigation Buttons */}
              <Divider />
              <HStack gap={3} hAlign="between">
                {step > 0 ? (
                  <ActionButton
                    actionType="secondary"
                    label="Quay lại"
                    icon={<Icon icon={ArrowLeftIcon} size="sm" />}
                    onClick={() => handleGoToStep(step - 1)}
                    disabled={submitting}
                  />
                ) : <div />}

                {step < STEPS.length - 1 ? (
                  <ActionButton
                    actionType="primary"
                    label="Tiếp tục"
                    icon={<Icon icon={ArrowRightIcon} size="sm" />}
                    onClick={() => handleGoToStep(step + 1)}
                    disabled={loading || submitting}
                  />
                ) : (
                  <ActionButton
                    actionType="success"
                    label={submitting ? 'Đang lưu...' : isEditing ? 'Lưu báo giá' : 'Tạo báo giá'}
                    icon={<Icon icon={CheckCircleIcon} size="sm" />}
                    onClick={handleSubmit}
                    disabled={submitting}
                    loading={submitting}
                  />
                )}
              </HStack>
            </VStack>
          </Card>
        </div>

        {/* Summary follows the editor on narrow screens. */}
        <div className="quotation-summary" ref={summaryContainerRef}>
          {summaryCard}
        </div>
      </div>
    </VStack>
  );
}
