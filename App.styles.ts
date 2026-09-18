import { StyleSheet } from 'react-native';

import { createStyles } from './src/theme';

export const useStyles = createStyles(({ theme, scale }: any) => {
  const shadow = {
    shadowColor: theme.palette.text,
    shadowOffset: { width: scale(0), height: scale(2) },
    shadowOpacity: 0.08,
    shadowRadius: scale(5),
    elevation: scale(2),
  };

  return StyleSheet.create({
    flex: { flex: 1 },
    safe: { flex: 1, backgroundColor: theme.palette.background },
    toast: {
      position: 'absolute',
      left: scale(16),
      right: scale(16),
      bottom: scale(96),
      backgroundColor: theme.palette.violet800,
      borderRadius: scale(999),
      paddingVertical: scale(13),
      paddingHorizontal: scale(20),
      ...shadow,
    },
    toastText: {
      fontSize: scale(13.5),
      color: theme.palette.neutral100,
      textAlign: 'center',
    },
  });
});
