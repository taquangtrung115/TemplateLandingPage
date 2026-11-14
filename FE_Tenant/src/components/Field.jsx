import React, { useId } from 'react';
export default function Field({ label, hint, ...props }) {
  const id = useId(), hintId = id + '-hint';
  return <div className="field-label"><label htmlFor={id}>{label}</label><input id={id} className="portal-field" aria-describedby={hint ? hintId : undefined} {...props}/>{hint && <span className="field-hint" id={hintId}>{hint}</span>}</div>;
}
