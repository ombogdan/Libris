import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(({ theme, scale }: any) =>
  StyleSheet.create({
    section: {
      marginTop: scale(8),
      gap: scale(12),
    },
    title: {
      color: theme.palette.text,
      fontSize: scale(20),
      lineHeight: scale(24),
      fontWeight: '800',
    },
    // The carousel runs to the screen edges, past the page's side padding.
    scroll: { marginHorizontal: -scale(18) },
    list: {
      paddingHorizontal: scale(18),
      gap: scale(12),
    },
    card: {
      width: scale(132),
      gap: scale(4),
    },
    pressed: { opacity: 0.72 },
    cover: {
      width: scale(132),
      height: scale(176),
      borderRadius: scale(16),
      marginBottom: scale(4),
    },
    bookTitle: {
      color: theme.palette.text,
      fontSize: scale(13.5),
      lineHeight: scale(17),
      fontWeight: '700',
    },
    author: {
      color: theme.palette.neutral600,
      fontSize: scale(12),
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(6),
      marginTop: scale(2),
    },
    city: {
      flex: 1,
      color: theme.palette.neutral600,
      fontSize: scale(11.5),
    },
  }),
);
