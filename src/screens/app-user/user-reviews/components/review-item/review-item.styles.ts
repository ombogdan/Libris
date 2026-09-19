import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(({ theme, scale }: any) =>
  StyleSheet.create({
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
  }),
);
