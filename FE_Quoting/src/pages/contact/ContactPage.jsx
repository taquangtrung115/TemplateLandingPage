import React, { useState } from 'react';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Center } from '@astryxdesign/core/Center';
import { Section } from '@astryxdesign/core/Section';
import { Grid } from '@astryxdesign/core/Grid';
import { Card } from '@astryxdesign/core/Card';
import { Button } from '../../components/common/Button';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Icon } from '@astryxdesign/core/Icon';
import { TextInput } from '@astryxdesign/core/TextInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Selector } from '@astryxdesign/core/Selector';
import { Token } from '@astryxdesign/core/Token';
import { Divider } from '@astryxdesign/core/Divider';
import { useToast } from '@astryxdesign/core/Toast';
import { quotingSupportApi } from '../../api/quotingSupportApi';
import { Banner } from '@astryxdesign/core/Banner';
import {
  ChatBubbleLeftRightIcon,
  DocumentDuplicateIcon,
  PrinterIcon,
  CheckCircleIcon, PlusIcon, PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

const REQUEST_TOPICS = [
  'Báo giá & Chiết Khấu',
  'Tùy Biến In Ấn PDF',
  'Tích Hợp Cửa Hàng',
  'Hỗ Trợ Kỹ Thuật',
  'Góp Ý Tính Năng',
  'Yêu Cầu Khác',
];

const PRIORITY_OPTIONS = [
  { label: 'Bình thường', value: 'normal' },
  { label: 'Ưu tiên cao', value: 'high' },
  { label: 'Khẩn cấp', value: 'urgent' },
];

const SUPPORT_CHANNELS = [
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Hỗ trợ kỹ thuật',
    description: 'Ghi nhận lỗi hệ thống và các vấn đề trong quá trình sử dụng.',
  },
  {
    icon: PrinterIcon,
    title: 'Mẫu báo giá PDF',
    description: 'Hỗ trợ thiết kế layout hóa đơn, báo giá thương mại theo nhận diện thương hiệu.',
  },
  {
    icon: DocumentDuplicateIcon,
    title: 'Danh mục sản phẩm',
    description: 'Tư vấn cấu trúc danh mục Combo và sản phẩm lẻ tối ưu chi phí phân phối.',
  },
];

