import React from 'react';
import { Button } from '@astryxdesign/core/Button';

// Keep callers compatible while using Astryx keyboard, focus and loading behavior.
export function ActionButton({ actionType = 'secondary', disabled = false, loading = false, isDisabled = false, isLoading = false, ...props }) {
  const variants = { primary: 'primary', secondary: 'secondary', success: 'success', danger: 'destructive' };
  return <Button {...props} variant={variants[actionType] || 'secondary'} isDisabled={disabled || isDisabled} isLoading={loading || isLoading} />;
}

export default ActionButton;
