import { StyleSheet } from 'react-native';
import { createStyles } from '../../theme';

export const useStyles = createStyles(({ theme, scale }: any) => ({
  ...StyleSheet.create({
    search: {
      height: scale(48),
      borderRadius: scale(999),
      backgroundColor: theme.palette.white,
      paddingHorizontal: scale(17),
      fontSize: scale(14.5),
      color: theme.palette.text,
      borderWidth: scale(1),
      borderColor: theme.palette.divider,
    },
    chips: { gap: scale(8) },
    loading: { paddingVertical: scale(48) },
  }),
  colors: { placeholder: theme.palette.neutral500 },
}));
