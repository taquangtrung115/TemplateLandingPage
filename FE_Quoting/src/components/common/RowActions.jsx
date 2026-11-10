import React from 'react';
import { Button } from './Button';
import { DropdownMenu, DropdownMenuItem } from '@astryxdesign/core/DropdownMenu';
import { Icon } from '@astryxdesign/core/Icon';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { useMediaQuery } from '@astryxdesign/core/hooks';

export default function RowActions({ label, actions }) {
  const isCompact = useMediaQuery('(max-width: 767px)');
  const available = actions.filter(Boolean);
  const visible = available.slice(0, 2);
  const remaining = available.slice(2);
  const button = { label: `Thêm thao tác ${label}`, isIconOnly: true, variant: 'secondary', size: 'sm', icon: <Icon icon={EllipsisHorizontalIcon} size="sm" /> };
  const overflow = !remaining.length ? null : isCompact ? <DropdownMenu button={button} presentation="bottom-sheet" items={remaining.map((action) => ({
    label: action.label, icon: action.icon, onClick: action.onClick, isDisabled: action.isDisabled, variant: action.destructive ? 'destructive' : 'default',
  }))} /> : <DropdownMenu alignment="end" button={button}>
    {remaining.map((action) => <DropdownMenuItem key={action.label} label={action.label}
      icon={action.icon} onClick={action.onClick} isDisabled={action.isDisabled}
      variant={action.destructive ? 'destructive' : 'default'} />)}
  </DropdownMenu>;
  return <div className="quotation-row-actions">
    {visible.map((action) => <Button key={action.label} label={action.label} size="sm" isIconOnly={!isCompact}
      variant={action.destructive ? 'destructive' : 'secondary'} icon={<Icon icon={action.icon} size="sm" />}
      onClick={action.onClick} isDisabled={action.isDisabled} />)}
    {overflow}
  </div>;
}
