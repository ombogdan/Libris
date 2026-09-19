import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(({ theme, scale }: any) =>
  StyleSheet.create({
    card: {
      marginHorizontal: scale(18),
      marginTop: scale(10),
      padding: scale(14),
      borderRadius: scale(20),
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: scale(11),
      borderWidth: scale(1),
      borderColor: theme.palette.accent300,
      backgroundColor: theme.palette.accent100,
    },
    deletedCard: {
      borderColor: theme.palette.neutral300,
      backgroundColor: theme.palette.neutral100,
    },
    icon: {
      width: scale(24),
      color: theme.palette.accent700,
      fontSize: scale(20),
      lineHeight: scale(23),
      fontWeight: '800',
      textAlign: 'center',
    },
    content: {
      flex: 1,
      gap: scale(4),
    },
    title: {
      color: theme.palette.text,
      fontSize: scale(14),
      fontWeight: '800',
    },
    description: {
      color: theme.palette.neutral700,
      fontSize: scale(12.5),
      lineHeight: scale(18),
    },
    rating: {
      color: theme.palette.accent,
      fontSize: scale(17),
      letterSpacing: scale(1),
    },
    action: {
      alignSelf: 'flex-start',
      minHeight: scale(36),
      marginTop: scale(5),
      paddingHorizontal: scale(14),
      borderRadius: scale(999),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.palette.accent,
    },
    actionText: {
      color: theme.palette.white,
      fontSize: scale(12),
      fontWeight: '800',
    },
    pressed: {
      opacity: 0.72,
    },
  }),
);
