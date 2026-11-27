export default function UiverseLoader({ label = 'Đang tải…' }) {
  return <p className="loading-line" role="status"><span className="uv-spinner" aria-hidden="true" />{label}</p>;
}
