import { UiverseLoader } from '@oneportal/uiverse-ui';

export default function RequestState({ result, children }) {
  if (result.loading) return <UiverseLoader />;
  if (result.error) return <div className="notice notice-error" role="alert">{result.error} {result.reload && <button className="text-link" type="button" onClick={result.reload}>Thử lại</button>}</div>;
  return children;
}
