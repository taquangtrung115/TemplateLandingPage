export default function UiverseCard({ as: Component = 'article', variant = 'glass', interactive, className = '', children, ...props }) {
  return <Component className={'uv-card uv-card--' + variant + (interactive ? ' uv-card--interactive ' : ' ') + className} {...props}>{children}</Component>;
}
