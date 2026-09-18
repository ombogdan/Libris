import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(({ theme, scale }: any) => ({
  ...StyleSheet.create({
    row: {
      width: '100%',
      flexDirection: 'row',
    },
    mineRow: { justifyContent: 'flex-end' },
    theirsRow: { justifyContent: 'flex-start' },
    bubble: {
      maxWidth: '82%',
      minWidth: scale(74),
      paddingTop: scale(9),
      paddingBottom: scale(6),
      paddingHorizontal: scale(14),
      borderRadius: scale(20),
    },
    mine: {
      backgroundColor: theme.palette.accent,
      borderBottomRightRadius: scale(6),
    },
    theirs: {
      backgroundColor: theme.palette.white,
      borderBottomLeftRadius: scale(6),
    },
    sending: { opacity: 0.68 },
    failed: {
      backgroundColor: theme.palette.white,
      borderWidth: scale(1),
      borderColor: theme.palette.error,
    },
    message: {
      fontSize: scale(14),
      lineHeight: scale(20),
      color: theme.palette.text,
    },
    mineMessage: { color: theme.palette.background },
    failedMessage: { color: theme.palette.text },
    metaRow: {
      minHeight: scale(15),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: scale(5),
      marginTop: scale(2),
    },
    time: {
      color: theme.palette.neutral500,
      fontSize: scale(9.5),
    },
    status: { fontSize: scale(9.5), fontWeight: '700' },
    mineMeta: { color: theme.palette.accent200 },
    failedMeta: { color: theme.palette.neutral500 },
    retry: {
      color: theme.palette.error,
      fontSize: scale(10),
      fontWeight: '800',
      paddingVertical: scale(2),
    },
  }),
  hitSlop: scale(8),
}));
