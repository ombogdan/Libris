import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(({ theme, scale }: any) =>
  StyleSheet.create({
    page: {
      paddingHorizontal: scale(18),
      paddingTop: scale(12),
      paddingBottom: scale(30),
      gap: scale(13),
      backgroundColor: theme.palette.background,
    },
    top: { alignItems: 'center', gap: scale(6), paddingVertical: scale(10) },
    avatar: {
      width: scale(72),
      height: scale(72),
      borderRadius: scale(999),
      backgroundColor: theme.palette.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    initial: {
      fontSize: scale(28),
      fontWeight: '800',
      color: theme.palette.background,
    },
    title: {
      fontSize: scale(23),
      fontWeight: '800',
      color: theme.palette.text,
    },
    meta: { fontSize: scale(12.5), color: theme.palette.neutral600 },
    metrics: { flexDirection: 'row', gap: scale(8) },
    logout: {
      color: theme.palette.accent700,
      fontWeight: '700',
      paddingVertical: scale(18),
    },
  }),
);
