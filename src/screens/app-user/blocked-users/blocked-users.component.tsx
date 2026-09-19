import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Empty, ScreenHeader } from 'shared/components/ui';
import { t } from 'shared/localization/i18n';
import { fetchBlockedUserProfiles } from 'services/moderation';
import type { BlockedUserProfile } from 'services/supabase/database.types';
import { useTheme } from 'shared/theme';
import { useAppStore } from 'store/AppStore';
import { useStyles } from './blocked-users.styles';
import type { BlockedUsersScreenProps } from './blocked-users.types';

export function BlockedUsersScreen({ navigation }: BlockedUsersScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const { theme } = useTheme();
  const store = useAppStore();
  const [users, setUsers] = useState<BlockedUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError(false);
    try {
      const rows = await fetchBlockedUserProfiles();
      setUsers(rows);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const unblock = useCallback(
    async (userId: string) => {
      setUnblockingId(userId);
      try {
        await store.unblockUser(userId);
        setUsers(current => current.filter(user => user.blocked_id !== userId));
        store.notify(t('moderation.unblocked'));
      } catch (unblockError) {
        store.notify(
          unblockError &&
            typeof unblockError === 'object' &&
            'message' in unblockError
            ? String(unblockError.message)
            : t('moderation.unblockError'),
        );
      } finally {
        setUnblockingId(null);
      }
    },
    [store],
  );

  const renderItem = useCallback(
    ({ item }: { item: BlockedUserProfile }) => {
      const initial = item.display_name.trim().charAt(0).toUpperCase() || '?';
      const isUnblocking = unblockingId === item.blocked_id;

      return (
        <View style={styles.row}>
          <View style={styles.avatar}>
            {item.avatar_url ? (
              <Image
                source={{ uri: item.avatar_url }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
          </View>
          <Text numberOfLines={1} style={styles.name}>
            {item.display_name || t('common.user')}
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={isUnblocking}
            onPress={() => void unblock(item.blocked_id)}
            style={[
              styles.unblockButton,
              isUnblocking && styles.unblockButtonDisabled,
            ]}
          >
            <Text style={styles.unblockButtonText}>
              {t('moderation.unblock')}
            </Text>
          </Pressable>
        </View>
      );
    },
    [styles, unblock, unblockingId],
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={t('moderation.blockedUsersTitle')}
        onBack={navigation.goBack}
      />
      <FlatList
        data={users}
        keyExtractor={item => item.blocked_id}
        renderItem={renderItem}
        contentContainerStyle={styles.page}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load(true)}
            colors={[theme.palette.accent]}
            tintColor={theme.palette.accent}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={theme.palette.accent} />
            </View>
          ) : error ? (
            <View style={styles.centered}>
              <Empty text={t('moderation.loadError')} />
              <Button
                secondary
                label={t('common.retry')}
                onPress={() => void load()}
              />
            </View>
          ) : (
            <View style={styles.centered}>
              <Empty text={t('moderation.blockedUsersEmpty')} />
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
