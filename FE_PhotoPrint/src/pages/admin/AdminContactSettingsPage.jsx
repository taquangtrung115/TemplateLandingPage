import { Clock, Link2, Mail, MapPin, MessageSquare, Phone, QrCode, Save, Store, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { UiverseButton, UiverseIconLabel, UiverseInput, UiverseToggle } from '@oneportal/uiverse-ui';
import { useContactConfig } from '../../contexts/ContactConfigContext';
import { contactConfigApi } from '../../api/contactConfigApi';
import { uploadPhoto, photoAssetUrl } from '../../api/photoUploadApi';
import { resolveMessengerUrl, resolveZaloUrl } from '../../utils/socialLinks';
import { photoAccept } from '../../utils/fileUpload';
import { sanitizePhone } from '../../utils/safeUrl';
import { canUseVietQr, vietQrBanks, vietQrPayload } from '../../utils/vietQr';
import { useChannelQr } from '../../components/social/SocialConnectModal';
import PageHeading from '../../components/common/PageHeading';
import RequestState from '../../components/common/RequestState';
import useAction from '../../hooks/useAction';
import useDebounce from '../../hooks/useDebounce';
import useRequest from '../../hooks/useRequest';
import useVietQrImage from '../../hooks/useVietQrImage';
import { isDemoMode } from '../../api/axios';
import SettingsNavigation from './SettingsNavigation';

function ChannelPreview({ path, current }) {
  const qr = useChannelQr(useDebounce(path, 180));
  const picture = photoAssetUrl(current) || qr.value;
  return <div className="settings-qr">
    {picture && <img src={picture} className="qr-image" alt="Mã QR xem thử" />}
    {path ? <a className="text-link break-all" href={path} target="_blank" rel="noreferrer">{path}</a> : <p className="muted">Nhập liên kết hoặc ID để xem thử QR.</p>}
  </div>;
}

const business = { brandName: 'Tên tiệm', hotline: 'Hotline', email: 'Email', address: 'Địa chỉ', workingHours: 'Giờ mở cửa' };
const businessIcons = { brandName: Store, hotline: Phone, email: Mail, address: MapPin, workingHours: Clock };
const channels = [
  { key: 'zalo', label: 'Zalo', fields: { zaloAccountName: 'Tên tài khoản', zaloPhoneOrOaId: 'SĐT hoặc ID OA', zaloLinkOverride: 'Liên kết Zalo', zaloPrefillText: 'Tin nhắn gợi ý' }, resolve: resolveZaloUrl },
  { key: 'messenger', label: 'Messenger', fields: { messengerPageIdOrUsername: 'Page ID hoặc username', messengerLinkOverride: 'Liên kết Messenger', messengerPrefillText: 'Tin nhắn gợi ý' }, resolve: resolveMessengerUrl },
];

function ContactForm({ config, onSaved }) {
  const [draft, setDraft] = useState(config);
  const [saved, setSaved] = useState(false);
  const action = useAction();
  const qrPayload = useDebounce(vietQrPayload(draft), 180);
  const bankQr = useVietQrImage(isDemoMode && qrPayload ? 'PHOTOPRINT DEMO' : qrPayload);
  const set = (name, value) => { setSaved(false); setDraft(current => ({ ...current, [name]: value })); };

  function save(event) {
    event.preventDefault();
    action.run(async () => {
      if (!draft.brandName?.trim()) throw new Error('Nhập tên tiệm ảnh.');
      if (draft.hotline && !sanitizePhone(draft.hotline)) throw new Error('Hotline không hợp lệ.');
      if (draft.vietQrEnabled && !canUseVietQr(draft)) throw new Error('Chọn ngân hàng và kiểm tra số tài khoản, tên chủ tài khoản.');
      for (const { key, label, resolve } of channels) {
        if (draft[key + 'Enabled'] && !resolve(draft) && (draft[key + 'LinkOverride'] || !draft[key + 'QrImageUrl'])) {
          throw new Error('Kiểm tra liên kết hoặc ID ' + label + '.');
        }
      }
      const result = await contactConfigApi.save(draft);
      onSaved(result?.config || result || draft);
      setSaved(true);
    });
  }

  return <form className="form-stack" onSubmit={save}>
    <fieldset className="panel form-columns" disabled={action.busy}><legend><UiverseIconLabel icon={Store}>Thông tin tiệm ảnh</UiverseIconLabel></legend>
      {Object.entries(business).map(([name, label]) => <UiverseInput key={name} labelIcon={businessIcons[name]} label={label} required={name === 'brandName'} type={name === 'email' ? 'email' : 'text'}
        value={draft[name] || ''} onChange={event => set(name, event.target.value)} />)}
    </fieldset>
    <fieldset className="panel form-stack" disabled={action.busy}>
      <legend><UiverseIconLabel icon={QrCode}>Cấu hình VietQR & ngân hàng nhận tiền</UiverseIconLabel></legend>
      <UiverseToggle label="Bật chuyển khoản VietQR" checked={!!draft.vietQrEnabled} onChange={checked => set('vietQrEnabled', checked)} />
      <div className="form-columns">
        <UiverseInput as="select" label="Ngân hàng" value={draft.bankCode || ''} required={draft.vietQrEnabled} onChange={event => set('bankCode', event.target.value)}>
          <option value="">Chọn ngân hàng</option>
          {Object.entries(vietQrBanks).map(([code, bank]) => <option key={code} value={code}>{bank.name}</option>)}
        </UiverseInput>
        <UiverseInput label="Số tài khoản" inputMode="numeric" pattern="[0-9]{1,19}" maxLength={19} required={draft.vietQrEnabled} value={draft.bankAccountNumber || ''}
          onChange={event => set('bankAccountNumber', event.target.value)} />
        <UiverseInput label="Tên chủ tài khoản" maxLength={120} required={draft.vietQrEnabled} value={draft.bankAccountName || ''}
          onChange={event => set('bankAccountName', event.target.value)} />
        <UiverseInput label="Chi nhánh (tùy chọn)" maxLength={150} value={draft.bankBranch || ''} onChange={event => set('bankBranch', event.target.value)} />
      </div>
      {bankQr.url && <div className="settings-qr"><img className="qr-image" src={bankQr.url} alt="Xem thử mã VietQR của tiệm" /><span>Xem thử QR tài khoản{isDemoMode && ' demo'}</span></div>}
    </fieldset>
    <div className="form-columns">
      {channels.map(({ key, label, fields, resolve }) => <fieldset key={key} className="panel form-stack" disabled={action.busy}>
        <legend><UiverseIconLabel icon={MessageSquare}>{label}</UiverseIconLabel></legend>
        <UiverseToggle labelIcon={ToggleRight} label={'Bật ' + label} checked={!!draft[key + 'Enabled']} onChange={checked => set(key + 'Enabled', checked)} />
        {Object.entries(fields).map(([name, label]) => <UiverseInput key={name} labelIcon={Link2} label={label} value={draft[name] || ''} onChange={event => set(name, event.target.value)} />)}
        <UiverseInput labelIcon={QrCode} label={'Tải QR ' + label} type="file" accept={photoAccept} onChange={event => {
          const file = event.target.files[0];
          event.target.value = '';
          if (file) action.run(async signal => set(key + 'QrImageUrl', (await uploadPhoto(file, 'qr', signal)).fileUrl));
        }} />
        {draft[key + 'QrImageUrl'] && <UiverseButton icon={<Trash2 className="control-icon" aria-hidden="true" />} size="small" variant="outline" onClick={() => set(key + 'QrImageUrl', null)}>Bỏ QR đã tải</UiverseButton>}
        <ChannelPreview current={draft[key + 'QrImageUrl']} path={resolve({ ...draft, [key + 'Enabled']: true })} />
      </fieldset>)}
    </div>
    {action.error && <p className="notice notice-error" role="alert">{action.error}</p>}
    {saved && <p className="notice" role="status">Đã lưu kênh liên hệ.</p>}
    <UiverseButton icon={<Save className="control-icon" aria-hidden="true" />} type="submit" isLoading={action.busy}>Lưu kênh liên hệ</UiverseButton>
  </form>;
}

export default function AdminContactSettingsPage() {
  const config = useRequest(contactConfigApi.get);
  const { setUpdatedConfig } = useContactConfig();
  return <><PageHeading title="Cài đặt tiệm ảnh" /><SettingsNavigation />
    <RequestState result={config}>{config.data && <ContactForm config={config.data} onSaved={setUpdatedConfig} />}</RequestState>
  </>;
}
