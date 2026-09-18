import { StyleSheet } from 'react-native';
import { createStyles } from '../../theme';

export const useStyles = createStyles(({ scale }: any) =>
  StyleSheet.create({
    page: {
      paddingHorizontal: scale(18),
      paddingTop: scale(12),
      paddingBottom: scale(30),
      gap: scale(13),
    },
  }),
);
