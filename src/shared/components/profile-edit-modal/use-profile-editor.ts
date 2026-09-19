import { useMemo, useState } from 'react';

import { useAuth } from 'providers/auth/AuthProvider';
import { getCityCenter } from 'services/location';
import { t } from 'shared/localization/i18n';
import type {
  EditableProfileField,
  ProfileEditModalProps,
} from './profile-edit-modal.types';

// Drives ProfileEditModal: which field is open, validation and saving.
export function useProfileEditor() {
  const { profile, updateProfile } = useAuth();
  const [field, setField] = useState<EditableProfileField | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const initialValue = useMemo(() => {
    if (field === 'display_name') {
      return profile?.display_name || '';
    }
    if (field === 'city') {
      return profile?.city || '';
    }
    if (field === 'phone') {
      return profile?.phone || '+380';
    }
    return '';
  }, [field, profile?.city, profile?.display_name, profile?.phone]);

  const open = (nextField: EditableProfileField) => {
    setError('');
    setField(nextField);
  };

  const close = () => {
    if (!isSaving) {
      setError('');
      setField(null);
    }
  };

  const save = async (value: string) => {
    if (!field) {
      return;
    }

    const trimmedValue = value.trim();
    setError('');
    setIsSaving(true);

    try {
      if (field === 'display_name') {
        if (trimmedValue.length < 2) {
          throw new Error(t('profile.nameError'));
        }
        await updateProfile({ display_name: trimmedValue });
      }

      if (field === 'phone') {
        const digits = trimmedValue.replace(/\D/g, '');
        if (digits.length !== 12 || !digits.startsWith('380')) {
          throw new Error(t('profile.phoneError'));
        }
        await updateProfile({ phone: `+${digits}` });
      }

      if (field === 'city') {
        if (trimmedValue.length < 2) {
          throw new Error(t('profile.cityError'));
        }
        const location = await getCityCenter(trimmedValue);
        if (!location) {
          throw new Error(t('listingForm.cityNotFound'));
        }
        await updateProfile({
          city: location.city,
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }

      setField(null);
    } catch (saveError) {
      setError(
        saveError && typeof saveError === 'object' && 'message' in saveError
          ? String(saveError.message)
          : t('profile.updateError'),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const modalProps: ProfileEditModalProps = {
    visible: field !== null,
    field,
    initialValue,
    isSaving,
    error,
    onClose: close,
    onSave: save,
  };

  return { open, modalProps };
}
