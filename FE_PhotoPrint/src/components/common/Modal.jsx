import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, wide = false, locked = false }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return <dialog ref={dialog} className={'modal' + (wide ? ' modal-wide' : '')} aria-label={title}
    onCancel={event => { event.preventDefault(); if (!locked) onClose(); }}>
    <div className="modal-header"><h2>{title}</h2>
      <button className="icon-button" aria-label="Đóng" type="button" disabled={locked} onClick={onClose}><X size={20} /></button>
    </div>
    {children}
  </dialog>;
}
