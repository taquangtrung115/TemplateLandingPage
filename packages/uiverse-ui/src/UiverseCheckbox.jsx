export default function UiverseCheckbox({ checked, onChange, label, priceLabel }) {
  return <label className="uv-check"><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} />
    <span>{label}</span>{priceLabel && <small>{priceLabel}</small>}
  </label>;
}
