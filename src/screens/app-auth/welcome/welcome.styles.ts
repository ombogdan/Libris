import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(({ theme, scale }: any) =>
  StyleSheet.create({
    page: {
      flex: 1,
      paddingHorizontal: scale(26),
      paddingTop: scale(42),
      paddingBottom: scale(34),
      justifyContent: 'space-between',
      backgroundColor: theme.palette.background,
    },
    logo: {
      width: scale(74),
      height: scale(74),
      borderRadius: scale(999),
      backgroundColor: theme.palette.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: scale(26),
    },
    logoText: {
      fontSize: scale(34),
      fontWeight: '800',
      color: theme.palette.background,
    },
    hero: {
      fontSize: scale(38),
      lineHeight: scale(40),
      fontWeight: '800',
      letterSpacing: scale(-1.2),
      color: theme.palette.text,
      marginBottom: scale(15),
    },
    subtitle: {
      fontSize: scale(15),
      lineHeight: scale(23),
      color: theme.palette.subtitle,
      maxWidth: scale(340),
    },
    tags: {
      flexDirection: 'row',
      gap: scale(8),
      marginBottom: scale(13),
      flexWrap: 'wrap',
    },
    tag: {
      backgroundColor: theme.palette.violet200,
      borderRadius: scale(999),
      paddingHorizontal: scale(13),
      paddingVertical: scale(9),
    },
    tagText: {
      color: theme.palette.violet800,
      fontSize: scale(12.5),
      fontWeight: '700',
    },
  }),
);
