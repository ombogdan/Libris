import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(
  ({ theme, scale, bottomInset = 0 }: any) =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: theme.palette.background,
      },
      page: {
        flexGrow: 1,
        paddingHorizontal: scale(18),
        paddingTop: scale(16),
        paddingBottom: scale(40) + bottomInset,
        gap: scale(10),
      },
      centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(14),
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
        backgroundColor: theme.palette.white,
        borderRadius: scale(18),
        padding: scale(12),
      },
      avatar: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(999),
        backgroundColor: theme.palette.violet300,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      },
      avatarImage: { width: '100%', height: '100%' },
      avatarText: {
        fontSize: scale(16),
        fontWeight: '800',
        color: theme.palette.violet800,
      },
      name: {
        flex: 1,
        fontSize: scale(15),
        fontWeight: '700',
        color: theme.palette.text,
      },
      unblockButton: {
        paddingHorizontal: scale(14),
        paddingVertical: scale(9),
        borderRadius: scale(999),
        borderWidth: scale(1),
        borderColor: theme.palette.divider,
      },
      unblockButtonDisabled: { opacity: 0.5 },
      unblockButtonText: {
        fontSize: scale(12.5),
        fontWeight: '700',
        color: theme.palette.accent700,
      },
    }),
);
