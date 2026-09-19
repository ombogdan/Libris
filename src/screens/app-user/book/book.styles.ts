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
        paddingTop: scale(16),
        paddingBottom: scale(24) + bottomInset,
      },
      missing: { flex: 1, justifyContent: 'center', padding: scale(18) },
      title: {
        fontSize: scale(28),
        lineHeight: scale(31),
        fontWeight: '800',
        letterSpacing: scale(-0.7),
        color: theme.palette.text,
      },
      author: { fontSize: scale(14), color: theme.palette.neutral600 },
      seller: {
        backgroundColor: theme.palette.white,
        borderRadius: scale(28),
        padding: scale(14),
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
      },
      sellerPressed: { opacity: 0.72 },
      sellerInfo: { flex: 1, gap: scale(2) },
      sellerArrow: {
        color: theme.palette.neutral500,
        fontSize: scale(26),
        lineHeight: scale(30),
      },
      avatar: {
        width: scale(46),
        height: scale(46),
        borderRadius: scale(999),
        backgroundColor: theme.palette.violet300,
        alignItems: 'center',
        justifyContent: 'center',
      },
      avatarText: {
        fontSize: scale(18),
        fontWeight: '800',
        color: theme.palette.violet800,
      },
      sellerName: {
        fontSize: scale(16),
        fontWeight: '800',
        color: theme.palette.text,
      },
    }),
);
