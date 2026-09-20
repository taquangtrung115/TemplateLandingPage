import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Sparkles } from 'lucide-react';

/**
 * Safely resolves a Lucide icon by string name with fallback.
 * @param {string} iconName - Name of the Lucide icon (e.g. "Heart", "Cake", "Ring")
 * @param {React.Component} DefaultIcon - Fallback component if iconName is not found
 * @returns {React.Component} The resolved Lucide icon component
 */
export function resolveIcon(iconName, DefaultIcon = Sparkles) {
  if (!iconName || typeof iconName !== 'string') {
    return DefaultIcon;
  }

  const cleanName = iconName.trim();
  if (LucideIcons[cleanName]) {
    return LucideIcons[cleanName];
  }

  const pascalName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  if (LucideIcons[pascalName]) {
    return LucideIcons[pascalName];
  }

  return DefaultIcon;
}

export default resolveIcon;
