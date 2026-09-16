import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { RootStackParamList } from '../navigation/types';
import { Button, common, Field } from '../components/ui';
import { useAppStore } from '../store/AppStore';
import { colors as c } from '../theme';
export function SignupScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Signup'>) {
  const x = useAppStore();
  return (
    <ScrollView contentContainerStyle={common.page}>
      <Pressable onPress={navigation.goBack}>
        <Text style={common.back}>← Назад</Text>
      </Pressable>
      <Text style={s.title}>Розкажи трохи про себе</Text>
      <Text style={common.subtitle}>Це займе менше хвилини.</Text>
      <Field
        label="Як тебе звати"
        value={x.user}
        onChangeText={x.setUser}
        placeholder="Оксана"
      />
      <Field
        label="Місто"
        value={x.city}
        onChangeText={x.setCity}
        placeholder="Полтава"
      />
      <Field
        label="Телефон або email"
        value={x.contact}
        onChangeText={x.setContact}
        placeholder="+380 __ ___ __ __"
      />
      <Text style={s.help}>
        Реєстрація потрібна лише щоб публікувати книги й писати продавцям.
      </Text>
      <Button
        label="Готово, поїхали"
        onPress={() => {
          navigation.replace('Tabs', { screen: 'Feed' });
          x.notify('Вітаємо в Книгообігу!');
        }}
      />
    </ScrollView>
  );
}
const s = StyleSheet.create({
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    color: c.text,
    marginTop: 22,
  },
  help: { fontSize: 12, lineHeight: 18, color: c.n600, marginVertical: 6 },
});
