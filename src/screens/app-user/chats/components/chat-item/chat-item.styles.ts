import { StyleSheet } from 'react-native';
import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(({ theme, scale }: any) =>
  StyleSheet.create({
    row: {
      paddingVertical: scale(11),
      paddingHorizontal: scale(10),
      borderRadius: scale(28),
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(12),
      backgroundColor: theme.palette.white,
      shadowColor: theme.palette.text,
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.06,
      shadowRadius: scale(5),
      elevation: scale(1),
    },
    pressed: { opacity: 0.72 },
    avatar: {
      width: scale(46),
      height: scale(46),
      borderRadius: scale(999),
      backgroundColor: theme.palette.violet300,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatarImage: { width: '100%', height: '100%' },
    avatarText: {
      fontSize: scale(18),
      fontWeight: '800',
      color: theme.palette.violet800,
    },
    between: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: scale(8),
    },
    name: {
      flex: 1,
      fontSize: scale(16),
      fontWeight: '800',
      color: theme.palette.text,
    },
    time: { flexShrink: 0 },
    unreadMessage: {
      color: theme.palette.text,
      fontWeight: '700',
    },
    topicRow: {
      minHeight: scale(20),
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(7),
      marginTop: scale(3),
    },
    topic: {
      flex: 1,
      fontSize: scale(11),
      color: theme.palette.accent700,
    },
    archiveBadge: {
      flexShrink: 0,
      minHeight: scale(20),
      paddingHorizontal: scale(7),
      borderRadius: scale(999),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.palette.accent200,
    },
    archiveBadgeDeleted: {
      borderWidth: scale(1),
      borderColor: theme.palette.error,
      backgroundColor: theme.palette.background,
    },
    archiveBadgeText: {
      color: theme.palette.accent800,
      fontSize: scale(9.5),
      fontWeight: '800',
    },
    archiveBadgeDeletedText: {
      color: theme.palette.error,
    },
    unread: {
      minWidth: scale(22),
      height: scale(22),
      borderRadius: scale(99),
      backgroundColor: theme.palette.accent,
      paddingHorizontal: scale(6),
      alignItems: 'center',
      justifyContent: 'center',
    },
    unreadText: {
      color: theme.palette.background,
      fontSize: scale(10),
      fontWeight: '800',
    },
  }),
);
