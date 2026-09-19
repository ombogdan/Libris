import React, { useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { ListRow } from 'shared/components/list-row';
import {
  ProfileEditModal,
  useProfileEditor,
} from 'shared/components/profile-edit-modal';
import { ScreenHeader } from 'shared/components/ui';
import { setLocalePreference, t, useLocale } from 'shared/localization/i18n';
import type { LocalePreference } from 'shared/localization/i18n';
import { useAuth } from 'providers/auth/AuthProvider';
import { deleteAccount } from 'services/auth';
import { useAppStore } from 'store/AppStore';
import { DeleteAccountModal } from './components/delete-account-modal';
import { SettingsSection } from './components/settings-section';
import { useStyles } from './settings.styles';
import type { SettingsScreenProps } from './settings.types';

type NotificationKey = 'notify_messages' | 'notify_reviews';

const LANGUAGE_OPTIONS: { value: LocalePreference; label?: string }[] = [
  { value: 'system' },
  { value: 'uk', label: 'Українська' },
  { value: 'en', label: 'English' },
];

const NOTIFICATION_OPTIONS: { key: NotificationKey; labelKey: string }[] = [
  { key: 'notify_messages', labelKey: 'settings.notifications.messages' },
  { key: 'notify_reviews', labelKey: 'settings.notifications.reviews' },
];

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const store = useAppStore();
  const { session, profile, updateProfile } = useAuth();
  const { preference } = useLocale();
  const editor = useProfileEditor();
  const [pendingNotifications, setPendingNotifications] = useState<
    Partial<Record<NotificationKey, boolean>>
  >({});
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const name =
    profile?.display_name.trim() ||
    session?.user.email?.split('@')[0] ||
    t('common.user');
  const phone = profile?.phone || t('common.notSpecified');

  const isNotificationEnabled = (key: NotificationKey) =>
    pendingNotifications[key] ?? profile?.[key] ?? true;

  const setNotification = async (key: NotificationKey, enabled: boolean) => {
    // Show the new value right away and fall back if saving fails.
    setPendingNotifications(current => ({ ...current, [key]: enabled }));

    try {
      await updateProfile({ [key]: enabled });
    } catch {
      store.notify(t('settings.notifications.saveError'));
    } finally {
      setPendingNotifications(current => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteVisible(false);
      setDeleteError(null);
    }
  };

  const confirmDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      // Signing out at the end unmounts this screen.
      await deleteAccount();
      store.notify(t('settings.deleteAccount.done'));
    } catch {
      setDeleteError(t('settings.deleteAccount.error'));
      setIsDeleting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title={t('settings.title')} onBack={navigation.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}
      >
        <SettingsSection title={t('settings.profile.title')}>
          <ListRow
            label={t('profile.name')}
            value={name}
            onPress={() => editor.open('display_name')}
          />
          <ListRow
            label={t('profile.phone')}
            value={phone}
            onPress={() => editor.open('phone')}
            isLast
          />
        </SettingsSection>

        <SettingsSection title={t('settings.language.title')}>
          {LANGUAGE_OPTIONS.map((option, index) => (
            <ListRow
              key={option.value}
              label={option.label ?? t('settings.language.system')}
              showChevron={false}
              isLast={index === LANGUAGE_OPTIONS.length - 1}
              onPress={() => void setLocalePreference(option.value)}
              accessory={
                preference === option.value ? (
                  <Ionicons
                    name="checkmark"
                    size={styles.checkSize}
                    color={styles.colors.accent}
                  />
                ) : null
              }
            />
          ))}
        </SettingsSection>

        <SettingsSection
          title={t('settings.notifications.title')}
          footnote={t('settings.notifications.footnote')}
        >
          {NOTIFICATION_OPTIONS.map((option, index) => {
            const enabled = isNotificationEnabled(option.key);
            const isSaving = option.key in pendingNotifications;

            return (
              <ListRow
                key={option.key}
                label={t(option.labelKey)}
                disabled={isSaving}
                isLast={index === NOTIFICATION_OPTIONS.length - 1}
                onPress={() => void setNotification(option.key, !enabled)}
                showChevron={false}
                accessory={
                  <Switch
                    value={enabled}
                    disabled={isSaving}
                    onValueChange={value =>
                      void setNotification(option.key, value)
                    }
                    trackColor={{
                      false: styles.colors.switchTrack,
                      true: styles.colors.accent,
                    }}
                    thumbColor={styles.colors.switchThumb}
                    ios_backgroundColor={styles.colors.switchTrack}
                  />
                }
              />
            );
          })}
        </SettingsSection>

        <SettingsSection title={t('settings.privacy.title')}>
          <ListRow
            label={t('moderation.blockedUsersTitle')}
            value={String(store.blockedUserIds.length)}
            onPress={() => navigation.navigate('BlockedUsers')}
            isLast
          />
        </SettingsSection>

        <SettingsSection title={t('settings.account.title')}>
          <ListRow
            danger
            label={t('settings.deleteAccount.action')}
            showChevron={false}
            onPress={() => setDeleteVisible(true)}
            isLast
          />
        </SettingsSection>
      </ScrollView>

      <ProfileEditModal {...editor.modalProps} />

      <DeleteAccountModal
        visible={deleteVisible}
        isDeleting={isDeleting}
        error={deleteError}
        onClose={closeDeleteModal}
        onConfirm={() => void confirmDeleteAccount()}
      />
    </View>
  );
}
