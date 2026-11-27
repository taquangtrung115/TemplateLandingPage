export default function UiverseBadge({ children, tone = 'neutral' }) {
  return <span className={'uv-badge uv-badge--' + tone}>{children}</span>;
}
