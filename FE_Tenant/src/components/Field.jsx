import React from 'react';
export default function Field({ label, ...props }) { return <label className="block text-sm font-medium"><span className="mb-1.5 block">{label}</span><input className="field" {...props} /></label>; }
