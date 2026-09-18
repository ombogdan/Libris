import React from 'react';
import { useTheme } from './ThemeProvider';
import { useScale } from './useScale';

export const createStyles = (callback: any) => (depsObj?: any) => {
  const scale = useScale();
  const { theme } = useTheme();
  const deps = depsObj || {};

  return React.useMemo(
    () => callback({ scale, theme, ...deps }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scale, theme, ...Object.values(deps)],
  );
};
