import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { quotingThemes } from '../quoting-theme';

// #region Theme preference
export const THEME_STORAGE_KEY = 'quoting.colorMode';
const isColorMode = (value) => value === 'light' || value === 'dark';
const ThemeContext = createContext({ colorMode: 'light', toggleColorMode: () => {} });

function readColorMode() {
  try {
    const savedMode = localStorage.getItem(THEME_STORAGE_KEY);
    if (isColorMode(savedMode)) return savedMode;
  } catch { /* A blocked storage area must not prevent the app from opening. */ }
  return 'light';
}
// #endregion

export function ThemeProvider({ children }) {
  const [colorMode, setColorMode] = useState(readColorMode);

  useEffect(() => {
    try { localStorage.setItem(THEME_STORAGE_KEY, colorMode); } catch { /* Keep the in-memory preference. */ }
  }, [colorMode]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === THEME_STORAGE_KEY && isColorMode(event.newValue)) setColorMode(event.newValue);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <ThemeContext.Provider value={{ colorMode, toggleColorMode: () => setColorMode((mode) => mode === 'dark' ? 'light' : 'dark') }}>
      <Theme theme={quotingThemes[colorMode]} mode={colorMode}>{children}</Theme>
    </ThemeContext.Provider>
  );
}

export const useColorMode = () => useContext(ThemeContext);
