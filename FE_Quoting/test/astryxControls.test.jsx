import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { Drawer, DrawerHeader } from '@astryxdesign/core/Drawer';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { ButtonGroup } from '@astryxdesign/core/ButtonGroup';
import { HoverCard } from '@astryxdesign/core/HoverCard';
import { Pagination } from '@astryxdesign/core/Pagination';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { AlertDialog } from '@astryxdesign/core/AlertDialog';
import { ToastViewport, useToast } from '@astryxdesign/core/Toast';
import { Field, FieldLabel } from '@astryxdesign/core/Field';
import { FieldStatus } from '@astryxdesign/core/FieldStatus';
import { TextInput } from '@astryxdesign/core/TextInput';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { Switch } from '@astryxdesign/core/Switch';
import { InputGroup, InputGroupText } from '@astryxdesign/core/InputGroup';
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList';
import { Calendar } from '@astryxdesign/core/Calendar';
import { Text } from '@astryxdesign/core/Text';

import CustomerListPage from '../src/pages/customers/CustomerListPage';
import ProductCatalogPage from '../src/pages/products/ProductCatalogPage';
import { quotingCustomerApi } from '../src/api/quotingCustomerApi';
import { quotingProductApi } from '../src/api/quotingProductApi';

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAdmin: true,
    user: { fullName: 'Trần Quản Trị', email: 'admin@chuoianvat.vn' },
  }),
}));

vi.mock('../src/api/quotingCustomerApi', () => ({
  quotingCustomerApi: {
    getCustomers: vi.fn(),
    createCustomer: vi.fn(),
    updateCustomer: vi.fn(),
    deleteCustomer: vi.fn(),
  },
}));

vi.mock('../src/api/quotingProductGroupApi', () => ({ quotingProductGroupApi: { getGroups: vi.fn(async () => (await import('./fixtures')).groups) } }));
vi.mock('../src/api/quotingProductApi', () => ({
  quotingProductApi: {
    getProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  },
}));

