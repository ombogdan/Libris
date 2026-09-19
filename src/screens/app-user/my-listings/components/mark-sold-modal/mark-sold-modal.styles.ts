import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(
  ({ theme, scale, bottomInset = 0 }: any) =>
    StyleSheet.create({
      overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: theme.palette.overlay,
      },
      card: {
        maxHeight: '82%',
        backgroundColor: theme.palette.background,
        borderTopLeftRadius: scale(28),
        borderTopRightRadius: scale(28),
        paddingTop: scale(22),
        paddingHorizontal: scale(18),
        paddingBottom: scale(20) + bottomInset,
        gap: scale(12),
      },
      title: {
        fontSize: scale(22),
        lineHeight: scale(27),
        fontWeight: '800',
        color: theme.palette.text,
      },
      subtitle: {
        fontSize: scale(13),
        lineHeight: scale(19),
        color: theme.palette.neutral600,
      },
      list: {
        gap: scale(8),
      },
      option: {
        minHeight: scale(58),
        borderRadius: scale(18),
        borderWidth: scale(1),
        borderColor: theme.palette.divider,
        backgroundColor: theme.palette.white,
        paddingHorizontal: scale(14),
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(11),
      },
      optionPressed: { opacity: 0.7 },
      optionDisabled: { opacity: 0.5 },
      avatar: {
        width: scale(38),
        height: scale(38),
        borderRadius: scale(999),
        backgroundColor: theme.palette.accent200,
        alignItems: 'center',
        justifyContent: 'center',
      },
      avatarImage: {
        width: scale(38),
        height: scale(38),
        borderRadius: scale(999),
      },
      avatarText: {
        fontSize: scale(15),
        fontWeight: '800',
        color: theme.palette.accent800,
      },
      optionText: {
        fontSize: scale(14),
        fontWeight: '700',
        color: theme.palette.text,
      },
      optionContent: { flex: 1 },
      optionHint: {
        fontSize: scale(11.5),
        color: theme.palette.neutral600,
      },
      outsideOption: {
        borderStyle: 'dashed',
        justifyContent: 'center',
      },
      outsideText: {
        fontSize: scale(14),
        fontWeight: '700',
        color: theme.palette.accent700,
      },
    }),
);
