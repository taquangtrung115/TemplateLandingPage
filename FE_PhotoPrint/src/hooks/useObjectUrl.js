import { useEffect, useState } from 'react';

export default function useObjectUrl(file) {
  const [current, setCurrent] = useState(null);
  useEffect(() => {
    if (!file) { setCurrent(null); return; }
    const url = URL.createObjectURL(file);
    setCurrent({ file, url });
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return current && current.file === file ? current.url : null;
}
