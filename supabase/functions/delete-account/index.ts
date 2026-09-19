import {
  createClient,
  type SupabaseClient,
} from 'npm:@supabase/supabase-js@2.109.0';

const FUNCTION_NAME = 'delete-account';
const STORAGE_BUCKET = 'book-images';
const PAGE_SIZE = 100;
const MAX_FOLDER_DEPTH = 4;

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const getRequiredEnv = (name: string) => {
  const value = Deno.env.get(name)?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const getBearerToken = (request: Request) => {
  const match = /^Bearer\s+(.+)$/i.exec(
    request.headers.get('authorization') ?? '',
  );

  return match?.[1]?.trim() || null;
};

// Lists every object below `prefix`. Folders come back without an `id`.
const listObjectPaths = async (
  supabase: SupabaseClient,
  prefix: string,
  depth = 0,
): Promise<string[]> => {
  if (depth > MAX_FOLDER_DEPTH) {
    throw new Error('Storage folder nesting is deeper than expected');
  }

  const paths: string[] = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(prefix, { limit: PAGE_SIZE, offset });

    if (error) {
      throw new Error(`Could not list storage objects: ${error.message}`);
    }

    for (const entry of data ?? []) {
      const path = `${prefix}/${entry.name}`;

      if (entry.id) {
        paths.push(path);
      } else {
        paths.push(...(await listObjectPaths(supabase, path, depth + 1)));
      }
    }

    if ((data?.length ?? 0) < PAGE_SIZE) {
      return paths;
    }
  }
};

const removeUserImages = async (supabase: SupabaseClient, userId: string) => {
  const paths = await listObjectPaths(supabase, userId);

  for (let index = 0; index < paths.length; index += PAGE_SIZE) {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(paths.slice(index, index + PAGE_SIZE));

    if (error) {
      throw new Error(`Could not delete storage objects: ${error.message}`);
    }
  }

  // Never delete the account while some of its files could still be served.
  const remaining = await listObjectPaths(supabase, userId);

  if (remaining.length) {
    throw new Error('Storage objects still exist after the delete request');
  }
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown error';

Deno.serve(async request => {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let supabaseUrl: string;
  let serviceRoleKey: string;

  try {
    supabaseUrl = getRequiredEnv('SUPABASE_URL');
    serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  } catch (error) {
    console.error(`[${FUNCTION_NAME}] Invalid function configuration`);
    return jsonResponse({ error: getErrorMessage(error) }, 500);
  }

  const token = getBearerToken(request);

  if (!token) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // The caller can only ever delete the account their own token belongs to.
  const { data: userData, error: userError } = await supabase.auth.getUser(
    token,
  );

  if (userError || !userData.user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const userId = userData.user.id;

  try {
    // Storage first: it is retryable, while deleting the user is not. Database
    // rows (profile, listings, chats, reviews, ...) cascade from auth.users.
    await removeUserImages(supabase, userId);

    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      throw new Error(`Could not delete the user: ${deleteError.message}`);
    }
  } catch (error) {
    console.error(`[${FUNCTION_NAME}] Account deletion failed`, {
      userId,
      error: getErrorMessage(error),
    });
    return jsonResponse({ error: 'Could not delete the account' }, 500);
  }

  return jsonResponse({ deleted: true });
});
