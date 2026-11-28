import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import ThreeStageCanvas from '../src/components/three/ThreeStageCanvas';
import StateEditor from '../src/pages/admin/StateEditor';
import SocialConnectModal from '../src/components/social/SocialConnectModal';
import CheckoutPage from '../src/pages/CheckoutPage';
import AdminPaymentsPage from '../src/pages/admin/AdminPaymentsPage';
import { useCart } from '../src/contexts/CartContext';
import { ContactConfigProvider } from '../src/contexts/ContactConfigContext';
import { contactConfigApi } from '../src/api/contactConfigApi';
import { photoOrderApi } from '../src/api/photoOrderApi';
import { photoPaymentApi } from '../src/api/photoPaymentApi';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../src/api/contactConfigApi', () => ({ contactConfigApi: { get: vi.fn() } }));
vi.mock('../src/api/photoOrderApi', () => ({ photoOrderApi: { create: vi.fn() } }));
vi.mock('../src/api/photoPaymentApi', () => ({ photoPaymentApi: { confirm: vi.fn(), list: vi.fn(), verify: vi.fn() } }));
vi.mock('../src/contexts/CartContext', () => ({ useCart: vi.fn() }));
vi.mock('qrcode', () => ({ default: { toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,AA==') } }));

vi.mock('../src/utils/socialLinks', async importOriginal => {
  const original = await importOriginal();
  return { ...original, generateQrDataUrl: vi.fn().mockResolvedValue('data:image/png;base64,AA==') };
});

afterEach(cleanup);

describe('Photo print interactions', () => {
  it('renders the CSS studio fallback when WebGL is absent', () => {
    render(<ThreeStageCanvas options={{ model: 'framed_photo', widthCm: 10, heightCm: 15,
      frameColor: '#aa9944', src: '/assets/photo-texture.webp' }} />);
    expect(screen.getByLabelText('Xem trước ảnh 2.5D')).toBeVisible();
    expect(screen.getByAltText('Ảnh trên thành phẩm')).toHaveAttribute('src', '/assets/photo-texture.webp');
  });

  it('opens a QR modal with a safe link and the current order message', async () => {
    render(<SocialConnectModal channel="zalo" config={{ zaloEnabled: true, zaloPhoneOrOaId: '0912345678' }} message="Xác nhận PA-20261127-0001" onClose={() => {}} />);
    expect(await screen.findByAltText('Mã QR zalo')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Mở Zalo' })).toHaveAttribute('href', 'https://zalo.me/0912345678');
    expect(screen.getByText('Xác nhận PA-20261127-0001')).toBeVisible();
  });

  it('sends expectedRevision, then refreshes and blocks stale edits on a conflict', async () => {
    const update = vi.fn().mockRejectedValue(Object.assign(new Error('conflict'), { status: 409 }));
    const reload = vi.fn();
    render(<StateEditor title="PA-20261127-0001" record={{ id: '1', status: 'Pending', revision: 3 }}
      states={{ Pending: 'Đã nhận đơn', Printing: 'Đang in' }} update={update} onClose={() => {}} onConflict={reload} />);
    fireEvent.change(screen.getByLabelText('Trạng thái'), { target: { value: 'Printing' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu trạng thái' }));
    await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
    expect(update).toHaveBeenCalledWith('1', { status: 'Printing', adminNote: '', expectedRevision: 3 });
    expect(screen.getByRole('alert')).toHaveTextContent('Danh sách đã được làm mới');
    expect(screen.getByRole('button', { name: 'Lưu trạng thái' })).toBeDisabled();
  });

  it('opens VietQR after checkout and shows the transaction receipt using the server total', async () => {
    const order = { orderCode: 'PA-20261128-0001', transferMemo: 'PA202611280001 IN ANH', grandTotal: 40800, paymentStatus: 'Unpaid', canPayVietQr: true };
    contactConfigApi.get.mockResolvedValue({ vietQrEnabled: true, bankCode: 'MB', bankName: 'MB Bank', bankAccountNumber: '0000000000', bankAccountName: 'PHOTO TEST' });
    photoOrderApi.create.mockResolvedValue(order);
    photoPaymentApi.confirm.mockResolvedValue({ orderCode: order.orderCode, amount: order.grandTotal, transactionCode: 'MTP20261128ABCD', status: 'PendingVerify' });
    const cart = { items: [{ id: 'line-1', productId: 'product-1', productName: 'Ảnh thẻ', quantity: 1, photoFiles: [], lineTotal: 45000 }],
      total: 45000, comboDiscount: 0, removeOrdered: vi.fn() };
    useCart.mockReturnValue(cart);
    render(<MemoryRouter><ContactConfigProvider><CheckoutPage /></ContactConfigProvider></MemoryRouter>);
    await screen.findByRole('option', { name: 'Chuyển khoản VietQR' });
    fireEvent.change(screen.getByLabelText('Họ và tên'), { target: { value: 'Người thử' } });
    fireEvent.change(screen.getByLabelText('Số điện thoại'), { target: { value: '0904567890' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi đơn đặt in' }));
    const modal = within(await screen.findByRole('dialog', { name: 'Thanh toán VietQR' }));
    expect(await modal.findByAltText('Mã QR chuyển khoản VietQR')).toBeVisible();
    fireEvent.click(modal.getByRole('button', { name: 'Xác nhận đã chuyển khoản & Ghi nhận giao dịch' }));
    expect(await modal.findByText('MTP20261128ABCD')).toBeVisible();
    expect(photoPaymentApi.confirm).toHaveBeenCalledWith(expect.objectContaining({ amount: 40800, transferMemo: order.transferMemo, customerPhone: '0904567890' }), expect.any(AbortSignal));
  });

  it('refreshes ledger data and stops stale payment reconciliation after a conflict', async () => {
    photoPaymentApi.list.mockResolvedValue({ items: [{ id: 'payment-1', orderCode: 'PA-001', transactionCode: 'MTP-001', amount: 40800,
      status: 'PendingVerify', revision: 4, createdAtUtc: '2026-11-28T08:00:00Z' }], totalCount: 1, pageSize: 20,
      summary: { totalCount: 1, pendingCount: 1, verifiedAmount: 0 } });
    photoPaymentApi.verify.mockRejectedValue(Object.assign(new Error('Giao dịch đã được đối soát.'), { status: 409 }));
    render(<AdminPaymentsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Đánh dấu đã đối soát' }));
    const dialog = within(screen.getByRole('dialog'));
    fireEvent.click(dialog.getByRole('button', { name: 'Đánh dấu đã đối soát' }));
    expect(await dialog.findByRole('alert')).toHaveTextContent('Danh sách đã được làm mới');
    expect(dialog.getByRole('button', { name: 'Đánh dấu đã đối soát' })).toBeDisabled();
    expect(photoPaymentApi.verify).toHaveBeenCalledWith('payment-1', { status: 'Verified', expectedRevision: 4, staffNote: null }, expect.any(AbortSignal));
  });
});
