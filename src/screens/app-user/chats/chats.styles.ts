import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(
  ({ theme, scale, bottomInset = 0 }: any) =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: theme.palette.background,
      },
      tabs: {
        flexDirection: 'row',
        gap: scale(4),
        marginHorizontal: scale(18),
        marginTop: scale(12),
        padding: scale(4),
        borderRadius: scale(999),
        backgroundColor: theme.palette.neutral200,
      },
      tab: {
        flex: 1,
        minHeight: scale(40),
        paddingHorizontal: scale(8),
        borderRadius: scale(999),
        alignItems: 'center',
        justifyContent: 'center',
      },
      tabActive: {
        backgroundColor: theme.palette.accent,
      },
      tabPressed: {
        opacity: 0.72,
      },
      tabText: {
        color: theme.palette.neutral700,
        fontSize: scale(12.5),
        fontWeight: '800',
      },
      tabTextActive: {
        color: theme.palette.background,
      },
      page: {
        flexGrow: 1,
        paddingHorizontal: scale(18),
        paddingTop: scale(16),
        paddingBottom: scale(128) + bottomInset,
        gap: scale(13),
        backgroundColor: theme.palette.background,
      },
      emptyPage: {
        justifyContent: 'center',
      },
      centeredState: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(14),
        paddingHorizontal: scale(24),
        paddingVertical: scale(58),
      },
      stateText: {
        color: theme.palette.neutral600,
        fontSize: scale(14),
      },
      emptyState: {
        paddingHorizontal: scale(8),
      },
      inlineError: {
        padding: scale(14),
        marginBottom: scale(4),
        borderRadius: scale(20),
        borderWidth: scale(1),
        borderColor: theme.palette.error,
        backgroundColor: theme.palette.white,
      },
      inlineErrorText: {
        color: theme.palette.error,
        fontSize: scale(13),
        lineHeight: scale(19),
        textAlign: 'center',
      },
    }),
);
