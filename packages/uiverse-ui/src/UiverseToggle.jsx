export default function UiverseToggle({ checked, onChange, label, variant = 'pill' }) {
  return <label className={'uv-switch uv-switch--' + variant}>
    <input type="checkbox" role="switch" checked={checked} onChange={event => onChange(event.target.checked)} />
    <span className="uv-switch-track" aria-hidden="true" /> {label}
  </label>;
}
