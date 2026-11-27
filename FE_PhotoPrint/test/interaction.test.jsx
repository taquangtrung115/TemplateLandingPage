import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import ThreeStageCanvas from '../src/components/three/ThreeStageCanvas';
import StateEditor from '../src/pages/admin/StateEditor';
import SocialConnectModal from '../src/components/social/SocialConnectModal';

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
});
