import { StyleSheet } from 'react-native';
import { createStyles } from '../../../../theme';

export const useStyles = createStyles(({ theme, scale }: any) =>
  StyleSheet.create({
    row: {
      paddingVertical: scale(11),
      paddingHorizontal: scale(8),
      borderRadius: scale(28),
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(12),
    },
    avatar: {
      width: scale(46),
      height: scale(46),
      borderRadius: scale(999),
      backgroundColor: theme.palette.violet300,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: scale(18),
      fontWeight: '800',
      color: theme.palette.violet800,
    },
    between: { flexDirection: 'row', justifyContent: 'space-between' },
    name: {
      fontSize: scale(16),
      fontWeight: '800',
      color: theme.palette.text,
    },
    topic: {
      fontSize: scale(11),
      color: theme.palette.accent700,
      marginTop: scale(3),
    },
    unread: {
      width: scale(10),
      height: scale(10),
      borderRadius: scale(99),
      backgroundColor: theme.palette.accent,
    },
  }),
);
