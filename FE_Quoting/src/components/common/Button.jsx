import React from 'react';
import { Button as AstryxButton } from '@astryxdesign/core/Button';
import { Skeleton } from '@astryxdesign/core/Skeleton';

// Keep the action visible and disabled while its icon becomes a skeleton.
export function Button({ isLoading = false, isDisabled = false, icon, ...props }) {
  return <AstryxButton {...props} isDisabled={isDisabled || isLoading} aria-disabled={isLoading || undefined} aria-busy={isLoading || undefined}
    icon={isLoading ? <Skeleton width={18} height={18} radius={1} aria-hidden="true" /> : icon} />;
}
