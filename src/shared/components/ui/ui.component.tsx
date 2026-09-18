import React from 'react';
import {
  Image,
  Pressable,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Book } from 'shared/data';
import { useStyles } from './ui.styles';

export const price = (value: number) => (value ? `${value} ₴` : 'Даром');

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
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondaryButton,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[styles.buttonText, secondary && styles.secondaryButtonText]}
      >
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
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Field({
  label,
  compact = false,
  ...props
}: { label: string; compact?: boolean } & TextInputProps) {
  const styles = useStyles();
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={styles.colors.placeholder}
        style={[styles.input, compact && styles.compactInput]}
        {...props}
      />
    </View>
  );
}

export function PricePill({ value }: { value: number }) {
  const styles = useStyles();
  return (
    <View style={[styles.price, value === 0 && styles.free]}>
      <Text style={[styles.priceText, value === 0 && styles.freeText]}>
        {price(value)}
      </Text>
    </View>
  );
}

export function Cover({
  book,
  big = false,
}: {
  book: Pick<Book, 'title' | 'tone'> & { imageUrls?: string[] };
  big?: boolean;
}) {
  const styles = useStyles();
  const toneStyle =
    book.tone === 'accent'
      ? styles.coverAccent
      : book.tone === 'accent2'
      ? styles.coverViolet
      : styles.coverNeutral;
  const toneTextStyle =
    book.tone === 'accent'
      ? styles.coverTextAccent
      : book.tone === 'accent2'
      ? styles.coverTextViolet
      : styles.coverTextNeutral;

  return (
    <View style={[styles.cover, big && styles.coverBig, toneStyle]}>
      {book.imageUrls?.[0] ? (
        <Image
          source={{ uri: book.imageUrls[0] }}
          resizeMode="cover"
          style={styles.coverImage}
        />
      ) : (
        <Text style={[styles.coverText, toneTextStyle]}>
          {book.title
            .split(' ')
            .slice(0, 2)
            .map(word => word[0])
            .join('')}
        </Text>
      )}
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
  const styles = useStyles();
  return (
    <Pressable onPress={onOpen} style={styles.row}>
      <Cover book={book} />
      <View style={styles.grow}>
        <Text numberOfLines={2} style={styles.title}>
          {book.title}
        </Text>
        <Text style={styles.meta}>{book.author}</Text>
        <View style={styles.inline}>
          <PricePill value={book.price} />
          <Text style={styles.mini}>
            {book.condition} · {book.city}
          </Text>
        </View>
      </View>
      <Pressable
        hitSlop={styles.hitSlop}
        onPress={onHeart}
        style={styles.heart}
      >
        <Text style={[styles.heartText, favorite && styles.heartTextActive]}>
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
  const styles = useStyles();
  return (
    <View style={styles.heading}>
      <Text style={styles.h2}>{children}</Text>
      {right}
    </View>
  );
}

export function Empty({ text }: { text: string }) {
  const styles = useStyles();
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Text style={styles.heartText}>♡</Text>
      </View>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

export const useCommonStyles = useStyles;
