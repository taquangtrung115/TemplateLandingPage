import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const key = 'photoprint.theme';

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem(key) === 'dark'; } catch { return false; }
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem(key, dark ? 'dark' : 'light'); } catch { /* State remains available. */ }
  }, [dark]);
  return <ThemeContext.Provider value={{ dark, toggleTheme: () => setDark(value => !value) }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
