import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(({ theme, scale }: any) =>
  StyleSheet.create({
    card: {
      minHeight: scale(104),
      padding: scale(16),
      borderRadius: scale(24),
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(16),
      backgroundColor: theme.palette.accent200,
    },
    scoreBlock: {
      minWidth: scale(86),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: scale(5),
    },
    score: {
      color: theme.palette.accent800,
      fontSize: scale(34),
      lineHeight: scale(40),
      fontWeight: '800',
    },
    star: {
      color: theme.palette.accent,
      fontSize: scale(21),
    },
    details: {
      flex: 1,
      gap: scale(5),
    },
    name: {
      color: theme.palette.text,
      fontSize: scale(17),
      lineHeight: scale(21),
      fontWeight: '800',
    },
    count: {
      color: theme.palette.neutral700,
      fontSize: scale(13),
    },
  }),
);
