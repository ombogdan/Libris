import {
  BOOK_CATEGORIES,
  formatBooksCount,
  t,
  translateCategory,
} from 'shared/localization/i18n';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BookRow,
  Chip,
  Empty,
  ScreenHeader,
  useCommonStyles,
} from 'shared/components/ui';
import type { Book } from 'shared/data';
import { useAppStore } from 'store/AppStore';
import { useAuth } from 'providers/auth/AuthProvider';
import { useTheme } from 'shared/theme';
import type { FeedSort } from 'services/books';
import { FeedFiltersModal } from './components/feed-filters-modal';
import { useStyles } from './feed.styles';
import type { FeedScreenProps } from './feed.types';

const SORT_LABEL_KEYS: Record<FeedSort, string> = {
  recent: 'filters.sortRecent',
  price_asc: 'filters.sortPriceAsc',
  price_desc: 'filters.sortPriceDesc',
  distance: 'filters.sortDistance',
};

export function FeedScreen({ navigation }: FeedScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const common = useCommonStyles();
  const { theme } = useTheme();
  const store = useAppStore();
  const { profile } = useAuth();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const hasLocation = Boolean(profile?.latitude && profile?.longitude);
  const filters = store.feedFilters;

  const renderItem = useCallback(
    ({ item }: { item: Book }) => (
      <BookRow
        book={item}
        favorite={store.favs.includes(item.id)}
        onOpen={() =>
          navigation.getParent()?.navigate('Book', { bookId: item.id })
        }
        onHeart={() => store.toggleFav(item.id)}
      />
    ),
    [navigation, store],
  );

  const activeFilterCount = [
    filters.condition,
    filters.minPrice,
    filters.maxPrice,
    filters.radiusKm,
    filters.sort !== 'recent' ? filters.sort : null,
  ].filter(value => value !== null && value !== undefined).length;

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={t('feed.title')}
        right={<Chip label={profile?.city || t('common.city')} />}
      />

      <FlatList
        data={store.feedBooks}
        keyExtractor={book => book.id}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={[
          styles.page,
          !store.feedBooks.length && styles.emptyPage,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={store.feedLoading && Boolean(store.feedBooks.length)}
            onRefresh={() => void store.loadFeed()}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => void store.loadMoreFeed()}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <TextInput
              style={styles.search}
              value={filters.query}
              onChangeText={value => store.setFeedFilters({ query: value })}
              placeholder={t('feed.search')}
              placeholderTextColor={styles.colors.placeholder}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              <Chip
                label={t('feed.all')}
                active={!filters.category}
                onPress={() => store.setFeedFilters({ category: null })}
              />
              {BOOK_CATEGORIES.map(category => (
                <Chip
                  key={category}
                  label={translateCategory(category)}
                  active={filters.category === category}
                  onPress={() => store.setFeedFilters({ category })}
                />
              ))}
              <Chip
                label={t('feed.free')}
                active={filters.freeOnly}
                onPress={() =>
                  store.setFeedFilters({ freeOnly: !filters.freeOnly })
                }
              />
              <Chip
                label={
                  activeFilterCount
                    ? `${t('filters.button')} · ${activeFilterCount}`
                    : t('filters.button')
                }
                active={filtersOpen}
                onPress={() => setFiltersOpen(true)}
              />
            </ScrollView>
            <Text style={common.mini}>
              {t('feed.resultSummary', {
                books: formatBooksCount(store.feedBooks.length),
                sort: t(SORT_LABEL_KEYS[filters.sort]),
              })}
            </Text>
            {store.feedError ? (
              <Empty text={t('feed.loadError', { error: store.feedError })} />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          store.feedLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={theme.palette.accent} />
            </View>
          ) : store.feedError ? null : (
            <Empty text={t('feed.empty')} />
          )
        }
        ListFooterComponent={
          store.feedLoadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator color={theme.palette.accent} />
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      <FeedFiltersModal
        visible={filtersOpen}
        filters={filters}
        hasLocation={hasLocation}
        onClose={() => setFiltersOpen(false)}
        onApply={partial => {
          store.setFeedFilters(partial);
          setFiltersOpen(false);
        }}
        onReset={() => {
          store.setFeedFilters({
            condition: null,
            minPrice: null,
            maxPrice: null,
            radiusKm: null,
            sort: 'recent',
          });
          setFiltersOpen(false);
        }}
      />
    </View>
  );
}
