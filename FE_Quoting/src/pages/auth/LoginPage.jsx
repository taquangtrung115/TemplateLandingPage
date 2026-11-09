import React, { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Center } from '@astryxdesign/core/Center';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { IconButton } from '@astryxdesign/core/IconButton';
import { InputGroup } from '@astryxdesign/core/InputGroup';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { Divider } from '@astryxdesign/core/Divider';
import { Icon } from '@astryxdesign/core/Icon';
import { Spinner } from '@astryxdesign/core/Spinner';
import {
  BuildingStorefrontIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../../components/common/ThemeToggle';

// #region Return location
function getReturnLocation(location) {
  const previous = location.state?.from;
  const pathname = previous?.pathname;
  if (typeof pathname !== 'string' || !pathname.startsWith('/') || pathname.startsWith('//')
    || pathname.includes('\\') || pathname.replace(/\/+$/, '') === '/login') return '/';
  return `${pathname}${previous.search || ''}${previous.hash || ''}`;
}
// #endregion

export default function LoginPage() {
  // #region State
  const { login, loading: restoringSession, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnLocation = getReturnLocation(location);

  // Khởi tạo state rỗng, tuân thủ an toàn bảo mật OWASP (không prefill thông tin nhạy cảm)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // #endregion

  // #region Handlers
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (loading) return;
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email.trim(), password);
      navigate(returnLocation, { replace: true });
    } catch (err) {
      setError(err?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };
  // #endregion

  if (restoringSession) return <Center className="login-page"><Spinner label="Đang kiểm tra phiên đăng nhập" /></Center>;
  if (isAuthenticated) return <Navigate to={returnLocation} replace />;

  return (
    <Center axis="both" className="login-page">
      <VStack gap={4} width="100%">
        <div className="quoting-toolbar login-card-wrap"><ThemeToggle /></div>
        <div className="login-card-wrap">
          <Card padding={0} width="100%">
            <div className="login-split-grid">
              {/* Cột 1: Form Đăng Nhập */}
              <VStack gap={5} height="100%" width="100%" justify="center" className="login-form">
                <HStack gap={3} vAlign="center" className="login-brand">
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      backgroundColor: 'var(--color-background-surface)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <Icon icon={BuildingStorefrontIcon} size="md" color="accent" />
                  </div>
                  <VStack gap={0}>
                    <Heading level={1}>CHUỖI ĂN VẶT</Heading>
                    <Text type="supporting" color="secondary">
                      Phân Hệ Báo giá &amp; Quản Lý Thương Mại
                    </Text>
                  </VStack>
                </HStack>

                <VStack gap={1}>
                  <Heading level={2}>Chào mừng trở lại</Heading>
                  <Text type="body" color="secondary" size="sm">
                    Đăng nhập tài khoản để tiếp tục công việc lập và duyệt báo giá
                  </Text>
                </VStack>

                {error && (
                  <Banner
                    status="error"
                    title="Lỗi xác thực"
                    description={error}
                  />
                )}

                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                  <VStack gap={4}>
                    <TextInput
                      label="Email"
                      type="email"
                      autoComplete="username"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(v) => {
                        setEmail(v);
                        if (error) setError(null);
                      }}
                      size="lg"
                    />

                    <InputGroup label="Mật khẩu">
                      <TextInput type={showPassword ? 'text' : 'password'} placeholder="Nhập mật khẩu" value={password} onChange={(value) => { setPassword(value); setError(null); }} autoComplete="current-password" size="lg" />
                      <IconButton type="button" label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} icon={<Icon icon={showPassword ? EyeSlashIcon : EyeIcon} size="sm" />} variant="ghost" onClick={() => setShowPassword((value) => !value)} />
                    </InputGroup>

                    <Button
                      label={loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                      variant="primary"
                      size="lg"
                      type="submit"
                      isLoading={loading}
                      width="100%"
                    />
                  </VStack>
                </form>

                <Divider />

                <Card variant="muted" padding={3}>
                  <HStack gap={2} vAlign="start">
                    <Icon icon={ShieldCheckIcon} size="sm" color="accent" />
                    <Text type="supporting" color="secondary">
                      Hệ thống áp dụng chuẩn an toàn OWASP. Vui lòng sử dụng thông tin định danh nội bộ được quản trị viên cấp phát.
                    </Text>
                  </HStack>
                </Card>
              </VStack>

              {/* Cột 2: Cover Card Giới thiệu giải pháp */}
              <div className="login-split-image">
                <Card
                  variant="muted"
                  padding={6}
                  width="100%"
                  height="100%"
                  className="login-promo-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <VStack gap={4}>
                    <HStack gap={2} vAlign="center">
                      <Icon icon={SparklesIcon} size="md" color="accent" />
                      <Heading level={3}>Lập báo giá nhanh hơn</Heading>
                    </HStack>
                    <Text type="body" color="secondary">
                      Chọn sản phẩm, điều chỉnh đơn giá theo khách hàng và tải báo giá PDF. Nội dung và phiên bản mẫu được lưu cùng báo giá.
                    </Text>

                    <VStack gap={2}>
                      <HStack gap={2} vAlign="center">
                        <Icon icon={CheckCircleIcon} size="sm" color="success" />
                        <Text type="supporting">Quản lý danh mục Combo &amp; Xiên Que</Text>
                      </HStack>
                      <HStack gap={2} vAlign="center">
                        <Icon icon={CheckCircleIcon} size="sm" color="success" />
                        <Text type="supporting">Theo dõi bản nháp, đã gửi và đã phê duyệt</Text>
                      </HStack>
                      <HStack gap={2} vAlign="center">
                        <Icon icon={CheckCircleIcon} size="sm" color="success" />
                        <Text type="supporting">Lưu trữ bảo toàn lịch sử giao dịch khách hàng</Text>
                      </HStack>
                    </VStack>
                  </VStack>

                  <VStack gap={1} style={{ marginTop: 'auto', paddingTop: 24 }}>
                    <Text type="supporting" color="secondary">
                      Chọn giao diện sáng hoặc tối theo nhu cầu của bạn.
                    </Text>
                  </VStack>
                </Card>
              </div>
            </div>
          </Card>
        </div>

        <VStack hAlign="center">
          <Text type="supporting" color="secondary">
            © 2026 Chuỗi Ăn Vặt. Bảo lưu mọi quyền.
          </Text>
        </VStack>
      </VStack>
    </Center>
  );
}