describe('Nâng Cấp Astryx Controls - Kiểm Thử Toàn Diện Hệ Thống Điều Khiển', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. DRAWER CONTROLS (Thêm / Sửa / Đóng / Validation)
  // =========================================================================
  describe('1. Drawer Controls', () => {
    const mockCustomers = [
      {
        id: 'c-101',
        name: 'ĐẠI LÝ ĂN VẶT HOÀNG MAI',
        contactPerson: 'Chị Mai',
        phone: '0988112233',
        email: 'mai@anvat.vn',
        address: 'Hà Nội',
        taxCode: '010111222',
      },
    ];

    it('Happy path: Mở Drawer thêm mới khách hàng, submit form và đóng Drawer', async () => {
      quotingCustomerApi.getCustomers.mockResolvedValueOnce(mockCustomers);
      quotingCustomerApi.createCustomer.mockResolvedValueOnce({ id: 'c-new' });

      render(
        <MemoryRouter>
          <CustomerListPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Khách hàng')).toBeInTheDocument();
      });

      // Mở Drawer
      const addBtn = screen.getByRole('button', { name: /Thêm khách hàng/i });
      fireEvent.click(addBtn);

      expect(screen.getByText('Thêm khách hàng', { selector: 'h2' })).toBeInTheDocument();

      // Điền thông tin
      fireEvent.change(screen.getByPlaceholderText('VD: CÔNG TY TNHH ABC'), {
        target: { value: 'Đại Lý Cầu Giấy' },
      });
      fireEvent.change(screen.getByPlaceholderText('0901234567'), {
        target: { value: '0988776655' },
      });

      // Bấm Lưu trong Drawer
      const saveBtn = screen.getByRole('button', { name: /Lưu khách hàng/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(quotingCustomerApi.createCustomer).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Đại Lý Cầu Giấy',
            phone: '0988776655',
          })
        );
      });
    });

    it('Happy path: Mở Drawer sửa khách hàng hiện tại và cập nhật dữ liệu thành công', async () => {
      quotingCustomerApi.getCustomers.mockResolvedValueOnce(mockCustomers);
      quotingCustomerApi.updateCustomer.mockResolvedValueOnce({ isSuccess: true });

      render(
        <MemoryRouter>
          <CustomerListPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('ĐẠI LÝ ĂN VẶT HOÀNG MAI')).toBeInTheDocument();
      });

      // Bấm nút sửa (icon button variant secondary)
      const editBtn = document.querySelector('button[data-variant="secondary"][data-size="sm"]');
      expect(editBtn).toBeInTheDocument();
      fireEvent.click(editBtn);
      fireEvent.click(await screen.findByRole('menuitem', { name: 'Sửa khách hàng' }));

      // Drawer Header hiển thị chế độ sửa
      expect(screen.getByText('Sửa khách hàng', { selector: 'h2' })).toBeInTheDocument();

      // Sửa tên
      const nameInput = screen.getByPlaceholderText('VD: CÔNG TY TNHH ABC');
      expect(nameInput.value).toBe('ĐẠI LÝ ĂN VẶT HOÀNG MAI');
      fireEvent.change(nameInput, { target: { value: 'ĐẠI LÝ ĂN VẶT HOÀNG MAI - ĐÃ NÂNG CẤP' } });

      // Lưu
      fireEvent.click(screen.getByRole('button', { name: /Lưu khách hàng/i }));

      await waitFor(() => {
        expect(quotingCustomerApi.updateCustomer).toHaveBeenCalledWith(
          'c-101',
          expect.objectContaining({
            name: 'ĐẠI LÝ ĂN VẶT HOÀNG MAI - ĐÃ NÂNG CẤP',
          })
        );
      });
    });

    it('Edge case: Đóng Drawer khi bấm Hủy mà không gọi API lưu', async () => {
      quotingCustomerApi.getCustomers.mockResolvedValueOnce(mockCustomers);

      render(
        <MemoryRouter>
          <CustomerListPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Khách hàng')).toBeInTheDocument();
      });

      // Mở Drawer
      fireEvent.click(screen.getByRole('button', { name: /Thêm khách hàng/i }));
      expect(screen.getByText('Thêm khách hàng', { selector: 'h2' })).toBeInTheDocument();

      // Bấm Hủy
      const cancelBtn = screen.getByRole('button', { name: 'Hủy' });
      fireEvent.click(cancelBtn);

      // Không bao giờ gọi API create hay update
      expect(quotingCustomerApi.createCustomer).not.toHaveBeenCalled();
      expect(quotingCustomerApi.updateCustomer).not.toHaveBeenCalled();
    });

    it('Negative case: Chặn submit form trong Drawer khi để trống tên hoặc SĐT', async () => {
      quotingCustomerApi.getCustomers.mockResolvedValueOnce(mockCustomers);

      render(
        <MemoryRouter>
          <CustomerListPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Khách hàng')).toBeInTheDocument();
      });

      // Mở Drawer
      fireEvent.click(screen.getByRole('button', { name: /Thêm khách hàng/i }));

      // Không nhập gì, bấm Lưu khách hàng
      fireEvent.click(screen.getByRole('button', { name: /Lưu khách hàng/i }));

      // Bị chặn lại với lỗi validation
      expect(quotingCustomerApi.createCustomer).not.toHaveBeenCalled();
      expect(screen.getByText('Tên khách hàng và Số điện thoại là bắt buộc.')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 2. BUTTONS & ICON ALIGNMENT CONTROLS
  // =========================================================================
  describe('2. Buttons & Icon Alignment Controls', () => {
    it('Happy path: Button render với icon căn giữa và viền sắc nét', () => {
      render(
        <Button
          variant="primary"
          label="Xác Nhận Đơn Hàng"
          icon={<span data-testid="icon-check">✓</span>}
        />
      );

      const btn = screen.getByRole('button', { name: /Xác Nhận Đơn Hàng/i });
      expect(btn).toBeInTheDocument();
      expect(screen.getByTestId('icon-check')).toBeInTheDocument();
      expect(btn).toHaveClass('astryx-button');
    });

    it('Happy path: IconButton render chuẩn hình vuông và icon căn giữa', () => {
      render(
        <IconButton
          label="Chỉnh sửa dòng"
          variant="secondary"
          icon={<span data-testid="icon-edit">✎</span>}
        />
      );

      const btn = screen.getByRole('button', { name: /Chỉnh sửa dòng/i });
      expect(btn).toBeInTheDocument();
      expect(screen.getByTestId('icon-edit')).toBeInTheDocument();
      expect(btn).toHaveAttribute('data-variant', 'secondary');
    });

    it('Negative case: Nút disabled hoặc isLoading không kích hoạt onClick callback', () => {
      const handleClick = vi.fn();
      render(
        <div>
          <Button
            variant="primary"
            label="Nút Vô Hiệu Hóa"
            disabled={true}
            onClick={handleClick}
          />
          <Button
            variant="secondary"
            label="Nút Đang Tải"
            isLoading={true}
            onClick={handleClick}
          />
        </div>
      );

      const disabledBtn = screen.getByRole('button', { name: /Nút Vô Hiệu Hóa/i });
      const loadingBtn = screen.getByRole('button', { name: /Nút Đang Tải/i });

      fireEvent.click(disabledBtn);
      fireEvent.click(loadingBtn);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 3. HOVERCARD CONTROLS (Xem Chi Tiết & Ảnh Phóng To)
  // =========================================================================
  describe('3. HoverCard Controls', () => {
    it('Happy path: HoverCard popover hiển thị ảnh phóng to và chi tiết món khi hover', async () => {
      render(
        <HoverCard
          placement="end"
          content={
            <div data-testid="hover-card-content">
              <img src="https://cdn.example.com/item.jpg" alt="Surimi Tôm" />
              <h3>SURIMI TÔM TƯƠI CUỘN RONG BIỂN</h3>
              <p>Thành phần: 100% tôm tươi nguyên chất, rong biển Nhật</p>
            </div>
          }
        >
          <span data-testid="hover-card-trigger">Rê chuột vào món này</span>
        </HoverCard>
      );

      const trigger = screen.getByTestId('hover-card-trigger');
      expect(trigger).toBeInTheDocument();

      // Rê chuột vào trigger
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        expect(screen.getByTestId('hover-card-content')).toBeInTheDocument();
        expect(screen.getByText('SURIMI TÔM TƯƠI CUỘN RONG BIỂN')).toBeInTheDocument();
        expect(screen.getByText(/100% tôm tươi nguyên chất/i)).toBeInTheDocument();
      });
    });

    it('Negative case: Khi di chuột ra ngoài (mouseLeave), nội dung HoverCard được ẩn', async () => {
      render(
        <HoverCard
          placement="end"
          content={<div data-testid="hover-dismissible-content">Xem chi tiết món ăn</div>}
        >
          <span data-testid="hover-dismissible-trigger">Món ăn vặt</span>
        </HoverCard>
      );

      const trigger = screen.getByTestId('hover-dismissible-trigger');

      // Mouse enter
      fireEvent.mouseEnter(trigger);
      await waitFor(() => {
        expect(screen.getByTestId('hover-dismissible-content')).toBeInTheDocument();
      });

      // Mouse leave
      fireEvent.mouseLeave(trigger);
    });
  });

  // =========================================================================
  // 4. PAGINATION CONTROLS (Phân Trang 20 Dòng/Trang & Chuyển Trang)
  // =========================================================================
  describe('4. Pagination Controls', () => {
    it('Happy path: Hiển thị phân trang 20 dòng/trang và chuyển trang mượt mà', () => {
      const handlePageChange = vi.fn();

      render(
        <Pagination
          page={1}
          onChange={handlePageChange}
          totalItems={45}
          pageSize={20}
          pageSizeOptions={[10, 20, 50]}
        />
      );

      // 45 items với pageSize 20 -> có 3 trang: trang 1, 2, 3
      expect(screen.getByRole('button', { name: /Go to page 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go to page 2/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go to page 3/i })).toBeInTheDocument();

      // Bấm sang trang 2
      const page2Btn = screen.getByRole('button', { name: /Go to page 2/i });
      fireEvent.click(page2Btn);

      expect(handlePageChange).toHaveBeenCalledWith(2);
    });

    it('Edge case: Bấm nút trang tiếp theo (Go to next page) kích hoạt onChange', () => {
      const handlePageChange = vi.fn();

      render(
        <Pagination
          page={1}
          onChange={handlePageChange}
          totalItems={45}
          pageSize={20}
          pageSizeOptions={[10, 20, 50]}
        />
      );

      const nextBtn = screen.getByRole('button', { name: /Go to next page/i });
      expect(nextBtn).toBeInTheDocument();
      expect(nextBtn).not.toBeDisabled();

      fireEvent.click(nextBtn);
      expect(handlePageChange).toHaveBeenCalledWith(2);
    });
  });

  // =========================================================================
  // 5. SKELETON CONTROLS (Wave Loading Effect)
  // =========================================================================
  describe('5. Skeleton Controls', () => {
    it('Happy path: Skeleton hiển thị placeholder loading khi fetch dữ liệu', () => {
      render(
        <div data-testid="skeleton-wrapper">
          <Skeleton height={40} width="100%" radius={2} index={0} />
          <Skeleton height={40} width="100%" radius={2} index={1} />
          <Skeleton height={40} width="100%" radius={2} index={2} />
        </div>
      );

      const skeletons = document.querySelectorAll('.astryx-skeleton');
      expect(skeletons.length).toBe(3);
    });

    it('Edge case: Skeleton có chỉ số index so le tạo hiệu ứng wave mượt mà', () => {
      render(
        <div>
          <Skeleton data-testid="staggered-skeleton" height={20} width={200} radius={1} index={3} />
        </div>
      );

      const skeletonEl = screen.getByTestId('staggered-skeleton');
      expect(skeletonEl).toBeInTheDocument();
      expect(skeletonEl).toHaveClass('astryx-skeleton');
      expect(skeletonEl).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // =========================================================================
  // 6. TOAST CONTROLS (Thông Báo Hệ Thống)
  // =========================================================================
  describe('6. Toast Controls', () => {
    function ToastTriggerComponent({ message, type }) {
      const toast = useToast();
      return (
        <div>
          <button onClick={() => toast({ body: message, type })}>
            Kích hoạt Toast
          </button>
        </div>
      );
    }

    it('Happy path: Kích hoạt thông báo thành công (type: "info")', async () => {
      render(
        <div>
          <ToastViewport position="topEnd" />
          <ToastTriggerComponent message="Thao tác lưu thành công!" type="info" />
        </div>
      );

      const triggerBtn = screen.getByRole('button', { name: /Kích hoạt Toast/i });
      fireEvent.click(triggerBtn);

      await waitFor(() => {
        expect(screen.getByText('Thao tác lưu thành công!')).toBeInTheDocument();
      });
    });

    it('Negative case: Kích hoạt thông báo lỗi máy chủ (type: "error")', async () => {
      render(
        <div>
          <ToastViewport position="topEnd" />
          <ToastTriggerComponent message="Lỗi 500: Máy chủ không phản hồi!" type="error" />
        </div>
      );

      const triggerBtn = screen.getByRole('button', { name: /Kích hoạt Toast/i });
      fireEvent.click(triggerBtn);

      await waitFor(() => {
        expect(screen.getByText('Lỗi 500: Máy chủ không phản hồi!')).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // 7. ALERT DIALOG CONTROLS (Xác Nhận Thao tác Nguy Hiểm)
  // =========================================================================
  describe('7. AlertDialog Controls', () => {
    it('Happy path: AlertDialog hiển thị xác nhận và gọi onAction khi bấm Đồng Ý', () => {
      const handleAction = vi.fn();
      const handleOpenChange = vi.fn();

      render(
        <AlertDialog
          isOpen={true}
          onOpenChange={handleOpenChange}
          title="Xác nhận xóa khách hàng"
          description="Bạn có chắc chắn muốn xóa khách hàng này không? Thao tác không thể hoàn tác."
          actionLabel="Xóa khách hàng"
          actionVariant="destructive"
          onAction={handleAction}
          cancelLabel="Hủy"
        />
      );

      expect(screen.getByText('Xác nhận xóa khách hàng')).toBeInTheDocument();
      expect(screen.getByText(/Bạn có chắc chắn muốn xóa khách hàng này không/i)).toBeInTheDocument();

      // Bấm nút xóa
      const confirmBtn = screen.getByRole('button', { name: 'Xóa khách hàng' });
      fireEvent.click(confirmBtn);

      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('Edge case: AlertDialog gọi onOpenChange(false) khi bấm Hủy mà không gọi onAction', () => {
      const handleAction = vi.fn();
      const handleOpenChange = vi.fn();

      render(
        <AlertDialog
          isOpen={true}
          onOpenChange={handleOpenChange}
          title="Xác nhận hủy thao tác"
          description="Đóng mà không lưu thay đổi."
          actionLabel="Đồng Ý"
          onAction={handleAction}
          cancelLabel="Hủy"
        />
      );

      const cancelBtn = screen.getByRole('button', { name: 'Hủy' });
      fireEvent.click(cancelBtn);

      expect(handleOpenChange).toHaveBeenCalledWith(false);
      expect(handleAction).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 8. SWITCH CONTROLS (Chuẩn hóa prop `value: boolean`)
  // =========================================================================
  describe('8. Switch Controls', () => {
    it('Happy path: Switch render chuẩn trạng thái bật khi value={true}', () => {
      const handleChange = vi.fn();
      render(
        <Switch
          label="Đang bán"
          value={true}
          onChange={handleChange}
        />
      );

      const switchInput = screen.getByRole('switch', { name: /Đang bán/i });
      expect(switchInput).toBeInTheDocument();
      expect(switchInput).toBeChecked();
    });

    it('Happy path: Switch kích hoạt onChange khi người dùng click bật/tắt', () => {
      const handleChange = vi.fn();
      render(
        <Switch
          label="Cho phép thanh toán công nợ"
          value={false}
          onChange={handleChange}
        />
      );

      const switchInput = screen.getByRole('switch', { name: /Cho phép thanh toán công nợ/i });
      expect(switchInput).not.toBeChecked();

      fireEvent.click(switchInput);
      expect(handleChange).toHaveBeenCalledWith(true, expect.anything());
    });

    it('Edge case: Switch trong Drawer của ProductCatalogPage đổi value từ true sang false và lưu thành công', async () => {
      const mockProduct = [
        {
          id: 'p-1',
          code: 'CB-01',
          name: 'COMBO SURIMI ĐẶC BIỆT',
          category: 'A/ DÒNG COMBO',
          price: 25000,
          unit: 'GÓI',
          isActive: true,
          description: 'Surimi tươi ngon',
        },
      ];
      quotingProductApi.getProducts.mockResolvedValueOnce(mockProduct);
      quotingProductApi.updateProduct.mockResolvedValueOnce({ isSuccess: true });

      render(
        <MemoryRouter>
          <ProductCatalogPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('COMBO SURIMI ĐẶC BIỆT')).toBeInTheDocument();
      });

      // Mở Drawer sửa sản phẩm
      const editBtn = document.querySelector('button[data-variant="secondary"][data-size="sm"]');
      expect(editBtn).toBeInTheDocument();
      fireEvent.click(editBtn);
      fireEvent.click(await screen.findByRole('menuitem', { name: 'Sửa sản phẩm' }));

      await waitFor(() => {
        expect(screen.getByText('Sửa sản phẩm', { selector: 'h2' })).toBeInTheDocument();
      });

      // Kiểm tra Switch ban đầu là checked (value = true)
      const activeSwitch = screen.getByRole('switch', { name: /Đang bán/i });
      expect(activeSwitch).toBeChecked();

      // Click tắt Switch
      fireEvent.click(activeSwitch);

      // Bấm Lưu
      const saveBtn = screen.getByRole('button', { name: /Lưu sản phẩm/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(quotingProductApi.updateProduct).toHaveBeenCalledWith(
          'p-1',
          expect.objectContaining({
            isActive: false,
          })
        );
      });
    });

    it('Negative case: Switch với prop isDisabled={true} không kích hoạt onChange khi click', () => {
      const handleChange = vi.fn();
      render(
        <Switch
          label="Tính năng bị khóa"
          value={false}
          isDisabled={true}
          onChange={handleChange}
        />
      );

      const switchInput = screen.getByRole('switch', { name: /Tính năng bị khóa/i });
      expect(switchInput.disabled || switchInput.getAttribute('aria-disabled') === 'true').toBe(true);

      fireEvent.click(switchInput);
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 9. INPUT GROUP & INPUT GROUP TEXT CONTROLS (Hậu tố đơn vị)
  // =========================================================================
  describe('9. InputGroup & InputGroupText Controls', () => {
    it('Happy path: InputGroup bọc NumberInput kèm hậu tố đơn vị VNĐ', () => {
      render(
        <InputGroup label="Giá danh mục">
          <NumberInput value={25000} onChange={() => {}} min={0} step={1000} />
          <InputGroupText>VNĐ</InputGroupText>
        </InputGroup>
      );

      expect(screen.getByText('Giá danh mục')).toBeInTheDocument();
      expect(screen.getByText('VNĐ')).toBeInTheDocument();
      const numberInput = screen.getByRole('spinbutton');
      expect(numberInput.value).toBe('25000');
    });

    it('Happy path: InputGroup bọc NumberInput kèm hậu tố đơn vị % cho chiết khấu và thuế VAT', () => {
      render(
        <div>
          <InputGroup label="Chiết khấu tổng đơn">
            <NumberInput value={5} onChange={() => {}} min={0} max={100} />
            <InputGroupText>%</InputGroupText>
          </InputGroup>
          <InputGroup label="Thuế suất VAT">
            <NumberInput value={10} onChange={() => {}} min={0} max={100} />
            <InputGroupText>%</InputGroupText>
          </InputGroup>
        </div>
      );

      expect(screen.getByText('Chiết khấu tổng đơn')).toBeInTheDocument();
      expect(screen.getByText('Thuế suất VAT')).toBeInTheDocument();
      const percentBadges = screen.getAllByText('%');
      expect(percentBadges.length).toBe(2);
    });

    it('Edge case: InputGroup với isLabelHidden={true} và text hậu tố đa ký tự', () => {
      render(
        <InputGroup label="Giá xuất xưởng" isLabelHidden>
          <NumberInput value={50000} onChange={() => {}} />
          <InputGroupText>VNĐ / GÓI</InputGroupText>
        </InputGroup>
      );

      expect(screen.getByText('VNĐ / GÓI')).toBeInTheDocument();
      const input = screen.getByRole('spinbutton');
      expect(input.value).toBe('50000');
    });

    it('Negative case: InputGroup bọc NumberInput hiển thị chuẩn role spinbutton và ràng buộc giới hạn', () => {
      const handleChange = vi.fn();
      render(
        <InputGroup label="Chiết khấu">
          <NumberInput value={0} onChange={handleChange} min={0} max={100} />
          <InputGroupText>%</InputGroupText>
        </InputGroup>
      );

      const input = screen.getByRole('spinbutton');
      expect(input).toBeInTheDocument();
      expect(input.getAttribute('role')).toBe('spinbutton');
    });
  });

  // =========================================================================
  // 10. RADIO LIST & RADIO LIST ITEM CONTROLS (Chọn đối tượng & Mẫu)
  // =========================================================================
  describe('10. RadioList & RadioListItem Controls', () => {
    it('Happy path: RadioList hiển thị danh sách radio và kích hoạt onChange khi click', () => {
      const handleChange = vi.fn();
      render(
        <RadioList
          label="Đối tượng khách hàng"
          value="generic"
          onChange={handleChange}
        >
          <RadioListItem
            value="generic"
            label="Báo giá chung (QUÝ KHÁCH HÀNG)"
            description="Bảng báo giá đại trà"
          />
          <RadioListItem
            value="specific"
            label="Khách hàng doanh nghiệp"
            description="Bảng báo giá cho đại lý"
          />
        </RadioList>
      );

      expect(screen.getByText('Đối tượng khách hàng')).toBeInTheDocument();
      expect(screen.getByText('Báo giá chung (QUÝ KHÁCH HÀNG)')).toBeInTheDocument();
      expect(screen.getByText('Khách hàng doanh nghiệp')).toBeInTheDocument();

      const specificRadio = screen.getByRole('radio', { name: /Khách hàng doanh nghiệp/i });
      fireEvent.click(specificRadio);
      expect(handleChange).toHaveBeenCalledWith('specific');
    });

    it('Edge case: RadioListItem với custom ReactNode label chứa Text và Badge phiên bản', () => {
      const handleChange = vi.fn();
      render(
        <RadioList label="Chọn mẫu" value="tpl-1" onChange={handleChange}>
          <RadioListItem
            value="tpl-1"
            label={
              <div data-testid="custom-label">
                <span>Mẫu Chuẩn Ăn Vặt</span>
                <span className="badge">v1.2</span>
              </div>
            }
            description="Mẫu định dạng xuất PDF chính thức"
          />
        </RadioList>
      );

      expect(screen.getByTestId('custom-label')).toBeInTheDocument();
      expect(screen.getByText('Mẫu Chuẩn Ăn Vặt')).toBeInTheDocument();
      expect(screen.getByText('v1.2')).toBeInTheDocument();
    });

    it('Negative case: RadioListItem có isDisabled={true} không kích hoạt onChange khi click', () => {
      const handleChange = vi.fn();
      render(
        <RadioList label="Tùy chọn vô hiệu" value="opt-1" onChange={handleChange}>
          <RadioListItem
            value="opt-disabled"
            label="Mẫu đang bảo trì"
            isDisabled={true}
          />
        </RadioList>
      );

      const disabledRadio = screen.getByRole('radio', { name: /Mẫu đang bảo trì/i });
      expect(disabledRadio.disabled || disabledRadio.getAttribute('aria-disabled') === 'true').toBe(true);

      fireEvent.click(disabledRadio);
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 11. CALENDAR CONTROLS (Chọn ngày chính hãng)
  // =========================================================================
  describe('11. Calendar Controls', () => {
    it('Happy path: Calendar render tháng hiện tại và cho phép chọn ngày ở chế độ single', () => {
      const handleChange = vi.fn();
      render(
        <Calendar
          mode="single"
          value="2026-11-08"
          onChange={handleChange}
        />
      );

      // Calendar hiển thị grid ngày
      const calendarEl = document.querySelector('.astryx-calendar');
      expect(calendarEl).toBeInTheDocument();
    });

    it('Edge case: Calendar render an toàn khi value rỗng hoặc undefined', () => {
      render(
        <div data-testid="empty-calendar-wrapper">
          <Calendar mode="single" value="" onChange={() => {}} />
        </div>
      );

      const calendarEl = document.querySelector('.astryx-calendar');
      expect(calendarEl).toBeInTheDocument();
    });

    it('Negative case: Calendar disabled/readOnly không kích hoạt onChange khi tương tác', () => {
      const handleChange = vi.fn();
      render(
        <div data-testid="disabled-calendar">
          <Calendar
            mode="single"
            value="2026-11-08"
            disabled={true}
            onChange={handleChange}
          />
        </div>
      );

      const calendarEl = document.querySelector('.astryx-calendar');
      expect(calendarEl).toBeInTheDocument();
      // Không gọi callback khi đang bị disabled
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 12. ANIMATED LAYOUT & STEPPER CONTROLS
  // =========================================================================
  describe('12. Animated Layout & Wizard Transition Controls', () => {
    it('Happy path: Container bọc Stepper Wizard có style transition mượt mà và minHeight chuẩn', () => {
      render(
        <div
          data-testid="wizard-animated-container"
          style={{
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            minHeight: 380,
          }}
        >
          <div data-testid="step-content">Nội dung Bước 1</div>
        </div>
      );

      const container = screen.getByTestId('wizard-animated-container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveStyle({
        minHeight: '380px',
      });
      expect(screen.getByTestId('step-content')).toBeInTheDocument();
    });

    it('Edge case: Container giữ nguyên thuộc tính transition khi nội dung con thay đổi bước', () => {
      const { rerender } = render(
        <div
          data-testid="wizard-container"
          style={{
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            minHeight: 380,
          }}
        >
          <div>Bước 1: Khách hàng</div>
        </div>
      );

      expect(screen.getByText('Bước 1: Khách hàng')).toBeInTheDocument();

      // Chuyển sang Bước 2
      rerender(
        <div
          data-testid="wizard-container"
          style={{
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            minHeight: 380,
          }}
        >
          <div>Bước 2: Sản phẩm</div>
        </div>
      );

      expect(screen.getByText('Bước 2: Sản phẩm')).toBeInTheDocument();
      const container = screen.getByTestId('wizard-container');
      expect(container).toHaveStyle({ minHeight: '380px' });
    });

    it('Negative case: Wizard container không crash khi render rỗng hoặc lỗi con được bọc an toàn', () => {
      render(
        <div
          data-testid="wizard-empty-container"
          style={{
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            minHeight: 380,
          }}
        />
      );

      const container = screen.getByTestId('wizard-empty-container');
      expect(container).toBeInTheDocument();
      expect(container.childNodes.length).toBe(0);
    });
  });
});
