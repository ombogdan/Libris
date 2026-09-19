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
        paddingBottom: scale(48) + bottomInset,
        gap: scale(12),
      },
      emptyPage: {
        justifyContent: 'center',
      },
      centeredState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(14),
        paddingHorizontal: scale(18),
        paddingVertical: scale(48),
      },
      stateText: {
        color: theme.palette.neutral600,
        fontSize: scale(14),
        lineHeight: scale(21),
        textAlign: 'center',
      },
      errorText: {
        color: theme.palette.error,
        fontSize: scale(14),
        lineHeight: scale(21),
        textAlign: 'center',
      },
      emptyIcon: {
        width: scale(56),
        height: scale(56),
        borderRadius: scale(999),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.accent200,
      },
      emptyIconText: {
        color: theme.palette.accent700,
        fontSize: scale(26),
        fontWeight: '800',
      },
      inlineError: {
        padding: scale(14),
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
