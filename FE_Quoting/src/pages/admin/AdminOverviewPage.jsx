import React from 'react';
import { Link } from 'react-router-dom';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
const actions = [
  ['/admin/members', 'Thành viên', 'Tạo tài khoản, cấp quyền và quản lý vai trò trong Quoting.'],
  ['/admin/registration', 'Đăng ký tài khoản', 'Mở hoặc đóng tự đăng ký cho workspace hiện tại.'],
  ['/admin/products', 'Sản phẩm', 'Quản lý danh mục, nhóm sản phẩm và đơn giá.'],
  ['/admin/customers', 'Khách hàng', 'Cập nhật thông tin khách hàng của công ty.'],
  ['/admin/templates', 'Mẫu báo giá', 'Quản lý các mẫu được dùng khi lập báo giá.'],
  ['/admin/support', 'Xử lý hỗ trợ', 'Tiếp nhận và xử lý yêu cầu từ người dùng.'],
];
export default function AdminOverviewPage() {
  return <section className="admin-page"><Heading level={1}>Quản trị Quoting</Heading><Text color="secondary">Cấu hình và quyền truy cập chỉ áp dụng trong workspace hiện tại.</Text>
    <div className="admin-actions">{actions.map(([path, title, description]) => <Card key={path} padding={5}><Link className="auth-link" to={path}>{title}</Link><p>{description}</p></Card>)}</div>
  </section>;
}
