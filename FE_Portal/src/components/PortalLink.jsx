import React from 'react';

export default function PortalLink({ href, navigate, ...props }) {
  function handleClick(event) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(href);
  }

  return <a {...props} href={href} onClick={handleClick} />;
}
