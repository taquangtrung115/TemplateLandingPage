import { useId } from 'react';
import UiverseIconLabel from './UiverseIconLabel.jsx';

export default function UiverseInput({ label, labelIcon, error, children, as: Component = 'input', ...props }) {
  const id = useId();
  const inputId = props.id || id;
  return <div className="uv-field">
    <label htmlFor={inputId} data-required={props.required || undefined}>
      {labelIcon ? <UiverseIconLabel icon={labelIcon}>{label}</UiverseIconLabel> : label}
    </label>
    {Component === 'input'
      ? <input {...props} id={inputId} aria-invalid={Boolean(error)} aria-describedby={error ? id + '-error' : props['aria-describedby']} />
      : <Component {...props} id={inputId} aria-invalid={Boolean(error)} aria-describedby={error ? id + '-error' : props['aria-describedby']}>{children}</Component>}
    {error && <small id={id + '-error'} className="error-text">{error}</small>}
  </div>;
}
