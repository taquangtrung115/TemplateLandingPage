import UiverseIconLabel from './UiverseIconLabel.jsx';

export default function UiverseCheckbox({ checked, onChange, label, labelIcon, priceLabel }) {
  return <label className="uv-check"><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} />
    {labelIcon ? <UiverseIconLabel icon={labelIcon}>{label}</UiverseIconLabel> : <span>{label}</span>}
    {priceLabel && <small>{priceLabel}</small>}
  </label>;
}
