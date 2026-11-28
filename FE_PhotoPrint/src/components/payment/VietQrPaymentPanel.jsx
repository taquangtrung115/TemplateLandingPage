import { CheckCircle2, QrCode, ReceiptText } from 'lucide-react';
import { useState } from 'react';
import { UiverseButton, UiverseInput } from '@oneportal/uiverse-ui';
import { isDemoMode } from '../../api/axios';
import { photoPaymentApi } from '../../api/photoPaymentApi';
import { useContactConfig } from '../../contexts/ContactConfigContext';
import useAction from '../../hooks/useAction';
import useVietQrImage from '../../hooks/useVietQrImage';
import { formatMoney } from '../../utils/photoPricing';
import { sanitizePhone } from '../../utils/safeUrl';
import { paymentStatuses, vietQrBanks, vietQrPayload } from '../../utils/vietQr';
import CopyButton from '../common/CopyButton';
import Modal from '../common/Modal';
import ContactActions from '../social/ContactActions';

export default function VietQrPaymentPanel({ order, phone, onRecorded, onClose }) {
  const { config } = useContactConfig();
  const [receipt, setReceipt] = useState(null);
  const [tab, setTab] = useState('pay');
  const action = useAction();
  const payload = vietQrPayload(config, order.grandTotal, order.transferMemo);
  const qr = useVietQrImage(isDemoMode && payload ? 'PHOTOPRINT DEMO ' + order.orderCode : payload);
  const bankName = config.bankName || vietQrBanks[config.bankCode]?.name;

  function confirm(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    action.run(async signal => {
      const customerPhone = sanitizePhone(values.get('customerPhone'));
      if (!customerPhone) throw new Error('Nhập số điện thoại đã dùng khi đặt in.');
      const result = await photoPaymentApi.confirm({
        orderCode: order.orderCode, customerPhone, bankCode: config.bankCode,
        bankAccountNumber: config.bankAccountNumber, amount: order.grandTotal, transferMemo: order.transferMemo,
        note: values.get('note')?.trim() || null,
      }, signal);
      if (signal.aborted) return;
      setReceipt(result);
      setTab('receipt');
      onRecorded?.(result);
    });
  }

  return <Modal title="Thanh toán VietQR" id="pay-dlg" onClose={onClose} locked={action.busy} wide>
    <div className="tabs mb-4" aria-label="Bước thanh toán">
      <button type="button" className="tab" aria-pressed={tab === 'pay'} disabled={Boolean(receipt)} onClick={() => setTab('pay')}><QrCode size={16} /> Quét mã VietQR</button>
      <button type="button" className="tab" aria-pressed={tab === 'receipt'} disabled={!receipt} onClick={() => setTab('receipt')}><ReceiptText size={16} /> Biên lai</button>
    </div>
    {isDemoMode && <p className="notice mb-4">Mô phỏng thanh toán. Không chuyển tiền vào tài khoản demo.</p>}
    {tab === 'receipt' && receipt ? <div className="form-stack">
      <p className="notice" role="status"><CheckCircle2 size={17} /> Đã ghi nhận giao dịch · {paymentStatuses[receipt.status]}</p>
      <dl className="price-summary">
        <div><dt>Mã giao dịch</dt><dd>{receipt.transactionCode}</dd></div>
        <div><dt>Mã đơn in</dt><dd>{receipt.orderCode}</dd></div>
        <div><dt>Số tiền</dt><dd>{formatMoney(receipt.amount)}</dd></div>
      </dl>
      {receipt.status === 'PendingVerify' && <p>Tiệm sẽ kiểm tra giao dịch. Bạn có thể xem trạng thái mới nhất ở mục Tra cứu đơn.</p>}
      <ContactActions message={'Mình gửi ảnh HD cho đơn ' + order.orderCode + '.'} />
    </div> : payload ? <form className="form-stack" onSubmit={confirm}>
      <div className="payment-methods" aria-label="Ngân hàng nhận tiền">
        {Object.entries(vietQrBanks).map(([code, bank]) => <span key={code} className="payment-bank" data-active={code === config.bankCode}>{bank.name}</span>)}
      </div>
      <div className="payment-grid">
        <div className="payment-qr">
          {qr.url ? <img src={qr.url} className="qr-image" alt="Mã QR chuyển khoản VietQR" /> : <p className="muted" role="status">{qr.error || 'Đang tạo mã QR…'}</p>}
        </div>
        <dl className="payment-details">
          <div><dt>Ngân hàng</dt><dd>{bankName}</dd></div>
          <div><dt>Chủ tài khoản</dt><dd>{config.bankAccountName}</dd></div>
          <div><dt>Số tài khoản</dt><dd><span className="mono">{config.bankAccountNumber}</span> <CopyButton value={config.bankAccountNumber}>Chép STK</CopyButton></dd></div>
          <div><dt>Nội dung chuyển khoản</dt><dd><span className="mono">{order.transferMemo}</span> <CopyButton value={order.transferMemo}>Chép mã</CopyButton></dd></div>
          <div><dt>Số tiền cần chuyển</dt><dd className="payment-total mono">{formatMoney(order.grandTotal)}</dd></div>
        </dl>
      </div>
      <fieldset className="form-columns" disabled={action.busy}>
        <UiverseInput label="SĐT dùng khi đặt in / Zalo" name="customerPhone" type="tel" defaultValue={phone} required maxLength={30} />
        <UiverseInput label="Ghi chú giao dịch (tùy chọn)" name="note" maxLength={500} />
      </fieldset>
      {action.error && <p className="notice notice-error" role="alert">{action.error}</p>}
      <UiverseButton type="submit" isLoading={action.busy}>Xác nhận đã chuyển khoản & Ghi nhận giao dịch</UiverseButton>
    </form> : <p className="notice">VietQR chưa khả dụng cho đơn này. Bạn có thể liên hệ tiệm để được hỗ trợ thanh toán.</p>}
  </Modal>;
}
