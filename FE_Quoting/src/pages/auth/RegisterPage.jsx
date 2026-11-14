import React, { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Card } from '@astryxdesign/core/Card';
import { TextInput } from '@astryxdesign/core/TextInput';
import { VStack } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '../../components/common/Button';
import AppLoading from '../../components/common/AppLoading';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../contexts/AuthContext';
import useRegistrationSettings from '../../hooks/useRegistrationSettings';

export default function RegisterPage() {
  // #region State
  const { isAuthenticated, loading: restoring } = useAuth();
  const { settings, loading, error: settingsError, reload } = useRegistrationSettings();
  const location = useLocation();
  const [fullName, setFullName] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [created, setCreated] = useState(false);
  // #endregion
  // #region Handlers
  async function handleSubmit(event) {
    event.preventDefault(); if (busy || !settings?.allowSelfRegistration) return;
    if (!fullName.trim() || !email.trim() || password.length < 8) { setError('Nhập họ tên, email và mật khẩu từ 8 ký tự.'); return; }
    if (password !== confirm) { setError('Mật khẩu xác nhận chưa khớp.'); return; }
    setBusy(true); setError('');
    try { await authApi.register({ fullName: fullName.trim(), email: email.trim(), password }); setPassword(''); setConfirm(''); setCreated(true); }
    catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  // #endregion
  if (restoring || loading) return <AppLoading label="Đang kiểm tra đăng ký"/>;
  if (isAuthenticated) return <Navigate to="/" replace/>;
  return <main className="registration-page"><Card padding={6} width="100%"><VStack gap={4} width="100%">
    <Heading level={1}>Đăng ký Quoting</Heading><Text color="secondary">{settings?.tenantName || 'Workspace hiện tại'}</Text>
    {settingsError ? <><Banner status="error" title="Chưa kiểm tra được đăng ký" description={settingsError}/><Button label="Thử lại" onClick={reload}/></>
      : created ? <Banner status="success" title="Tạo tài khoản thành công" description="Bạn đã có quyền User tại workspace này. Đăng nhập để bắt đầu lập báo giá."/>
      : !settings?.allowSelfRegistration ? <Banner status="info" title="Workspace chưa mở đăng ký" description="Liên hệ quản trị viên công ty để được cấp tài khoản hoặc quyền truy cập."/>
      : <form onSubmit={handleSubmit} className="registration-form"><VStack gap={4} width="100%">
        {error && <Banner status="error" title="Chưa thể tạo tài khoản" description={error}/>}
        <TextInput label="Họ tên" value={fullName} onChange={setFullName} autoComplete="name" maxLength={100} isRequired/>
        <TextInput label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" maxLength={256} isRequired/>
        <TextInput label="Mật khẩu" type="password" value={password} onChange={setPassword} autoComplete="new-password" minLength={8} maxLength={128} isRequired/>
        <TextInput label="Xác nhận mật khẩu" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" isRequired/>
        <Text type="supporting" color="secondary">Tài khoản được cấp vai trò User trong workspace này. Email đã có tài khoản cần được quản trị viên cấp quyền.</Text>
        <Button label={busy ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'} type="submit" isLoading={busy} width="100%"/>
      </VStack></form>}
    <Link className="auth-link" to="/login" state={location.state}>Về đăng nhập</Link>
  </VStack></Card></main>;
}
