import { StyleSheet } from 'react-native';
import { createStyles } from '../../theme';

export const useStyles = createStyles(({ theme, scale }: any) => ({
  ...StyleSheet.create({
    flex: { flex: 1 },
    page: {
      paddingHorizontal: scale(24),
      paddingTop: scale(42),
      paddingBottom: scale(30),
      gap: scale(14),
    },
    title: {
      fontSize: scale(32),
      fontWeight: '800',
      color: theme.palette.text,
    },
    locationCard: {
      minHeight: scale(64),
      borderRadius: scale(20),
      paddingHorizontal: scale(16),
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(12),
      backgroundColor: theme.palette.white,
      borderWidth: scale(1),
      borderColor: theme.palette.divider,
    },
    locationText: { flex: 1, gap: scale(3) },
    locationLabel: {
      fontSize: scale(12),
      fontWeight: '700',
      color: theme.palette.neutral700,
    },
    error: {
      fontSize: scale(13),
      lineHeight: scale(19),
      color: theme.palette.error,
    },
  }),
  iconSize: scale(22),
}));
