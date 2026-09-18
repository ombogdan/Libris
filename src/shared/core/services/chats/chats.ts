import { supabase } from 'services/supabase';
import type {
  ChatConversationSummary,
  ChatMessage,
} from 'services/supabase/database.types';

export type { ChatConversationSummary, ChatMessage };

export type ChatMessagesPage = {
  messages: ChatMessage[];
  hasMore: boolean;
};

const DEFAULT_PAGE_SIZE = 30;
const MAX_PAGE_SIZE = 100;

function normalizePageSize(pageSize: number) {
  if (!Number.isFinite(pageSize)) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize)));
}

export async function fetchChatConversations(): Promise<
  ChatConversationSummary[]
> {
  const { data, error } = await supabase
    .from('chat_conversation_summaries')
    .select('*')
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getOrCreateListingConversation(
  listingId: string,
): Promise<string> {
  const { data, error } = await supabase
    .rpc('get_or_create_listing_conversation', {
      p_listing_id: listingId,
    })
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

export async function fetchChatMessages(
  conversationId: string,
  before?: string,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<ChatMessagesPage> {
  const limit = normalizePageSize(pageSize);
  let query = supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit + 1);

  if (before) {
    query = query.lt('created_at', before);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const newestFirst = data ?? [];
  const hasMore = newestFirst.length > limit;
  const messages = newestFirst.slice(0, limit).reverse();

  return { messages, hasMore };
}

export async function sendChatMessage(
  conversationId: string,
  senderId: string,
  body: string,
): Promise<ChatMessage> {
  const normalizedBody = body.trim();

  if (!normalizedBody) {
    throw new Error('Повідомлення не може бути порожнім.');
  }

  if (normalizedBody.length > 2000) {
    throw new Error('Повідомлення не може бути довшим за 2000 символів.');
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      body: normalizedBody,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function markChatConversationRead(
  conversationId: string,
): Promise<void> {
  const { error } = await supabase.rpc('mark_chat_conversation_read', {
    p_conversation_id: conversationId,
  });

  if (error) {
    throw error;
  }
}
