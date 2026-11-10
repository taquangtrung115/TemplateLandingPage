import { defineTheme } from '@astryxdesign/core/theme';
import { themes } from './astryx-themes';

// #region Astryx theme variants
const actionStyles = (background, hover) => ({
  backgroundColor: background, borderColor: background, color: '#ffffff',
  ':hover': { backgroundColor: hover, borderColor: hover },
  ':active': { backgroundColor: hover },
});

// Both modes share Gothic's typography, geometry and component rules; only colors change.
const lightColors = Object.fromEntries(Object.entries(themes.neutral.tokens).filter(([name]) => name.startsWith('--color-')));
const createQuotingTheme = (mode) => defineTheme({
  name: `quoting-${mode}`,
  extends: themes.gothic,
  tokens: {
    ...(mode === 'light' ? lightColors : {}),
    '--color-background-muted': mode === 'light' ? '#e8edf2' : '#24292d',
    '--color-skeleton': mode === 'light' ? '#d3dce5' : '#495056',
    '--color-accent': '#0369a1', '--color-on-accent': '#ffffff',
    '--color-success': '#047857', '--color-on-success': '#ffffff',
    '--color-warning': '#92400e', '--color-on-warning': '#ffffff',
    '--color-error': '#b91c1c', '--color-on-error': '#ffffff',
    '--color-info': '#0369a1', '--color-on-info': '#ffffff',
    '--color-background-blue': mode === 'light' ? '#eff6ff' : '#152d3b',
    '--color-border-blue': mode === 'light' ? '#93c5e0' : '#31536a',
    '--color-text-blue': mode === 'light' ? '#075985' : '#9bd4f0',
    '--color-text-info': mode === 'light' ? '#075985' : '#9bd4f0',
  },
  components: {
    button: {
      base: { borderWidth: '1px', borderStyle: 'solid' },
      'variant:primary': actionStyles('#0369a1', '#075985'),
      'variant:success': actionStyles('#047857', '#065f46'),
      'variant:destructive': actionStyles('#b91c1c', '#991b1b'),
      'variant:secondary': {
        borderColor: 'var(--color-border-emphasized)',
        backgroundColor: 'var(--color-background-card)',
        color: 'var(--color-text-primary)',
        ':hover': { backgroundColor: 'var(--color-background-muted)' },
      },
    },
  },
});

export const quotingThemes = {
  light: createQuotingTheme('light'),
  dark: createQuotingTheme('dark'),
};
// #endregion
