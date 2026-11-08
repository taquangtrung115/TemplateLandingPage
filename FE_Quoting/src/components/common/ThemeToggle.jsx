import React from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useColorMode } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Button
      variant="secondary"
      label={colorMode === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}
      icon={<Icon icon={colorMode === 'dark' ? SunIcon : MoonIcon} size="sm" />}
      onClick={toggleColorMode}
      aria-pressed={colorMode === 'light'}
    />
  );
}
