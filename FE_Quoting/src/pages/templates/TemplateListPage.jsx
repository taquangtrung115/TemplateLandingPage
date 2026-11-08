import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { QuotingTable as Table, pixel, proportional } from '../../components/common/QuotingTable';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Heading, Text } from '@astryxdesign/core/Text';
import {
  VStack,
  HStack,
  Layout,
  LayoutContent,
  LayoutPanel,
} from '@astryxdesign/core/Layout';
import { List, ListItem } from '@astryxdesign/core/List';
import { Grid } from '@astryxdesign/core/Grid';
import { Selector } from '@astryxdesign/core/Selector';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { TextInput } from '@astryxdesign/core/TextInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Divider } from '@astryxdesign/core/Divider';
import { Banner } from '@astryxdesign/core/Banner';
import { Icon } from '@astryxdesign/core/Icon';
import {
  BuildingOffice2Icon,
  CreditCardIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { quotingTemplateApi } from '../../api/quotingTemplateApi';
import { useAuth } from '../../contexts/AuthContext';
import { Drawer, DrawerHeader } from '@astryxdesign/core/Drawer';
import { useToast } from '@astryxdesign/core/Toast';

const SETTINGS_SECTIONS = [
  { id: 'seller', label: 'Thông tin đơn vị bán', icon: BuildingOffice2Icon },
  { id: 'banking', label: 'Tài khoản thanh toán', icon: CreditCardIcon },
  { id: 'salutation', label: 'Tiêu đề và lời ngỏ', icon: DocumentTextIcon },
  { id: 'versions', label: 'Lịch sử phiên bản mẫu', icon: ClockIcon },
];

export default function TemplateListPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTemplateCode, setNewTemplateCode] = useState('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [activeSection, setActiveSection] = useState('seller');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configuration Fields
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [phone, setPhone] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankHolder, setBankHolder] = useState('');
  const [salutation, setSalutation] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await quotingTemplateApi.getTemplates({ includeInactive: true });
      setTemplates(res || []);
      setSelectedTemplateId((current) => res?.some((template) => template.id === current) ? current : res?.find((template) => template.isSystem && template.isActive)?.id || res?.[0]?.id || '');
    } catch (err) {
      setErrorMessage(err.message || 'Không thể tải mẫu báo giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) || null;
  const currentTemplateVersion = selectedTemplate?.versions?.find((version) => version.version === selectedTemplate.currentVersion);
  const parseConfig = (json) => { try { return JSON.parse(json || '{}'); } catch { return {}; } };

  useEffect(() => {
    const seller = parseConfig(currentTemplateVersion?.sellerInfoJson);
    const payment = parseConfig(currentTemplateVersion?.paymentTermsJson);
    const bank = payment.bankAccounts?.[0] || {};
    setTitle(currentTemplateVersion?.title || '');
    setCompanyName(seller.companyName || '');
    setAddress(seller.address || '');
    setTaxCode(seller.taxCode || '');
    setPhone(seller.phone || '');
    setBankAccount(bank.accountNumber || seller.bankAccount || '');
    setBankName(bank.bankName || seller.bankName || '');
    setBankHolder(bank.accountHolder || seller.bankHolder || '');
    setSalutation(currentTemplateVersion?.salutationText || '');
  }, [currentTemplateVersion]);

  const handlePublishVersion = async () => {
    if (saving || loading || !isAdmin) return;
    if (!selectedTemplate || !currentTemplateVersion) {
      setErrorMessage('Không tìm thấy mẫu báo giá hợp lệ trong hệ thống.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);

      if (!title.trim() || !companyName.trim()) { setErrorMessage('Nhập tên đơn vị bán hàng và tiêu đề báo giá.'); return; }
      const sellerInfoJson = JSON.stringify({
        ...parseConfig(currentTemplateVersion.sellerInfoJson),
        companyName,
        address,
        taxCode,
        phone,
      });

      const currentPayment = parseConfig(currentTemplateVersion.paymentTermsJson);
      const paymentTermsJson = JSON.stringify({
        ...currentPayment,
        bankAccounts: [{ ...currentPayment.bankAccounts?.[0], accountNumber: bankAccount, bankName, accountHolder: bankHolder }, ...(currentPayment.bankAccounts?.slice(1) || [])],
      });
      await quotingTemplateApi.createVersion(selectedTemplate.id, {
        title,
        sellerInfoJson,
        salutationText: salutation,
        columnsConfigJson: currentTemplateVersion.columnsConfigJson,
        paymentTermsJson,
        signatureConfigJson: currentTemplateVersion.signatureConfigJson,
        customCss: currentTemplateVersion.customCss,
      });

      toast({ body: `Đã lưu phiên bản v${Number(selectedTemplate.currentVersion || 1) + 1} của mẫu báo giá.`, type: 'info' });
      await fetchTemplates();
    } catch (err) {
      setErrorMessage(err?.message || 'Lỗi khi tạo phiên bản mới.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (saving || !isAdmin) return;
    if (!newTemplateCode.trim() || !newTemplateName.trim()) {
      setErrorMessage('Nhập mã mẫu và tên mẫu báo giá.');
      return;
    }
    setSaving(true);
    setErrorMessage(null);
    try {
      const templateId = await quotingTemplateApi.createTemplate({
        code: newTemplateCode.trim(), name: newTemplateName.trim(), isSystem: false,
        title: currentTemplateVersion?.title || 'BẢNG BÁO GIÁ',
        sellerInfoJson: currentTemplateVersion?.sellerInfoJson || '{}',
        salutationText: currentTemplateVersion?.salutationText || '',
        columnsConfigJson: currentTemplateVersion?.columnsConfigJson || '{}',
        paymentTermsJson: currentTemplateVersion?.paymentTermsJson || '{}',
        signatureConfigJson: currentTemplateVersion?.signatureConfigJson || '{}',
        customCss: currentTemplateVersion?.customCss || null,
      });
      setIsCreateOpen(false);
      setSelectedTemplateId(templateId);
      await fetchTemplates();
      toast({ body: 'Đã tạo mẫu báo giá. Bạn có thể chỉnh sửa thông tin và lưu phiên bản mới.', type: 'info' });
    } catch (error) { setErrorMessage(error.message || 'Không thể tạo mẫu báo giá. Vui lòng thử lại.'); }
    finally { setSaving(false); }
  };

  const columns = useMemo(
    () => [
      {
        key: 'code',
        header: 'Mã mẫu',
        width: pixel(130),
        renderCell: (row) => (
          <Text type="body" weight="semibold">
            {row.code}
          </Text>
        ),
      },
      {
        key: 'name',
        header: 'Tên mẫu và mô tả',
        width: proportional(1, { minWidth: 240 }),
        renderCell: (row) => (
          <VStack gap={0.5}>
            <Text type="body" weight="semibold">
              {row.name}
            </Text>
            <Text type="supporting" color="secondary">
              {row.description || 'Mẫu chuẩn hệ thống'}
            </Text>
          </VStack>
        ),
      },
      {
        key: 'version',
        header: 'Phiên bản hiện tại',
        width: pixel(160),
        renderCell: (row) => (
          <Badge label={`v${row.currentVersion} (Mới nhất)`} variant="blue" />
        ),
      },
      {
        key: 'type',
        header: 'Loại Mẫu',
        width: pixel(160),
        renderCell: (row) => (
          <Badge
            label={row.isSystem ? 'Mẫu chuẩn hệ thống' : 'Mẫu tùy chỉnh'}
            variant={row.isSystem ? 'success' : 'neutral'}
          />
        ),
      },
      {
        key: 'actions',
        header: 'Thao tác',
        width: pixel(170),
        renderCell: (row) => (
          <Button
            variant="secondary"
            size="sm"
            label="Chọn mẫu"
            icon={<Icon icon={DocumentDuplicateIcon} size="sm" />}
            onClick={() => {
              setSelectedTemplateId(row.id);
              setActiveSection('seller');
              setErrorMessage(null);
                    }}
          />
        ),
      },
    ],
    [templates]
  );

  return (
    <VStack gap={6}>
      <Drawer isOpen={isCreateOpen} onOpenChange={(open) => { if (!saving) setIsCreateOpen(open); }} side="end" width={520} label="Thêm mẫu báo giá">
        <VStack gap={4}>
          <DrawerHeader title="Thêm mẫu báo giá" onOpenChange={(open) => { if (!saving) setIsCreateOpen(open); }} />
          <Text type="body">{selectedTemplate ? `Sao chép nội dung từ mẫu ${selectedTemplate.name}. Mẫu mới có phiên bản độc lập.` : 'Tạo mẫu mới rồi cấu hình đơn vị bán hàng và nội dung báo giá.'}</Text>
          <TextInput label="Mã mẫu" value={newTemplateCode} onChange={setNewTemplateCode} placeholder="Ví dụ: BG-DAI-LY" />
          <TextInput label="Tên mẫu" value={newTemplateName} onChange={setNewTemplateName} placeholder="Ví dụ: Báo giá đại lý" />
          {isCreateOpen && errorMessage && <Banner status="error" title="Chưa thể tạo mẫu" description={errorMessage} />}
          <HStack gap={2} hAlign="end"><Button label="Hủy" variant="secondary" isDisabled={saving} onClick={() => setIsCreateOpen(false)} /><Button label="Tạo mẫu" variant="primary" onClick={handleCreateTemplate} isLoading={saving} /></HStack>
        </VStack>
      </Drawer>
      {/* Title */}
      <HStack gap={3} vAlign="center" hAlign="between" wrap="wrap">
        <VStack gap={1}>
          <Heading level={1}>Mẫu báo giá</Heading>
          <Text type="body" color="secondary">
            Cấu hình đơn vị bán hàng, tài khoản thanh toán và nội dung mẫu.
          </Text>
        </VStack>
        <HStack gap={2} wrap="wrap">
        <Button label="Thêm mẫu" variant="secondary" isDisabled={!isAdmin || loading || saving} onClick={() => { setNewTemplateCode(''); setNewTemplateName(''); setErrorMessage(null); setIsCreateOpen(true); }} />
        <Button
          variant="primary"
          label={saving ? 'Đang lưu...' : 'Lưu phiên bản mới'}
          icon={<Icon icon={CheckIcon} size="sm" />}
          onClick={handlePublishVersion}
          isLoading={saving}
          isDisabled={!isAdmin || loading || !currentTemplateVersion}
        />
        </HStack>
      </HStack>

      <Selector label="Mẫu báo giá đang chỉnh sửa" value={selectedTemplateId} onChange={(id) => { setSelectedTemplateId(id); setErrorMessage(null); }}
        options={templates.map((template) => ({ value: template.id, label: `${template.name} · v${template.currentVersion}` }))} />
      {!isAdmin && <Banner status="info" title="Chế độ xem" description="Chỉ quản trị viên được thay đổi mẫu báo giá." />}
      {loading && <Skeleton height={80} />}
      {!loading && templates.length === 0 && <Banner status="info" title="Chưa có mẫu báo giá" description="Liên hệ quản trị viên để thêm mẫu trước khi lập báo giá." />}
      {/* Info / Status Banners */}
      {errorMessage && (
        <Banner status="error" title="Lỗi cập nhật" description={errorMessage} />
      )}

      {/* 2-Panel Settings Sidebar Layout */}
      <Layout
        className="quotation-settings"
        height="auto"
        start={
          <LayoutPanel hasDivider padding={0}>
            <VStack gap={2} style={{ padding: '16px 12px', minWidth: 240 }}>
              <Heading level={3} style={{ padding: '4px 12px' }}>
                Danh mục thiết lập
              </Heading>
              <List density="spacious">
                {SETTINGS_SECTIONS.map((sec) => (
                  <ListItem
                    key={sec.id}
                    label={sec.label}
                    startContent={<Icon icon={sec.icon} />}
                    isSelected={activeSection === sec.id}
                    onClick={() => setActiveSection(sec.id)}
                  />
                ))}
              </List>
            </VStack>
          </LayoutPanel>
        }
        content={
          <LayoutContent padding={4}>
            <Card>
              {activeSection === 'seller' && (
                <VStack gap={5}>
                  <VStack gap={1}>
                    <Heading level={2}>Đơn vị bán hàng</Heading>
                    <Text type="supporting" color="secondary">
                      Thông tin này được dùng cho báo giá tạo từ phiên bản mẫu mới.
                    </Text>
                  </VStack>
                  <Divider />

                  <Grid className="quoting-grid" columns={{ minWidth: 260, repeat: 'fit' }} gap={4}>
                    <TextInput
                      isDisabled={!isAdmin || loading || saving}
                      label="Tên đơn vị bán hàng"
                      value={companyName}
                      onChange={setCompanyName}
                    />
                    <TextInput
                      isDisabled={!isAdmin || loading || saving}
                      label="Mã số thuế"
                      value={taxCode}
                      onChange={setTaxCode}
                    />
                    <TextInput
                      isDisabled={!isAdmin || loading || saving}
                      label="Số điện thoại liên hệ"
                      value={phone}
                      onChange={setPhone}
                    />
                  </Grid>

                  <TextInput
                      isDisabled={!isAdmin || loading || saving}
                    label="Địa chỉ đơn vị bán hàng"
                    value={address}
                    onChange={setAddress}
                  />
                </VStack>
              )}

              {activeSection === 'banking' && (
                <VStack gap={5}>
                  <VStack gap={1}>
                    <Heading level={2}>Tài khoản thanh toán</Heading>
                    <Text type="supporting" color="secondary">
                      Thông tin tài khoản nhận thanh toán in trên phần cam kết giao dịch của file PDF báo giá
                    </Text>
                  </VStack>
                  <Divider />

                  <Grid className="quoting-grid" columns={{ minWidth: 240, repeat: 'fit' }} gap={4}>
                    <TextInput
                      isDisabled={!isAdmin || loading || saving}
                      label="Số tài khoản ngân hàng"
                      value={bankAccount}
                      onChange={setBankAccount}
                    />
                    <TextInput
                      isDisabled={!isAdmin || loading || saving}
                      label="Tên ngân hàng"
                      value={bankName}
                      onChange={setBankName}
                    />
                    <TextInput
                      isDisabled={!isAdmin || loading || saving}
                      label="Chủ tài khoản"
                      value={bankHolder}
                      onChange={setBankHolder}
                    />
                  </Grid>
                </VStack>
              )}

              {activeSection === 'salutation' && (
                <VStack gap={5}>
                  <VStack gap={1}>
                    <Heading level={2}>Tiêu đề và lời ngỏ</Heading>
                    <Text type="supporting" color="secondary">
                      Tùy chỉnh tiêu đề hiển thị và lời cảm ơn gửi tới Quý đối tác &amp; khách hàng
                    </Text>
                  </VStack>
                  <Divider />

                  <TextInput
                      isDisabled={!isAdmin || loading || saving}
                    label="Tiêu đề báo giá"
                    value={title}
                    onChange={setTitle}
                  />

                  <TextArea
                    isDisabled={!isAdmin || loading || saving}
                    label="Lời ngỏ"
                    value={salutation}
                    onChange={setSalutation}
                    rows={4}
                  />
                </VStack>
              )}

              {activeSection === 'versions' && (
                <VStack gap={5}>
                  <VStack gap={1}>
                    <Heading level={2}>Phiên bản mẫu</Heading>
                    <Text type="supporting" color="secondary">
                      Báo giá đã tạo giữ nguyên phiên bản mẫu đang áp dụng, kể cả khi bạn lưu phiên bản mẫu mới.
                    </Text>
                  </VStack>
                  <Divider />

                  <Table
                    data={templates}
                    columns={columns}
                    idKey="id"
                    density="balanced"
                    hasHover
                  />
                </VStack>
              )}
            </Card>
          </LayoutContent>
        }
      />
    </VStack>
  );
}
