import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/types';

export type WelcomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Welcome'
>;
