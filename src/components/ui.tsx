import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Book } from '../data';
import { colors as c, shadow } from '../theme';

export const price = (v: number) => (v ? `${v} ₴` : 'Даром');
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        disabled && s.disabled,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={[s.buttonText, secondary && { color: c.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}
export function Chip({
  label,
  active = false,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && s.chipActive]}>
      <Text style={[s.chipText, active && { color: c.bg }]}>{label}</Text>
    </Pressable>
  );
}
export function Field({
  label,
  compact = false,
  ...props
}: { label: string; compact?: boolean } & TextInputProps) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        placeholderTextColor={c.n500}
        style={[s.input, compact && { minHeight: 44 }]}
        {...props}
      />
    </View>
  );
}
export function PricePill({ value }: { value: number }) {
  return (
    <View style={[s.price, value === 0 && s.free]}>
      <Text style={[s.priceText, value === 0 && { color: c.violet800 }]}>
        {price(value)}
      </Text>
    </View>
  );
}
export function Cover({
  book,
  big = false,
}: {
  book: Pick<Book, 'title' | 'tone'>;
  big?: boolean;
}) {
  const pair =
    book.tone === 'accent'
      ? [c.accent300, c.accent800]
      : book.tone === 'accent2'
      ? [c.violet300, c.violet800]
      : [c.n300, c.n800];
  return (
    <View style={[s.cover, big && s.coverBig, { backgroundColor: pair[0] }]}>
      <Text style={[s.coverText, { color: pair[1] }]}>
        {book.title
          .split(' ')
          .slice(0, 2)
          .map(x => x[0])
          .join('')}
      </Text>
    </View>
  );
}
export function BookRow({
  book,
  favorite,
  onOpen,
  onHeart,
}: {
  book: Book;
  favorite: boolean;
  onOpen: () => void;
  onHeart: () => void;
}) {
  return (
    <Pressable onPress={onOpen} style={s.row}>
      <Cover book={book} />
      <View style={s.grow}>
        <Text numberOfLines={2} style={s.title}>
          {book.title}
        </Text>
        <Text style={s.meta}>{book.author}</Text>
        <View style={s.inline}>
          <PricePill value={book.price} />
          <Text style={s.mini}>
            {book.condition} · {book.city}
          </Text>
        </View>
      </View>
      <Pressable hitSlop={8} onPress={onHeart} style={s.heart}>
        <Text style={[s.heartText, favorite && { color: c.accent }]}>
          {favorite ? '♥' : '♡'}
        </Text>
      </Pressable>
    </Pressable>
  );
}
export function ScreenTitle({
  children,
  right,
}: {
  children: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={s.heading}>
      <Text style={s.h2}>{children}</Text>
      {right}
    </View>
  );
}
export function Empty({ text }: { text: string }) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Text style={s.heartText}>♡</Text>
      </View>
      <Text style={s.emptyText}>{text}</Text>
    </View>
  );
}

export const common = StyleSheet.create({
  page: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 30, gap: 13 },
  subtitle: { fontSize: 15, lineHeight: 23, color: 'rgba(16,26,20,.58)' },
  back: {
    color: c.accent700,
    fontSize: 15,
    fontWeight: '700',
    paddingVertical: 8,
  },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
  meta: { fontSize: 12.5, color: c.n600 },
  mini: { fontSize: 11.5, color: c.n600 },
  body: { fontSize: 14.5, lineHeight: 22, color: c.text },
});
const s = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 999,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 9,
  },
  secondary: {
    height: 48,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: c.divider,
  },
  disabled: { opacity: 0.5 },
  buttonText: { fontSize: 15, fontWeight: '800', color: c.bg },
  chip: {
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: c.divider,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: c.accent, borderColor: c.accent },
  chipText: { fontSize: 12.5, fontWeight: '700', color: c.n700 },
  field: { gap: 7, marginTop: 5 },
  label: { fontSize: 12, fontWeight: '700', color: c.n700 },
  input: {
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.divider,
    paddingHorizontal: 16,
    fontSize: 14,
    color: c.text,
  },
  price: {
    backgroundColor: c.accent200,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  free: { backgroundColor: c.violet200 },
  priceText: { fontSize: 11.5, fontWeight: '800', color: c.accent800 },
  cover: {
    width: 62,
    height: 86,
    borderRadius: 12,
    padding: 9,
    justifyContent: 'flex-end',
  },
  coverBig: { width: 168, height: 232, borderRadius: 22, padding: 20 },
  coverText: { fontWeight: '800', fontSize: 15 },
  row: {
    minHeight: 110,
    backgroundColor: c.surface,
    borderRadius: 28,
    padding: 12,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    ...shadow,
  },
  grow: { flex: 1, gap: 5 },
  title: { fontSize: 16, lineHeight: 19, fontWeight: '800', color: c.text },
  meta: { fontSize: 12.5, color: c.n600 },
  mini: { fontSize: 11.5, color: c.n600 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heart: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartText: { fontSize: 26, color: c.n400 },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  h2: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    color: c.text,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 58,
    paddingHorizontal: 24,
    gap: 13,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: c.accent200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    color: c.n600,
    lineHeight: 21,
  },
});
