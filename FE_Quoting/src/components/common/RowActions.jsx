import React from 'react';
import { DropdownMenu, DropdownMenuItem } from '@astryxdesign/core/DropdownMenu';
import { Icon } from '@astryxdesign/core/Icon';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { useMediaQuery } from '@astryxdesign/core/hooks';

export default function RowActions({ label, actions }) {
  const isCompact = useMediaQuery('(max-width: 1023px)');
  const button = { label: `Thao tác ${label}`, isIconOnly: true, variant: 'secondary', size: 'sm', icon: <Icon icon={EllipsisHorizontalIcon} size="sm" /> };
  if (isCompact) return <DropdownMenu button={button} presentation="bottom-sheet" items={actions.filter(Boolean).map((action) => ({
    label: action.label, icon: action.icon, onClick: action.onClick, isDisabled: action.isDisabled, variant: action.destructive ? 'destructive' : 'default',
  }))} />;
  return <DropdownMenu alignment="end" button={button}>
    {actions.filter(Boolean).map((action) => <DropdownMenuItem key={action.label} label={action.label}
      icon={action.icon} onClick={action.onClick} isDisabled={action.isDisabled}
      variant={action.destructive ? 'destructive' : 'default'} />)}
  </DropdownMenu>;
}
