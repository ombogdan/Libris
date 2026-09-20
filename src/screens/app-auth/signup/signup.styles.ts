import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(
  ({ theme, scale, topInset = 0, bottomInset = 0 }: any) => ({
    ...StyleSheet.create({
      page: {
        flex: 1,
        paddingHorizontal: scale(24),
        paddingTop: topInset + scale(6),
        paddingBottom: bottomInset + scale(20),
        backgroundColor: theme.palette.background,
      },
      backButton: {
        minHeight: scale(44),
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(7),
        paddingRight: scale(10),
      },
      backButtonPressed: {
        opacity: 0.55,
      },
      backText: {
        color: theme.palette.accent700,
        fontSize: scale(15),
        fontWeight: '700',
      },
      content: { flex: 1, justifyContent: 'center', gap: scale(16) },
      logo: {
        width: scale(64),
        height: scale(64),
        borderRadius: scale(32),
        backgroundColor: theme.palette.accent,
        alignItems: 'center',
        justifyContent: 'center',
      },
      logoText: {
        fontSize: scale(28),
        fontWeight: '800',
        color: theme.palette.background,
      },
      title: {
        fontSize: scale(31),
        fontWeight: '800',
        color: theme.palette.text,
      },
      subtitle: {
        fontSize: scale(15),
        lineHeight: scale(23),
        color: theme.palette.subtitle,
      },
      googleButton: {
        height: scale(52),
        borderRadius: scale(999),
        borderWidth: scale(1),
        borderColor: '#747775',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(12),
        paddingHorizontal: scale(16),
      },
      googleButtonPressed: {
        backgroundColor: '#F8F9FA',
      },
      googleButtonDisabled: {
        opacity: 0.55,
      },
      googleIcon: {
        width: scale(18),
        height: scale(18),
      },
      googleText: {
        color: '#1F1F1F',
        fontSize: scale(14),
        lineHeight: scale(20),
        fontWeight: '600',
      },
      help: {
        fontSize: scale(12.5),
        lineHeight: scale(19),
        color: theme.palette.neutral600,
      },
      error: {
        fontSize: scale(13),
        lineHeight: scale(19),
        color: theme.palette.error,
      },
    }),
    backIconSize: scale(22),
    hitSlop: scale(8),
  }),
);
