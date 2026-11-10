import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider, THEME_STORAGE_KEY } from '../src/contexts/ThemeContext';
import ThemeToggle from '../src/components/common/ThemeToggle';
import { quotingThemes } from '../src/quoting-theme';

describe('Light and dark Astryx themes', () => {
  it('keeps typography, dimensions and component rules identical across color modes', () => {
    const geometry = (theme) => Object.fromEntries(Object.entries(theme.tokens).filter(([name]) => !name.startsWith('--color-')));
    expect(geometry(quotingThemes.light)).toEqual(geometry(quotingThemes.dark));
    expect(quotingThemes.light.components).toEqual(quotingThemes.dark.components);
    expect(quotingThemes.light.tokens['--color-background-muted']).not.toBe(quotingThemes.light.tokens['--color-background-body']);
  });
  it.each([null, 'invalid'])('defaults to light without a valid saved preference (%s), even on a dark device', (savedMode) => {
    if (savedMode) localStorage.setItem(THEME_STORAGE_KEY, savedMode);
    const media = vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: false, media: query, onchange: null,
      addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: () => false,
    }));
    try {
      render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
      expect(document.documentElement).toHaveAttribute('data-theme', 'light');
      expect(document.documentElement).toHaveAttribute('data-astryx-theme', 'quoting-light');
      expect(screen.getByRole('button', { name: 'Giao diện tối' })).toBeEnabled();
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    } finally { media.mockRestore(); }
  });
  it('switches and persists the preference, including portal theme attributes', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    const { unmount } = render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    fireEvent.click(screen.getByRole('button', { name: 'Giao diện sáng' }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));
    expect(document.documentElement).toHaveAttribute('data-astryx-theme', 'quoting-light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    unmount();
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    expect(screen.getByRole('button', { name: 'Giao diện tối' })).toHaveAttribute('aria-pressed', 'true');
  });
  it('syncs a valid preference from another tab and ignores corrupt values', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: 'light' })));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: 'invalid' })));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });
  it('remains usable when storage is blocked', () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toBeEnabled();
    get.mockRestore(); set.mockRestore();
  });
});
