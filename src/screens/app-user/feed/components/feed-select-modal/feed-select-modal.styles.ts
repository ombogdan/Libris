import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(
  ({ theme, scale, bottomInset = 0 }: any) => ({
    ...StyleSheet.create({
      overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: theme.palette.overlay,
      },
      card: {
        maxHeight: '78%',
        backgroundColor: theme.palette.background,
        borderTopLeftRadius: scale(28),
        borderTopRightRadius: scale(28),
        paddingHorizontal: scale(18),
        paddingTop: scale(22),
        paddingBottom: scale(18) + bottomInset,
      },
      heading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: scale(14),
      },
      title: {
        flex: 1,
        color: theme.palette.text,
        fontSize: scale(22),
        lineHeight: scale(27),
        fontWeight: '800',
      },
      close: {
        width: scale(40),
        height: scale(40),
        alignItems: 'center',
        justifyContent: 'center',
      },
      options: {
        gap: scale(8),
      },
      option: {
        minHeight: scale(50),
        borderWidth: scale(1),
        borderColor: theme.palette.divider,
        borderRadius: scale(16),
        backgroundColor: theme.palette.white,
        paddingHorizontal: scale(16),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      optionActive: {
        borderColor: theme.palette.accent,
        backgroundColor: theme.palette.accent100,
      },
      pressed: { opacity: 0.72 },
      optionText: {
        flex: 1,
        color: theme.palette.text,
        fontSize: scale(14),
        fontWeight: '700',
      },
      check: {
        color: theme.palette.accent,
        fontSize: scale(18),
        fontWeight: '800',
      },
      custom: {
        marginTop: scale(16),
        paddingTop: scale(16),
        borderTopWidth: scale(1),
        borderTopColor: theme.palette.divider,
        gap: scale(9),
      },
      customLabel: {
        color: theme.palette.neutral700,
        fontSize: scale(13),
        fontWeight: '700',
      },
      input: {
        minHeight: scale(48),
        borderRadius: scale(16),
        borderWidth: scale(1),
        borderColor: theme.palette.divider,
        backgroundColor: theme.palette.white,
        paddingHorizontal: scale(16),
        color: theme.palette.text,
        fontSize: scale(14),
      },
    }),
    closeIconSize: scale(22),
    hitSlop: scale(8),
    colors: {
      placeholder: theme.palette.neutral500,
      close: theme.palette.neutral700,
    },
  }),
);
