import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(({ theme, scale }: any) => ({
  ...StyleSheet.create({
    flex: { flex: 1 },
    page: {
      flex: 1,
      paddingHorizontal: scale(18),
      paddingVertical: scale(12),
      backgroundColor: theme.palette.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(10),
      paddingBottom: scale(8),
      borderBottomWidth: scale(1),
      borderBottomColor: theme.palette.divider,
    },
    back: {
      color: theme.palette.accent700,
      fontSize: scale(15),
      fontWeight: '700',
      paddingVertical: scale(8),
    },
    avatar: {
      width: scale(38),
      height: scale(38),
      borderRadius: scale(999),
      backgroundColor: theme.palette.violet300,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontWeight: '800', color: theme.palette.violet800 },
    name: {
      fontSize: scale(16),
      fontWeight: '800',
      color: theme.palette.text,
    },
    topic: { fontSize: scale(11), color: theme.palette.accent700 },
    messages: {
      flexGrow: 1,
      justifyContent: 'flex-end',
      gap: scale(8),
      paddingVertical: scale(12),
    },
    quick: { gap: scale(7), paddingBottom: scale(9) },
    compose: { flexDirection: 'row', gap: scale(8) },
    input: {
      flex: 1,
      height: scale(44),
      borderRadius: scale(999),
      backgroundColor: theme.palette.white,
      borderWidth: scale(1),
      borderColor: theme.palette.divider,
      paddingHorizontal: scale(16),
      color: theme.palette.text,
    },
    send: {
      width: scale(44),
      height: scale(44),
      borderRadius: scale(999),
      backgroundColor: theme.palette.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendText: {
      color: theme.palette.background,
      fontSize: scale(22),
      fontWeight: '800',
    },
  }),
  colors: { placeholder: theme.palette.neutral500 },
}));
