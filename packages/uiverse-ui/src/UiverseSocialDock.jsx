import { useState } from 'react';

export default function UiverseSocialDock({ label, trigger, children, className = '' }) {
  const [open, setOpen] = useState(false);
  return <aside className={'uv-dock ' + className} aria-label={label}>
    {open && <div className="uv-dock-options">{children}</div>}
    <button type="button" className="uv-button uv-button--push3d" aria-expanded={open} onClick={() => setOpen(value => !value)}>
      {trigger}
    </button>
  </aside>;
}
