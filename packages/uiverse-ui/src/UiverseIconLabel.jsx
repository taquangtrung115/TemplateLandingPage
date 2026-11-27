export default function UiverseIconLabel({ icon: Icon, children }) {
  return (
    <span className="uv-icon-label">
      <Icon aria-hidden="true" focusable="false" />
      <span>{children}</span>
    </span>
  );
}
