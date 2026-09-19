import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(({ theme, scale }: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.palette.white,
      borderRadius: scale(28),
      padding: scale(12),
      gap: scale(10),
    },
    row: {
      flexDirection: 'row',
      gap: scale(14),
      alignItems: 'center',
    },
    info: { flex: 1, gap: scale(6) },
    title: {
      fontSize: scale(16),
      fontWeight: '800',
      color: theme.palette.text,
    },
    inline: { flexDirection: 'row', alignItems: 'center', gap: scale(8) },
    status: {
      backgroundColor: theme.palette.violet100,
      borderRadius: scale(999),
      paddingVertical: scale(5),
      paddingHorizontal: scale(9),
    },
    statusSold: { backgroundColor: theme.palette.neutral200 },
    statusText: {
      fontSize: scale(11),
      color: theme.palette.violet800,
      fontWeight: '700',
    },
    statusSoldText: { color: theme.palette.neutral700 },
    meta: { fontSize: scale(11.5), color: theme.palette.neutral600 },
    actions: {
      flexDirection: 'row',
      gap: scale(7),
    },
    actionButton: {
      flex: 1,
      minHeight: scale(36),
      borderRadius: scale(999),
      borderWidth: scale(1),
      borderColor: theme.palette.divider,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: scale(8),
    },
    actionText: {
      color: theme.palette.neutral700,
      fontSize: scale(10.5),
      fontWeight: '700',
      textAlign: 'center',
    },
    deleteButton: { borderColor: theme.palette.error },
    deleteText: {
      color: theme.palette.error,
      fontSize: scale(10.5),
      fontWeight: '700',
    },
    disabled: { opacity: 0.55 },
    pressed: { opacity: 0.7 },
  }),
);
