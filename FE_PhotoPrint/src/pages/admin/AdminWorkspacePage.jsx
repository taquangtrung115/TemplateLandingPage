import { useCallback, useState } from 'react';
import { UiverseButton, UiverseInput, UiverseToggle } from '@oneportal/uiverse-ui';
import { workspaceApi } from '../../api/workspaceApi';
import PageHeading from '../../components/common/PageHeading';
import RequestState from '../../components/common/RequestState';
import useAction from '../../hooks/useAction';
import useRequest from '../../hooks/useRequest';
import SettingsNavigation from './SettingsNavigation';

function RegistrationForm({ settings, reload }) {
  const [allowed, setAllowed] = useState(Boolean(settings?.allowSelfRegistration));
  const action = useAction();
  return <form className="panel form-stack" onSubmit={event => {
    event.preventDefault();
    action.run(async () => { await workspaceApi.configureRegistration({ allowSelfRegistration: allowed }); reload(); });
  }}>
    <UiverseToggle label="Cho phép khách tự đăng ký tài khoản" checked={allowed} onChange={setAllowed} />
    {action.error && <p role="alert" className="notice notice-error">{action.error}</p>}
    <UiverseButton type="submit" isLoading={action.busy}>Lưu</UiverseButton>
  </form>;
}

function Members() {
  const [page, setPage] = useState(1), [mode, setMode] = useState('existing');
  const load = useCallback(signal => workspaceApi.members(page, signal), [page]);
  const members = useRequest(load);
  const action = useAction();
  const rows = members.data?.items || [];

  function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    action.run(async () => {
      if (mode === 'create') await workspaceApi.createMember(data);
      else await workspaceApi.setMember({ ...data, isActive: true });
      form.reset();
      members.reload();
    });
  }
  return <div className="form-stack">
    <RequestState result={members}>
      {rows.length ? <ul className="admin-list panel">{rows.map(member => <li key={member.id ?? member.userId}>
        <div><strong>{member.fullName}</strong><p>{member.email} · {member.role}</p></div>
        <UiverseButton variant="outline" size="small" disabled={action.busy} onClick={() => action.run(async () => {
          await workspaceApi.setMember({ email: member.email, role: member.role, isActive: !member.isActive });
          members.reload();
        })}>{member.isActive ? 'Tạm khóa' : 'Kích hoạt'}</UiverseButton>
      </li>)}</ul> : <p className="notice">Chưa có thành viên.</p>}
      {(page > 1 || rows.length === 100) && <div className="action-row">
        <UiverseButton variant="outline" size="small" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</UiverseButton>
        <UiverseButton variant="outline" size="small" disabled={rows.length < 100} onClick={() => setPage(page + 1)}>Sau</UiverseButton>
      </div>}
    </RequestState>
    <form className="panel form-stack" onSubmit={submit}>
      <UiverseInput as="select" label="Thêm thành viên" value={mode} onChange={event => setMode(event.target.value)}>
        <option value="existing">Gán tài khoản đã có hoặc đổi vai trò</option><option value="create">Tạo tài khoản mới</option>
      </UiverseInput>
      <UiverseInput required label="Email" name="email" type="email" />
      {mode === 'create' && <div className="form-columns"><UiverseInput required label="Họ tên" name="fullName" /><UiverseInput required label="Mật khẩu" type="password" name="password" minLength={8} /></div>}
      <UiverseInput label="Vai trò" name="role" as="select"><option>User</option><option>Admin</option></UiverseInput>
      {action.error && <p role="alert" className="notice notice-error">{action.error}</p>}
      <UiverseButton type="submit" isLoading={action.busy}>Lưu thành viên</UiverseButton>
    </form>
  </div>;
}

function Registration() {
  const settings = useRequest(workspaceApi.registration);
  return <RequestState result={settings}><RegistrationForm settings={settings.data?.settings} reload={settings.reload} /></RequestState>;
}

export default function AdminWorkspacePage({ registration }) {
  return <><PageHeading title={registration ? 'Đăng ký tài khoản' : 'Thành viên workspace'} /><SettingsNavigation />
    {registration ? <Registration /> : <Members />}</>;
}
