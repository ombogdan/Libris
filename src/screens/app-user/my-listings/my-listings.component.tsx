import React, { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Empty, ScreenHeader } from 'shared/components/ui';
import { useAppStore } from 'store/AppStore';
import { ListingItem } from './components/listing-item';
import { MarkSoldModal } from './components/mark-sold-modal';
import { useStyles } from './my-listings.styles';
import type { MyListingsScreenProps } from './my-listings.types';

export function MyListingsScreen({ navigation }: MyListingsScreenProps) {
  const insets = useSafeAreaInsets();
  const store = useAppStore();
  const styles = useStyles({ bottomInset: insets.bottom });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [sellingBookId, setSellingBookId] = useState<string | null>(null);

  const errorText = (error: unknown, fallback: string) =>
    error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : fallback;

  const updateStatus = async (
    id: string,
    status: 'active' | 'sold',
    conversationId: string | null = null,
  ) => {
    if (busyId) {
      return;
    }
    setBusyId(id);
    try {
      await store.setListingStatus(id, status, conversationId);
      setSellingBookId(null);
      store.notify(
        status === 'sold'
          ? 'Книгу позначено проданою'
          : 'Оголошення знову активне',
      );
    } catch (error) {
      store.notify(errorText(error, 'Не вдалося змінити статус.'));
    } finally {
      setBusyId(null);
    }
  };

  const confirmStatusChange = (id: string, isSold: boolean) => {
    if (isSold) {
      void updateStatus(id, 'active');
      return;
    }

    setSellingBookId(id);
  };

  const deleteListing = async (id: string) => {
    if (busyId) {
      return;
    }
    setBusyId(id);
    try {
      await store.deleteListing(id);
      store.notify('Оголошення перенесено до архіву');
    } catch (error) {
      store.notify(errorText(error, 'Не вдалося видалити оголошення.'));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      'Видалити оголошення?',
      'Оголошення зникне зі стрічки й профілю. Чати залишаться в архіві, а оголошення, фото та переписки остаточно видаляться через 3 місяці.',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: () => void deleteListing(id),
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Мої оголошення" onBack={navigation.goBack} />
      <ScrollView
        contentContainerStyle={styles.page}
        showsVerticalScrollIndicator={false}
      >
        {store.ads.length ? (
          store.ads.map(ad => (
            <ListingItem
              key={ad.id}
              ad={ad}
              disabled={busyId === ad.id}
              onEdit={() =>
                navigation.navigate('EditListing', { bookId: ad.id })
              }
              onToggleStatus={() =>
                confirmStatusChange(ad.id, ad.status === 'Продано')
              }
              onDelete={() => confirmDelete(ad.id)}
            />
          ))
        ) : (
          <Empty text="У тебе ще немає оголошень." />
        )}
        <Button
          secondary
          label="Додати ще книгу"
          onPress={() => navigation.navigate('Tabs', { screen: 'Add' })}
        />
      </ScrollView>
      <MarkSoldModal
        visible={Boolean(sellingBookId)}
        listingTitle={
          store.books.find(book => book.id === sellingBookId)?.title ?? ''
        }
        conversations={store.chats
          .filter(
            chat =>
              chat.listingId === sellingBookId &&
              chat.section === 'selling' &&
              Boolean(chat.lastMessageAt),
          )
          .map(chat => ({
            conversationId: chat.id,
            name: chat.name,
            avatarUrl: chat.avatarUrl,
          }))}
        isSaving={Boolean(sellingBookId && busyId === sellingBookId)}
        onClose={() => setSellingBookId(null)}
        onSelect={conversationId => {
          if (sellingBookId) {
            void updateStatus(sellingBookId, 'sold', conversationId);
          }
        }}
      />
    </View>
  );
}
