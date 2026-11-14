import React, { useState } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Heading, Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/Layout';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '../../components/common/Button';
import useRegistrationSettings from '../../hooks/useRegistrationSettings';
import { workspaceApi } from '../../api/workspaceApi';
export default function RegistrationSettingsPage() {
  const { settings, setSettings, loading, error: loadError, reload } = useRegistrationSettings();
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  async function save() {
    if (busy || !settings) return; setBusy(true); setError(''); setNotice('');
    try { setSettings(await workspaceApi.configureRegistration(!settings.allowSelfRegistration)); setNotice('Đã lưu cấu hình đăng ký.'); }
    catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  return <section className="admin-page"><Card padding={6}><VStack gap={4}>
    <Heading level={1}>Đăng ký tài khoản</Heading><Text color="secondary">{settings?.tenantName} · Quoting</Text>
    {loading && <p role="status">Đang tải cấu hình…</p>}
    {(error || loadError) && <Banner status="error" title="Chưa thể cập nhật" description={error || loadError}/>}
    {loadError && <Button label="Thử lại" onClick={reload}/>}{notice && <p role="status">{notice}</p>}
    {settings && <><Text>Trạng thái: {settings.allowSelfRegistration ? 'Đang mở tự đăng ký' : 'Đang đóng tự đăng ký'}</Text><Text color="secondary">Người đăng ký được dùng ngay với vai trò User trong workspace này. Quản trị viên có thể thêm tài khoản thủ công tại Thành viên.</Text>
      <Button label={settings.allowSelfRegistration ? 'Đóng tự đăng ký' : 'Mở tự đăng ký'} onClick={save} isLoading={busy}/></>}
  </VStack></Card></section>;
}
