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
        paddingTop: scale(24),
        paddingHorizontal: scale(18),
        paddingBottom: scale(24) + bottomInset,
        borderTopLeftRadius: scale(28),
        borderTopRightRadius: scale(28),
        gap: scale(10),
        backgroundColor: theme.palette.background,
      },
      title: {
        color: theme.palette.text,
        fontSize: scale(22),
        fontWeight: '800',
      },
      subtitle: {
        color: theme.palette.neutral600,
        fontSize: scale(14),
        lineHeight: scale(20),
      },
      stars: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: scale(8),
      },
      starButton: {
        width: scale(48),
        height: scale(48),
        alignItems: 'center',
        justifyContent: 'center',
      },
      star: {
        color: theme.palette.neutral400,
        fontSize: scale(34),
        lineHeight: scale(39),
      },
      starSelected: {
        color: theme.palette.accent,
      },
      pressed: {
        opacity: 0.68,
      },
      label: {
        color: theme.palette.neutral700,
        fontSize: scale(12),
        fontWeight: '700',
      },
      input: {
        minHeight: scale(112),
        maxHeight: scale(160),
        paddingHorizontal: scale(15),
        paddingVertical: scale(13),
        borderRadius: scale(20),
        borderWidth: scale(1),
        borderColor: theme.palette.divider,
        color: theme.palette.text,
        backgroundColor: theme.palette.white,
        fontSize: scale(14),
        lineHeight: scale(20),
      },
      counter: {
        alignSelf: 'flex-end',
        color: theme.palette.neutral500,
        fontSize: scale(11),
      },
      error: {
        color: theme.palette.error,
        fontSize: scale(13),
        lineHeight: scale(18),
      },
    }),
    colors: {
      placeholder: theme.palette.neutral500,
    },
  }),
);
