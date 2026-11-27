import React, { useEffect, useRef, useState } from 'react';
import { readEmbeddedLocation } from '../routes/portal-routes';

export default function ApplicationFrame({ app, src, onRouteChange }) {
  // #region Embedded document
  const frame = useRef(null);
  const [standaloneUrl, setStandaloneUrl] = useState(src);

  useEffect(() => {
    if (!onRouteChange || !app.origin) return;

    function handleMessage(event) {
      if (event.origin !== app.origin || event.source !== frame.current?.contentWindow || event.data?.type !== 'oneportal:navigation') return;

      const location = readEmbeddedLocation(event.data.path, app.origin, app.key);
      if (!location) return;

      setStandaloneUrl(location.url);
      onRouteChange(location);
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [app, onRouteChange]);
  // #endregion

  if (!src) return <div role="alert" className="portal-state">Chưa cấu hình địa chỉ ứng dụng {app.name}.</div>;

  return (
    <section className="portal-frame" aria-label={app.name}>
      <div className="portal-frame-toolbar">
        <a href={standaloneUrl} target="_blank" rel="noopener noreferrer">Mở {app.name} trong tab mới</a>
      </div>
      <iframe
        ref={frame}
        title={app.name}
        src={src}
        sandbox={onRouteChange
          ? 'allow-scripts allow-forms allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox'
          : 'allow-scripts allow-forms allow-same-origin'}
        referrerPolicy="strict-origin"
      />
    </section>
  );
}
