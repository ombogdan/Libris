import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
} from 'react';
import { defaultTheme } from './theme';

const ThemeContext = createContext({ theme: defaultTheme });

export function ThemeProvider({ children }: PropsWithChildren) {
  const value = useMemo(() => ({ theme: defaultTheme }), []);
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
