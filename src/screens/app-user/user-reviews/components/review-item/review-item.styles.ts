import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(({ theme, scale }: any) => ({
  ...StyleSheet.create({
    card: {
      padding: scale(14),
      borderRadius: scale(24),
      gap: scale(12),
      backgroundColor: theme.palette.white,
      shadowColor: theme.palette.text,
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.06,
      shadowRadius: scale(5),
      elevation: scale(1),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(10),
    },
    avatar: {
      width: scale(42),
      height: scale(42),
      borderRadius: scale(999),
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: theme.palette.violet300,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarText: {
      color: theme.palette.violet800,
      fontSize: scale(16),
      fontWeight: '800',
    },
    headerDetails: {
      flex: 1,
      gap: scale(2),
    },
    name: {
      color: theme.palette.text,
      fontSize: scale(14),
      fontWeight: '800',
    },
    rating: {
      color: theme.palette.accent,
      fontSize: scale(15),
      letterSpacing: scale(1),
    },
    date: {
      flexShrink: 0,
      maxWidth: scale(82),
      color: theme.palette.neutral500,
      fontSize: scale(10.5),
      lineHeight: scale(14),
      textAlign: 'right',
    },
    comment: {
      color: theme.palette.text,
      fontSize: scale(14),
      lineHeight: scale(21),
    },
    listing: {
      color: theme.palette.neutral600,
      fontSize: scale(11.5),
    },
    replyCard: {
      marginLeft: scale(20),
      padding: scale(11),
      borderRadius: scale(16),
      borderLeftWidth: scale(3),
      borderLeftColor: theme.palette.accent,
      backgroundColor: theme.palette.accent100,
      gap: scale(3),
    },
    replyLabel: {
      color: theme.palette.accent700,
      fontSize: scale(11),
      fontWeight: '800',
    },
    replyText: {
      color: theme.palette.text,
      fontSize: scale(13),
      lineHeight: scale(19),
    },
    replyActions: {
      flexDirection: 'row',
      gap: scale(14),
    },
    replyActionButton: {
      minHeight: scale(30),
      justifyContent: 'center',
    },
    replyActionText: {
      color: theme.palette.accent700,
      fontSize: scale(12),
      fontWeight: '700',
    },
    removeReplyText: {
      color: theme.palette.error,
      fontSize: scale(12),
      fontWeight: '700',
    },
    replyForm: {
      gap: scale(8),
    },
    replyInput: {
      minHeight: scale(72),
      borderRadius: scale(14),
      borderWidth: scale(1),
      borderColor: theme.palette.divider,
      backgroundColor: theme.palette.background,
      paddingHorizontal: scale(12),
      paddingVertical: scale(10),
      color: theme.palette.text,
      fontSize: scale(13),
    },
    replyFormActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: scale(16),
    },
    replySaveButton: {
      paddingHorizontal: scale(4),
    },
    replySaveText: {
      color: theme.palette.accent700,
      fontSize: scale(12),
      fontWeight: '800',
    },
    pressed: { opacity: 0.65 },
  }),
  colors: { placeholder: theme.palette.neutral500 },
}));
