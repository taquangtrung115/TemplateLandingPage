import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, id, wide = false, locked = false }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement;
    element.showModal();
    return () => {
      element.close();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);
  return <dialog ref={dialog} id={id} className={'modal uv-modal-motion' + (wide ? ' modal-wide' : '')} aria-label={title}
    onCancel={event => { event.preventDefault(); if (!locked) onClose(); }}>
    <div className="modal-header"><h2>{title}</h2>
      <button className="icon-button" aria-label="Đóng" type="button" disabled={locked} onClick={onClose}><X size={20} /></button>
    </div>
    {children}
  </dialog>;
}
