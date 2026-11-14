import { useEffect, useState } from 'react';
import { authApi } from '../api/authApi';
export default function useRegistrationSettings() {
  const [settings, setSettings] = useState(null), [error, setError] = useState(''), [loading, setLoading] = useState(true), [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError('');
    authApi.registration(controller.signal).then(value => { if (!controller.signal.aborted) setSettings(value); })
      .catch(error => { if (!controller.signal.aborted) setError(error.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);
  return { settings, setSettings, error, loading, reload: () => setRevision(value => value + 1) };
}
