import {
  createClient,
  type SupabaseClient,
} from 'npm:@supabase/supabase-js@2.109.0';

// Called by a Database Webhook (Database → Webhooks in the dashboard) on
// INSERT into public.chat_messages. Looks up the conversation's other
// participant, and — if they have push enabled and a registered device —
// sends them an FCM data message via the HTTP v1 API.
const FUNCTION_NAME = 'send-message-push';
const FCM_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const MESSAGE_PREVIEW_LENGTH = 120;

type ChatMessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
};

type WebhookPayload = {
  type: string;
  table: string;
  record: ChatMessageRow;
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

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown push error';

const base64Url = (bytes: Uint8Array) => {
  let binary = '';
  bytes.forEach(byte => (binary += String.fromCharCode(byte)));
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const pemToPkcs8 = (pem: string) => {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

// Exchanges the Firebase service account for a short-lived FCM access token
// (the OAuth2 JWT-bearer flow), signed with the Web Crypto API — no
// firebase-admin dependency needed inside the Edge Function's Deno runtime.
const getFcmAccessToken = async (
  clientEmail: string,
  privateKeyPem: string,
) => {
  const header = { alg: 'RS256', typ: 'JWT' };
  const issuedAt = Math.floor(Date.now() / 1000);
  const claims = {
    iss: clientEmail,
    scope: FCM_SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: issuedAt,
    exp: issuedAt + 3600,
  };

  const encoder = new TextEncoder();
  const unsigned = `${base64Url(
    encoder.encode(JSON.stringify(header)),
  )}.${base64Url(encoder.encode(JSON.stringify(claims)))}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToPkcs8(privateKeyPem).buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    encoder.encode(unsigned),
  );
  const jwt = `${unsigned}.${base64Url(new Uint8Array(signature))}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(`Could not get an FCM access token: ${JSON.stringify(data)}`);
  }

  return data.access_token as string;
};

const sendFcmMessage = async (
  accessToken: string,
  projectId: string,
  token: string,
  data: Record<string, string>,
) =>
  fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        message: {
          token,
          data,
          android: { priority: 'high' },
        },
      }),
    },
  );

const removeStaleTokens = async (
  supabase: SupabaseClient,
  staleTokens: string[],
) => {
  if (!staleTokens.length) {
    return;
  }

  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .in('token', staleTokens);

  if (error) {
    console.error(`[${FUNCTION_NAME}] Could not clean up stale tokens`, {
      error: error.message,
    });
  }
};

Deno.serve(async request => {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let supabaseUrl: string;
  let serviceRoleKey: string;
  let expectedSecret: string;
  let fcmProjectId: string;
  let fcmClientEmail: string;
  let fcmPrivateKey: string;

  try {
    supabaseUrl = getRequiredEnv('SUPABASE_URL');
    serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    expectedSecret = getRequiredEnv('MESSAGE_PUSH_SECRET');
    fcmProjectId = getRequiredEnv('FCM_PROJECT_ID');
    fcmClientEmail = getRequiredEnv('FCM_CLIENT_EMAIL');
    fcmPrivateKey = getRequiredEnv('FCM_PRIVATE_KEY').replace(/\\n/g, '\n');
  } catch (error) {
    console.error(`[${FUNCTION_NAME}] Invalid function configuration`);
    return jsonResponse({ error: getErrorMessage(error) }, 500);
  }

  const providedSecret = request.headers.get('x-message-push-secret') ?? '';

  if (!timingSafeEqual(providedSecret, expectedSecret)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  let payload: WebhookPayload;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const message = payload?.record;

  if (!message?.id || !message.conversation_id || !message.sender_id) {
    return jsonResponse({ error: 'Missing message fields' }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const { data: conversation, error: conversationError } = await supabase
      .from('chat_conversations')
      .select('id, buyer_id, seller_id')
      .eq('id', message.conversation_id)
      .single();

    if (conversationError || !conversation) {
      throw conversationError ?? new Error('Conversation not found');
    }

    const recipientId =
      conversation.buyer_id === message.sender_id
        ? conversation.seller_id
        : conversation.buyer_id;

    const [{ data: sender }, { data: recipient }, { data: tokenRows }] =
      await Promise.all([
        supabase
          .from('profiles')
          .select('display_name')
          .eq('id', message.sender_id)
          .single(),
        supabase
          .from('profiles')
          .select('notify_messages')
          .eq('id', recipientId)
          .single(),
        supabase
          .from('push_tokens')
          .select('token')
          .eq('user_id', recipientId),
      ]);

    if (recipient?.notify_messages === false) {
      return jsonResponse({ skipped: 'recipient disabled notifications' });
    }

    const tokens = (tokenRows ?? []).map(row => row.token);

    if (!tokens.length) {
      return jsonResponse({ skipped: 'no registered device' });
    }

    const accessToken = await getFcmAccessToken(fcmClientEmail, fcmPrivateKey);
    const title = sender?.display_name?.trim() || 'Libris';
    const body =
      message.body.length > MESSAGE_PREVIEW_LENGTH
        ? `${message.body.slice(0, MESSAGE_PREVIEW_LENGTH - 1)}…`
        : message.body;

    const staleTokens: string[] = [];

    await Promise.all(
      tokens.map(async token => {
        const response = await sendFcmMessage(accessToken, fcmProjectId, token, {
          type: 'message',
          conversationId: conversation.id,
          title,
          body,
        });

        if (response.status === 404 || response.status === 400) {
          const error = await response.json().catch(() => null);
          if (
            error?.error?.status === 'UNREGISTERED' ||
            error?.error?.status === 'NOT_FOUND'
          ) {
            staleTokens.push(token);
          }
        } else if (!response.ok) {
          console.error(`[${FUNCTION_NAME}] FCM send failed`, {
            status: response.status,
            body: await response.text().catch(() => ''),
          });
        }
      }),
    );

    await removeStaleTokens(supabase, staleTokens);

    return jsonResponse({ sent: tokens.length - staleTokens.length });
  } catch (error) {
    console.error(`[${FUNCTION_NAME}] Could not send push`, {
      error: getErrorMessage(error),
    });
    return jsonResponse({ error: 'Could not send push' }, 500);
  }
});
