import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(({ theme, scale }: any) =>
  StyleSheet.create({
    row: {
      backgroundColor: theme.palette.white,
      borderRadius: scale(28),
      padding: scale(12),
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
    statusText: {
      fontSize: scale(11),
      color: theme.palette.violet800,
      fontWeight: '700',
    },
    meta: { fontSize: scale(11.5), color: theme.palette.neutral600 },
  }),
);
