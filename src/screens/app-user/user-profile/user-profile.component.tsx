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

import { BookRow, Button, ScreenHeader } from 'shared/components/ui';
import type { Book } from 'shared/data';
import {
  formatListingsCount,
  formatRating,
  t,
} from 'shared/localization/i18n';
import {
  fetchPublicUserListings,
  fetchPublicUserProfile,
} from 'services/profiles';
import { fetchUserReviews } from 'services/reviews';
import type {
  PublicUserProfile,
  UserReviewDetail,
} from 'services/supabase/database.types';
import { useTheme } from 'shared/theme';
import { useAppStore } from 'store/AppStore';
import { ReviewItem } from '../user-reviews/components/review-item';
import type { UserReviewListItem } from '../user-reviews/user-reviews.types';
import { useStyles } from './user-profile.styles';
import type { UserProfileScreenProps } from './user-profile.types';

const TONES: Book['tone'][] = ['accent', 'accent2', 'neutral'];

function toReview(row: UserReviewDetail): UserReviewListItem {
  return {
    id: row.id,
    reviewerName: row.reviewer_name,
    reviewerAvatarUrl: row.reviewer_avatar_url,
    rating: row.rating,
    comment: row.comment || null,
    listingTitle: row.listing_title,
    createdAt: row.created_at,
  };
}

export function UserProfileScreen({
  navigation,
  route,
}: UserProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const { theme } = useTheme();
  const store = useAppStore();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [listings, setListings] = useState<Book[]>([]);
  const [reviews, setReviews] = useState<UserReviewListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(
    async (refresh = false) => {
      refresh ? setRefreshing(true) : setLoading(true);
      setError(false);

      try {
        const [nextProfile, rows, reviewRows] = await Promise.all([
          fetchPublicUserProfile(route.params.userId),
          fetchPublicUserListings(route.params.userId),
          fetchUserReviews(route.params.userId),
        ]);

        if (!nextProfile) {
          setProfile(null);
          setListings([]);
          setReviews([]);
          setError(true);
          return;
        }

        setProfile(nextProfile);
        setListings(
          rows.map((row, index) => ({
            id: row.id,
            title: row.title,
            author: row.author,
            year: '',
            price: row.price,
            cat: row.category,
            condition: row.condition,
            city: row.city,
            latitude: row.latitude,
            longitude: row.longitude,
            seller: nextProfile.display_name || t('common.user'),
            sellerId: nextProfile.id,
            sellerAvatarUrl: nextProfile.avatar_url,
            rating: nextProfile.review_count
              ? formatRating(nextProfile.rating_average)
              : '—',
            reviewsCount: nextProfile.review_count,
            sellerAds: formatListingsCount(nextProfile.listings_count),
            tone: TONES[index % TONES.length],
            about: row.description,
            imageUrls: row.image_urls.length
              ? row.image_urls
              : row.cover_url
              ? [row.cover_url]
              : [],
            status: 'active',
            createdAt: row.created_at,
          })),
        );
        setReviews(reviewRows.slice(0, 2).map(toReview));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [route.params.userId],
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const openReviews = () =>
    navigation.navigate('UserReviews', {
      userId: route.params.userId,
      displayName: profile?.display_name || route.params.displayName,
    });

  const renderListing = useCallback(
    ({ item }: { item: Book }) => (
      <BookRow
        book={item}
        favorite={store.favs.includes(item.id)}
        onOpen={() => navigation.navigate('Book', { bookId: item.id })}
        onHeart={() => store.toggleFav(item.id)}
      />
    ),
    [navigation, store],
  );

  const displayName =
    profile?.display_name || route.params.displayName || t('common.user');
  const initial = displayName.trim().charAt(0).toUpperCase() || '?';
  const memberYear = profile
    ? new Date(profile.created_at).getFullYear().toString()
    : '';

  if (loading && !profile) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title={t('userProfile.title')} onBack={navigation.goBack} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.palette.accent} />
          <Text style={styles.stateText}>{t('userProfile.loading')}</Text>
        </View>
      </View>
    );
  }

  if (error && !profile) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title={t('userProfile.title')} onBack={navigation.goBack} />
        <View style={styles.centered}>
          <Text style={styles.stateText}>{t('userProfile.loadError')}</Text>
          <Button secondary label={t('common.retry')} onPress={() => void load()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title={t('userProfile.title')} onBack={navigation.goBack} />
      <FlatList
        data={listings}
        keyExtractor={item => item.id}
        renderItem={renderListing}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.page}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load(true)}
            colors={[theme.palette.accent]}
            tintColor={theme.palette.accent}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                {profile?.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{initial}</Text>
                )}
              </View>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.details}>
                {profile?.city || t('common.notSpecified')} ·{' '}
                {t('userProfile.memberSince', { year: memberYear })}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={openReviews}
                style={styles.stats}
              >
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {profile?.review_count
                      ? `★ ${formatRating(profile.rating_average)}`
                      : '—'}
                  </Text>
                  <Text style={styles.statLabel}>{t('userProfile.rating')}</Text>
                </View>
                <View style={[styles.stat, styles.statBorder]}>
                  <Text style={styles.statValue}>{profile?.review_count ?? 0}</Text>
                  <Text style={styles.statLabel}>{t('userProfile.reviews')}</Text>
                </View>
                <View style={[styles.stat, styles.statBorder]}>
                  <Text style={styles.statValue}>{profile?.listings_count ?? 0}</Text>
                  <Text style={styles.statLabel}>{t('userProfile.listings')}</Text>
                </View>
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('userProfile.recentReviews')}</Text>
              <Pressable accessibilityRole="button" onPress={openReviews}>
                <Text style={styles.sectionAction}>{t('userProfile.allReviews')}</Text>
              </Pressable>
            </View>
            {reviews.length ? (
              <View style={styles.reviews}>
                {reviews.map(review => <ReviewItem key={review.id} review={review} />)}
              </View>
            ) : (
              <View style={styles.emptyListings}>
                <Text style={styles.emptyText}>{t('reviews.empty')}</Text>
              </View>
            )}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('userProfile.activeListings')}</Text>
              <Text style={styles.details}>
                {formatListingsCount(profile?.listings_count ?? 0)}
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyListings}>
            <Text style={styles.emptyText}>{t('userProfile.noListings')}</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
