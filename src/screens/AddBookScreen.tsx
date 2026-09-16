import React, { useState } from 'react';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { TabParamList } from '../navigation/types';
import { Button, Chip, common, Field, ScreenTitle } from '../components/ui';
import { useAppStore } from '../store/AppStore';
import { colors as c } from '../theme';
export function AddBookScreen({
  navigation,
}: BottomTabScreenProps<TabParamList, 'Add'>) {
  const x = useAppStore();
  const [f, setF] = useState({
    title: '',
    author: '',
    price: '',
    about: '',
    free: false,
    condition: 'Добрий',
  });
  const set = (key: keyof typeof f, value: string | boolean) =>
    setF(v => ({ ...v, [key]: value }));
  return (
    <ScrollView
      contentContainerStyle={common.page}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenTitle>Нова книга</ScreenTitle>
      <Text style={common.subtitle}>Три поля — і оголошення в стрічці.</Text>
      <View style={s.photoRow}>
        <View style={s.photo}>
          <Text style={s.plus}>＋</Text>
          <Text style={s.photoText}>фото обкладинки</Text>
        </View>
        <View style={common.grow}>
          <Field
            compact
            label="Назва"
            value={f.title}
            onChangeText={v => set('title', v)}
          />
          <Field
            compact
            label="Автор"
            value={f.author}
            onChangeText={v => set('author', v)}
          />
        </View>
      </View>
      <Text style={s.label}>Ціна</Text>
      <View style={common.inline}>
        <TextInput
          editable={!f.free}
          keyboardType="numeric"
          style={[s.input, common.grow, f.free && { opacity: 0.45 }]}
          value={f.price}
          onChangeText={v => set('price', v)}
          placeholder="220 ₴"
        />
        <Chip
          label="Віддам даром"
          active={f.free}
          onPress={() => set('free', !f.free)}
        />
      </View>
      <Text style={s.label}>Стан</Text>
      <View style={s.chips}>
        {['Як нова', 'Добрий', 'Читана'].map(v => (
          <Chip
            key={v}
            label={v}
            active={f.condition === v}
            onPress={() => set('condition', v)}
          />
        ))}
      </View>
      <Text style={s.label}>Коротко про книгу</Text>
      <TextInput
        multiline
        style={[s.input, s.textarea]}
        value={f.about}
        onChangeText={v => set('about', v)}
        placeholder="Читала один раз, обкладинка як нова."
      />
      <Button
        label="Опублікувати"
        onPress={() => {
          if (!f.title.trim()) return;
          x.publish(f);
          x.notify('Оголошення опубліковано');
          navigation.navigate('Profile');
          navigation.getParent()?.navigate('MyListings');
        }}
      />
    </ScrollView>
  );
}
const s = StyleSheet.create({
  photoRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  photo: {
    width: 96,
    height: 132,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: c.n400,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  plus: { fontSize: 28, color: c.accent },
  photoText: { fontSize: 10, textAlign: 'center', color: c.n600 },
  label: { fontSize: 12, fontWeight: '700', color: c.n700 },
  input: {
    minHeight: 44,
    borderRadius: 999,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.divider,
    paddingHorizontal: 16,
    fontSize: 14,
    color: c.text,
  },
  chips: { flexDirection: 'row', gap: 8 },
  textarea: {
    height: 100,
    borderRadius: 16,
    textAlignVertical: 'top',
    paddingTop: 13,
  },
});
