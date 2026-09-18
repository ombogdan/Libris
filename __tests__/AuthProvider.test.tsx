import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { AuthProvider, useAuth } from '../src/auth/AuthProvider';
import { supabase } from '../src/services/supabase';

jest.mock('../src/services/supabase', () => ({
  supabase: {
    auth: { getSession: jest.fn(), onAuthStateChange: jest.fn() },
    from: jest.fn(),
  },
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const session = { user: { id: 'reader' } } as Session;
const profile = { id: 'reader', onboarding_completed: true };
let state: ReturnType<typeof useAuth>;
let listener: (event: AuthChangeEvent, value: Session | null) => unknown;
let renderer: ReactTestRenderer;
const unsubscribe = jest.fn();
const getSession = jest.mocked(supabase.auth.getSession);
const from = jest.mocked(supabase.from);

function Consumer() {
  state = useAuth();
  return null;
}

async function mount() {
  await act(async () => {
    renderer = create(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );
  });
}

function query(result: Promise<unknown>) {
  from.mockReturnValue({
    select: () => ({ eq: () => ({ maybeSingle: () => result }) }),
  } as unknown as ReturnType<typeof supabase.from>);
}

beforeEach(() => {
  jest.clearAllMocks();
  getSession.mockResolvedValue({ data: { session: null }, error: null });
  jest.mocked(supabase.auth.onAuthStateChange).mockImplementation(callback => {
    listener = callback;
    return { data: { subscription: { id: 'test', callback, unsubscribe } } };
  });
  query(Promise.resolve({ data: profile, error: null }));
});

afterEach(async () => {
  await act(async () => renderer.unmount());
  jest.restoreAllMocks();
});

test('finishes startup without a saved session', async () => {
  await mount();
  expect(state.isLoading).toBe(false);
  expect(state.session).toBeNull();
  expect(from).not.toHaveBeenCalled();
});

test('releases the auth callback before querying a profile and waits for that profile', async () => {
  const response = deferred<{ data: typeof profile; error: null }>();
  query(response.promise);
  await mount();

  await act(async () => {
    expect(listener('SIGNED_IN', session)).toBeUndefined();
    expect(from).not.toHaveBeenCalled();
  });
  expect(state.isLoading).toBe(true);

  await act(async () => response.resolve({ data: profile, error: null }));
  expect(state.profile).toEqual(profile);
  expect(state.isLoading).toBe(false);

  await act(async () => {
    listener('TOKEN_REFRESHED', { ...session });
  });
  expect(from).toHaveBeenCalledTimes(1);
});

test('restores a saved session and profile', async () => {
  getSession.mockResolvedValue({ data: { session }, error: null });
  await mount();
  expect(state.session).toBe(session);
  expect(state.profile).toEqual(profile);
  expect(state.isLoading).toBe(false);
});

test('stops loading if restoring the session rejects', async () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  getSession.mockRejectedValue(new Error('Storage failed'));
  await mount();
  expect(state.isLoading).toBe(false);
  expect(warn).toHaveBeenCalled();
});

test.each(['returned', 'thrown'])(
  'stops loading for a %s profile error',
  async kind => {
    const response = deferred<unknown>();
    query(response.promise);
    getSession.mockResolvedValue({ data: { session }, error: null });
    await mount();
    await act(async () => {
      if (kind === 'returned') {
        response.resolve({ data: null, error: { message: 'Profile failed' } });
      } else {
        response.reject(new Error('Profile failed'));
      }
    });
    expect(state.isLoading).toBe(false);
    expect(state.profileError).toBe('Profile failed');
  },
);

test('ignores a stale session restore after a newer auth event', async () => {
  const restore =
    deferred<Awaited<ReturnType<typeof supabase.auth.getSession>>>();
  getSession.mockReturnValue(restore.promise);
  await mount();
  await act(async () => {
    listener('SIGNED_IN', session);
  });
  await act(async () =>
    restore.resolve({ data: { session: null }, error: null }),
  );
  expect(state.session).toBe(session);
  expect(state.profile).toEqual(profile);
});

test('ignores a pending profile after sign-out', async () => {
  const response = deferred<unknown>();
  query(response.promise);
  getSession.mockResolvedValue({ data: { session }, error: null });
  await mount();
  await act(async () => {
    listener('SIGNED_OUT', null);
  });
  await act(async () => response.resolve({ data: profile, error: null }));
  expect(state.session).toBeNull();
  expect(state.profile).toBeNull();
  expect(state.isLoading).toBe(false);
});

test('refreshes the profile after onboarding', async () => {
  getSession.mockResolvedValue({ data: { session }, error: null });
  query(
    Promise.resolve({
      data: { ...profile, onboarding_completed: false },
      error: null,
    }),
  );
  await mount();
  query(Promise.resolve({ data: profile, error: null }));
  await act(async () => state.refreshProfile());
  expect(state.profile?.onboarding_completed).toBe(true);
});
