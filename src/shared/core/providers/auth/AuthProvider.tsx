import { t } from 'shared/localization/i18n';
import React, {
  createContext,
  useCallback,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from 'services/supabase';
import type { Profile } from 'services/supabase/database.types';

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  profileError: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (
    changes: Partial<
      Pick<
        Profile,
        'display_name' | 'phone' | 'city' | 'latitude' | 'longitude'
      >
    >,
  ) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [profileUserId, setProfileUserId] = useState<string>();
  const profileRequest = useRef(0);
  const [profileError, setProfileError] = useState<string | null>(null);
  const sessionUserId = session?.user.id;
  const isLoading = isSessionLoading || profileUserId !== sessionUserId;

  const loadProfile = useCallback(async (userId?: string) => {
    const request = ++profileRequest.current;

    if (!userId) {
      setProfile(null);
      setProfileError(null);
      setProfileUserId(undefined);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (request === profileRequest.current) {
        setProfile(data);
        setProfileError(null);
      }
    } catch (error) {
      if (request === profileRequest.current) {
        setProfile(null);
        setProfileError(
          error && typeof error === 'object' && 'message' in error
            ? String(error.message)
            : t('profile.loadError'),
        );
      }
    } finally {
      if (request === profileRequest.current) {
        setProfileUserId(userId);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let authEventReceived = false;

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!mounted) {
          return;
        }

        // Supabase awaits this callback; query the profile in a separate effect.
        authEventReceived = true;
        setSession(nextSession);
        setIsSessionLoading(false);
      },
    );

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted || authEventReceived) {
          return;
        }

        if (error) {
          console.warn('Unable to restore Supabase session:', error.message);
        }

        setSession(data.session);
        setIsSessionLoading(false);
      })
      .catch((error: unknown) => {
        if (mounted && !authEventReceived) {
          console.warn('Unable to restore Supabase session:', error);
          setIsSessionLoading(false);
        }
      });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    loadProfile(sessionUserId);

    return () => {
      // Ignore a response after sign-out, an account switch, or unmount.
      profileRequest.current += 1;
    };
  }, [loadProfile, sessionUserId]);

  const refreshProfile = useCallback(
    async () => loadProfile(session?.user.id),
    [loadProfile, session?.user.id],
  );

  const updateProfile = useCallback(
    async (
      changes: Partial<
        Pick<
          Profile,
          'display_name' | 'phone' | 'city' | 'latitude' | 'longitude'
        >
      >,
    ) => {
      if (!sessionUserId) {
        throw new Error(t('profile.authRequired'));
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(changes)
        .eq('id', sessionUserId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      setProfileError(null);
    },
    [sessionUserId],
  );

  const value = useMemo(
    () => ({
      session,
      profile,
      isLoading,
      profileError,
      refreshProfile,
      updateProfile,
    }),
    [session, profile, isLoading, profileError, refreshProfile, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
}