export default function ContactPage() {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('Báo giá & Chiết Khấu');
  const [priority, setPriority] = useState('normal');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    if (saving) { e?.preventDefault(); return; }
    e?.preventDefault();
    setSubmitted(true);
    if (!fullName.trim() || !email.trim() || !message.trim()) {
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setErrorMessage('Nhập địa chỉ email hợp lệ.'); return; }
    setSaving(true);
    setErrorMessage(null);
    try {
      const result = await quotingSupportApi.submitRequest({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim() || null, topic: selectedTopic, priority, message: message.trim() });
      if (!result?.id) throw new Error('Máy chủ chưa trả về mã yêu cầu hợp lệ.');
      setRequestId(result.id);
      setIsSuccess(true);
      toast({ body: 'Đã lưu yêu cầu hỗ trợ.', type: 'info' });
    } catch (error) { setErrorMessage(error.message || 'Không thể gửi yêu cầu. Nội dung của bạn được giữ lại để thử lại.'); }
    finally { setSaving(false); }
  };

  return (
    <Center axis="horizontal">
      <VStack hAlign="center" width="100%" gap={6} style={{ maxWidth: 900 }}>
        {/* Header */}
        <VStack gap={2} hAlign="center" style={{ textAlign: 'center' }}>
          <Heading level={1}>Hỗ trợ</Heading>
          <Text type="body" color="secondary">
            Gửi yêu cầu hỗ trợ, phản hồi hoặc đóng góp ý kiến về hệ thống báo giá Chuỗi Ăn Vặt
          </Text>
        </VStack>

        {/* Feature Cards */}
        <Grid className="quoting-grid" columns={{ minWidth: 240, repeat: 'fit' }} gap={4} width="100%">
          {SUPPORT_CHANNELS.map((item) => (
            <Card key={item.title}>
              <VStack gap={3}>
                <div
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    backgroundColor: 'var(--color-background-surface)',
                    border: '1px solid var(--color-border)',
                    display: 'inline-flex',
                    width: 'fit-content',
                  }}
                >
                  <Icon icon={item.icon} size="md" color="accent" />
                </div>
                <VStack gap={1}>
                  <Text type="body" weight="bold">
                    {item.title}
                  </Text>
                  <Text type="supporting" color="secondary">
                    {item.description}
                  </Text>
                </VStack>
              </VStack>
            </Card>
          ))}
        </Grid>

        {/* Contact Form Card */}
        <Card width="100%">
          <Section variant="section" padding={4}>
            {isSuccess ? (
              <VStack gap={4} hAlign="center" style={{ padding: '32px 16px', textAlign: 'center' }}>
                <Icon icon={CheckCircleIcon} size="xl" color="success" />
                <Heading level={2}>Đã lưu yêu cầu hỗ trợ</Heading>
                <Text type="body" color="secondary" style={{ maxWidth: 500 }}>
                  Yêu cầu đã được lưu trong hệ thống. Mã yêu cầu: <strong>{requestId}</strong>. Email liên hệ: <strong>{email}</strong>.
                </Text>
                <Button icon={<Icon icon={PlusIcon} size="sm" />}
                  label="Tạo yêu cầu khác"
                  variant="secondary"
                  onClick={() => {
                    setIsSuccess(false);
                    setSubmitted(false);
                    setMessage('');
                  }}
                />
              </VStack>
            ) : (
              <form onSubmit={handleSubmit}>
                <VStack gap={6}>
                  <VStack gap={1}>
                    <Heading level={2}>Gửi yêu cầu hỗ trợ</Heading>
                    <Text type="supporting" color="secondary">
                      Vui lòng điền đầy đủ các thông tin cần thiết bên dưới
                    </Text>
                  </VStack>

                  <Divider />
                  {errorMessage && <Banner status="error" title="Chưa thể gửi yêu cầu" description={errorMessage} />}

                  {/* Thông tin người gửi */}
                  <Grid className="quoting-grid" columns={{ minWidth: 240, repeat: 'fit' }} gap={4}>
                    <TextInput
                      label="Họ và tên"
                      value={fullName}
                      onChange={setFullName}
                      placeholder="Nguyễn Văn A"
                      status={
                        submitted && !fullName.trim()
                          ? { type: 'error', message: 'Vui lòng nhập họ tên' }
                          : undefined
                      }
                    />
                    <TextInput
                      label="Email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      placeholder="email@company.com"
                      status={
                        submitted && !email.trim()
                          ? { type: 'error', message: 'Vui lòng nhập email' }
                          : undefined
                      }
                    />
                    <TextInput
                      label="Số điện thoại liên hệ"
                      value={phone}
                      onChange={setPhone}
                      placeholder="0901 234 567"
                    />
                  </Grid>

                  {/* Chủ đề yêu cầu */}
                  <VStack gap={2}>
                    <Text type="label" color="secondary">
                      Chủ đề cần hỗ trợ
                    </Text>
                    <HStack gap={2} wrap="wrap">
                      {REQUEST_TOPICS.map((topic) => (
                        <Token
                          key={topic}
                          label={topic}
                          color={selectedTopic === topic ? 'blue' : 'default'}
                          onClick={() => setSelectedTopic(topic)}
                        />
                      ))}
                    </HStack>
                  </VStack>

                  {/* Mức độ ưu tiên */}
                  <div style={{ maxWidth: 360 }}>
                    <Selector
                      label="Mức độ ưu tiên"
                      value={priority}
                      onChange={setPriority}
                      options={PRIORITY_OPTIONS}
                    />
                  </div>

                  {/* Nội dung chi tiết */}
                  <TextArea
                    label="Nội dung yêu cầu chi tiết"
                    placeholder="Mô tả cụ thể vấn đề hoặc mẫu in ấn bạn mong muốn tùy chỉnh..."
                    value={message}
                    onChange={setMessage}
                    rows={4}
                    status={
                      submitted && !message.trim()
                        ? { type: 'error', message: 'Vui lòng nhập nội dung' }
                        : undefined
                    }
                  />

                  <Divider />

                  <HStack hAlign="end" gap={3}>
                    <Button icon={<Icon icon={PaperAirplaneIcon} size="sm" />}
                      label={saving ? 'Đang gửi...' : 'Gửi yêu cầu'}
                      isLoading={saving}
                      variant="primary"
                      size="lg"
                      type="submit"
                    />
                  </HStack>
                </VStack>
              </form>
            )}
          </Section>
        </Card>
      </VStack>
    </Center>
  );
}
