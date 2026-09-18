import { StyleSheet } from 'react-native';

import { createStyles } from '../../../../theme';

export const useStyles = createStyles(({ theme, scale }: any) =>
  StyleSheet.create({
    metric: {
      flex: 1,
      backgroundColor: theme.palette.white,
      borderRadius: scale(16),
      padding: scale(13),
      alignItems: 'center',
      gap: scale(3),
    },
    value: {
      fontSize: scale(22),
      fontWeight: '800',
      color: theme.palette.text,
    },
    label: { fontSize: scale(11.5), color: theme.palette.neutral600 },
  }),
);
