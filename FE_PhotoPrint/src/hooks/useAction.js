import { useEffect, useRef, useState } from 'react';

export default function useAction() {
  const active = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => () => active.current?.abort(), []);
  async function run(action) {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    setBusy(true);
    setError('');
    try { return await action(controller.signal); }
    catch (failure) {
      if (!controller.signal.aborted && failure.code !== 'ERR_CANCELED') setError(failure.message);
    } finally {
      active.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  return { busy, error, setError, run };
}
