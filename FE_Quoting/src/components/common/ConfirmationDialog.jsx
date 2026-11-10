import React, { useId } from 'react';
import { Dialog } from '@astryxdesign/core/Dialog';
import { Button } from './Button';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Icon } from '@astryxdesign/core/Icon';
import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

export function ConfirmationDialog({ isOpen, onOpenChange, title, description, actionLabel, cancelLabel = 'Hủy',
  actionVariant = 'destructive', isActionLoading, onAction, width = 400, actionIcon = TrashIcon }) {
  const titleId = useId();
  const descriptionId = useId();
  return <Dialog isOpen={isOpen} onOpenChange={onOpenChange} purpose="form" role="alertdialog" width={width}
    aria-labelledby={titleId} aria-describedby={descriptionId}>
    <div className="quoting-page-stack">
      <Heading level={2} id={titleId}>{title}</Heading>
      <Text color="secondary" id={descriptionId}>{description}</Text>
      <div className="confirmation-actions">
        <Button label={cancelLabel} variant="ghost" icon={<Icon icon={XMarkIcon} size="sm" />} onClick={() => onOpenChange(false)} data-autofocus />
        <Button label={actionLabel} variant={actionVariant} icon={<Icon icon={actionIcon} size="sm" />} onClick={onAction} isLoading={isActionLoading} />
      </div>
    </div>
  </Dialog>;
}
