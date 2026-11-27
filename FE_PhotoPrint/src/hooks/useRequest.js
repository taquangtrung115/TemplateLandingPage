import { useEffect, useState } from 'react';

export default function useRequest(load) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ data: null, error: '', loading: true });
  useEffect(() => {
    const controller = new AbortController();
    setResult({ data: null, error: '', loading: true });
    Promise.resolve().then(() => load(controller.signal)).then(data => {
      if (!controller.signal.aborted) setResult({ data, error: '', loading: false });
    }).catch(error => {
      if (!controller.signal.aborted) setResult({ data: null, error: error.message, loading: false });
    });
    return () => controller.abort();
  }, [load, attempt]);
  return { ...result, reload: () => setAttempt(count => count + 1) };
}
