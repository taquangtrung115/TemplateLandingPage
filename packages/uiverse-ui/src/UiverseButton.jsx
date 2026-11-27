export default function UiverseButton({ variant = 'push3d', size = 'normal', isLoading, icon, children, className = '', type = 'button', ...props }) {
  return <button type={type} {...props} className={'uv-button uv-button--' + variant + ' uv-button--' + size + ' ' + className}
    disabled={props.disabled || isLoading} aria-busy={isLoading || undefined}>
    {isLoading ? <span className="uv-spinner" aria-hidden="true" /> : icon}
    {children}
  </button>;
}
