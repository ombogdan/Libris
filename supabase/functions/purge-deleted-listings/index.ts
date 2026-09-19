import {
  createClient,
  type SupabaseClient,
} from 'npm:@supabase/supabase-js@2.109.0';

const FUNCTION_NAME = 'purge-deleted-listings';
const STORAGE_BUCKET = 'book-images';
const DEFAULT_BATCH_SIZE = 25;
const MAX_BATCH_SIZE = 100;

type PurgeJob = {
  listing_id: string;
  storage_paths: string[] | null;
};

type PurgeFailure = {
  listingId: string;
  error: string;
};

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

const timingSafeEqual = (left: string, right: string) => {
  const encoder = new TextEncoder();
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);

  if (leftBytes.length !== rightBytes.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < leftBytes.length; index += 1) {
    difference |= leftBytes[index] ^ rightBytes[index];
  }

  return difference === 0;
};

const parseBatchSize = async (request: Request) => {
  let requestedLimit: unknown;

  try {
    const body = await request.json();
    requestedLimit = body?.limit;
  } catch {
    requestedLimit = undefined;
  }

  const fallback = Number(Deno.env.get('PURGE_BATCH_SIZE'));
  const parsed = Number(requestedLimit ?? fallback ?? DEFAULT_BATCH_SIZE);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_BATCH_SIZE;
  }

  return Math.max(1, Math.min(Math.trunc(parsed), MAX_BATCH_SIZE));
};

const normalizeStoragePaths = (paths: string[] | null) => {
  const normalizedPaths = [...new Set(paths ?? [])]
    .map(path => path.trim())
    .filter(Boolean);

  for (const path of normalizedPaths) {
    const segments = path.split('/');

    if (
      path.startsWith('/') ||
      path.endsWith('/') ||
      segments.some(segment => !segment || segment === '.' || segment === '..')
    ) {
      throw new Error('The purge job contains an invalid storage path');
    }
  }

  return normalizedPaths;
};

const assertObjectsRemoved = async (
  supabase: SupabaseClient,
  storagePaths: string[],
) => {
  for (const storagePath of storagePaths) {
    const segments = storagePath.split('/');
    const fileName = segments.pop();
    const folder = segments.join('/');

    if (!fileName) {
      throw new Error('The purge job contains an invalid storage path');
    }

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(folder, {
        limit: 100,
        search: fileName,
      });

    if (error) {
      throw new Error(
        `Could not verify deleted storage object: ${error.message}`,
      );
    }

    if (data?.some(object => object.name === fileName)) {
      throw new Error('A storage object still exists after the delete request');
    }
  }
};

const removeListingImages = async (
  supabase: SupabaseClient,
  storagePaths: string[],
) => {
  if (!storagePaths.length) {
    return;
  }

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove(storagePaths);

  if (error) {
    throw new Error(`Could not delete listing images: ${error.message}`);
  }

  await assertObjectsRemoved(supabase, storagePaths);
};

const recordFailure = async (
  supabase: SupabaseClient,
  listingId: string,
  message: string,
) => {
  const { error } = await supabase.rpc('record_listing_purge_failure', {
    p_listing_id: listingId,
    p_error: message,
  });

  if (error) {
    console.error(`[${FUNCTION_NAME}] Could not release failed job`, {
      listingId,
      error: error.message,
    });
  }
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown purge error';

Deno.serve(async request => {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let supabaseUrl: string;
  let serviceRoleKey: string;
  let expectedSecret: string;

  try {
    supabaseUrl = getRequiredEnv('SUPABASE_URL');
    serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    expectedSecret = getRequiredEnv('PURGE_DELETED_LISTINGS_SECRET');
  } catch (error) {
    console.error(`[${FUNCTION_NAME}] Invalid function configuration`);
    return jsonResponse({ error: getErrorMessage(error) }, 500);
  }

  const providedSecret = request.headers.get('x-purge-secret') ?? '';

  if (!timingSafeEqual(providedSecret, expectedSecret)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const batchSize = await parseBatchSize(request);
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error: claimError } = await supabase.rpc(
    'claim_listing_purge_batch',
    { p_limit: batchSize },
  );

  if (claimError) {
    console.error(`[${FUNCTION_NAME}] Could not claim purge jobs`, {
      error: claimError.message,
    });
    return jsonResponse({ error: 'Could not claim purge jobs' }, 500);
  }

  const jobs = (data ?? []) as PurgeJob[];
  const failures: PurgeFailure[] = [];
  let purged = 0;

  for (const job of jobs) {
    try {
      const storagePaths = normalizeStoragePaths(job.storage_paths);
      await removeListingImages(supabase, storagePaths);

      const { data: finalized, error: finalizeError } = await supabase.rpc(
        'finalize_listing_purge',
        { p_listing_id: job.listing_id },
      );

      if (finalizeError) {
        throw new Error(
          `Could not finalize listing purge: ${finalizeError.message}`,
        );
      }

      if (finalized !== true) {
        throw new Error('Listing is no longer eligible for purge');
      }

      purged += 1;
    } catch (error) {
      const message = getErrorMessage(error);
      failures.push({ listingId: job.listing_id, error: message });
      await recordFailure(supabase, job.listing_id, message);
    }
  }

  return jsonResponse({
    claimed: jobs.length,
    purged,
    failed: failures.length,
    failures,
  });
});
