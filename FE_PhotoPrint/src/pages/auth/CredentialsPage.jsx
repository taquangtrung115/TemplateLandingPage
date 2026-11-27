import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UiverseButton, UiverseInput } from '@oneportal/uiverse-ui';
import { useAuth } from '../../contexts/AuthContext';
import { workspaceApi } from '../../api/workspaceApi';
import { isDemoMode } from '../../api/axios';
import useRequest from '../../hooks/useRequest';
import useAction from '../../hooks/useAction';
import PageHeading from '../../components/common/PageHeading';
import RequestState from '../../components/common/RequestState';
import { paths } from '../../routes/paths';

const loginAvailability = () => Promise.resolve(null);

export default function CredentialsPage({ register = false }) {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const action = useAction();
  const registration = useRequest(register ? workspaceApi.registration : loginAvailability);
  const from = location.state?.from;
  const target = typeof from === 'string' && /^\/admin(?:\/|$)/.test(from) ? from : paths.admin;

  function submit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    action.run(async () => {
      if (register) { await auth.register(data); navigate(paths.home, { replace: true }); }
      else { await auth.login(data); navigate(target, { replace: true }); }
    });
  }
  function tryDemo() {
    action.run(async () => {
      await auth.login({ email: 'admin@photoprint.example', password: 'photoprint-demo' });
      navigate(target, { replace: true });
    });
  }
  return <div className="shell page-section">
    <PageHeading title={register ? 'Tạo tài khoản' : 'Đăng nhập'} />
    <div className="auth-panel">
      <RequestState result={registration}>
        {register && registration.data?.settings?.allowSelfRegistration !== true ? <p className="notice">Tiệm đang tắt tự đăng ký.</p> :
          <form className="panel form-stack" onSubmit={submit}>
            {register && <UiverseInput label="Họ và tên" name="fullName" required autoComplete="name" maxLength={120} />}
            <UiverseInput label="Email" name="email" type="email" required autoComplete="username" />
            <UiverseInput label="Mật khẩu" name="password" type="password" required minLength={register ? 8 : undefined} autoComplete={register ? 'new-password' : 'current-password'} />
            {action.error && <p className="notice notice-error" role="alert">{action.error}</p>}
            <UiverseButton type="submit" isLoading={action.busy}>{register ? 'Đăng ký' : 'Đăng nhập'}</UiverseButton>
            {isDemoMode && !register && <UiverseButton variant="outline" onClick={tryDemo} disabled={action.busy}>Vào quản trị demo</UiverseButton>}
            <Link to={register ? paths.login : paths.register} className="text-link">{register ? 'Đã có tài khoản' : 'Tạo tài khoản'}</Link>
          </form>}
      </RequestState>
    </div>
  </div>;
}
