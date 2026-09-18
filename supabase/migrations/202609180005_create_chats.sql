create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.book_listings(id) on delete set null,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  listing_title text not null,
  listing_price integer not null check (listing_price >= 0),
  listing_cover_url text,
  last_message_text text,
  last_message_sender_id uuid references public.profiles(id) on delete set null,
  last_message_at timestamptz,
  buyer_unread_count integer not null default 0 check (buyer_unread_count >= 0),
  seller_unread_count integer not null default 0 check (seller_unread_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chat_conversations_distinct_participants
    check (buyer_id <> seller_id),
  constraint chat_conversations_listing_buyer_key
    unique (listing_id, buyer_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null
    references public.chat_conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint chat_messages_body_length
    check (char_length(btrim(body)) between 1 and 2000)
);

alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "Participants can read conversations"
on public.chat_conversations;
create policy "Participants can read conversations"
on public.chat_conversations for select
to authenticated
using (
  (select auth.uid()) = buyer_id
  or (select auth.uid()) = seller_id
);

drop policy if exists "Participants can read messages"
on public.chat_messages;
create policy "Participants can read messages"
on public.chat_messages for select
to authenticated
using (
  exists (
    select 1
    from public.chat_conversations as conversation
    where
      conversation.id = conversation_id
      and (
        conversation.buyer_id = (select auth.uid())
        or conversation.seller_id = (select auth.uid())
      )
  )
);

drop policy if exists "Participants can send messages"
on public.chat_messages;
create policy "Participants can send messages"
on public.chat_messages for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1
    from public.chat_conversations as conversation
    where
      conversation.id = conversation_id
      and (
        conversation.buyer_id = (select auth.uid())
        or conversation.seller_id = (select auth.uid())
      )
  )
);

create index if not exists chat_conversations_buyer_activity_idx
on public.chat_conversations (
  buyer_id,
  last_message_at desc nulls last,
  created_at desc
);

create index if not exists chat_conversations_seller_activity_idx
on public.chat_conversations (
  seller_id,
  last_message_at desc nulls last,
  created_at desc
);

create index if not exists chat_messages_conversation_created_at_idx
on public.chat_messages (conversation_id, created_at desc, id desc);

create or replace function public.update_chat_conversation_last_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.chat_conversations
  set
    last_message_text = new.body,
    last_message_sender_id = new.sender_id,
    last_message_at = new.created_at,
    buyer_unread_count = case
      when new.sender_id = seller_id then buyer_unread_count + 1
      else buyer_unread_count
    end,
    seller_unread_count = case
      when new.sender_id = buyer_id then seller_unread_count + 1
      else seller_unread_count
    end,
    updated_at = new.created_at
  where
    id = new.conversation_id
    and new.sender_id in (buyer_id, seller_id);

  if not found then
    raise exception 'Message sender is not a conversation participant'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.update_chat_conversation_last_message()
from public;

drop trigger if exists on_chat_message_created on public.chat_messages;
create trigger on_chat_message_created
  after insert on public.chat_messages
  for each row execute procedure public.update_chat_conversation_last_message();

create or replace function public.get_or_create_listing_conversation(
  p_listing_id uuid
)
returns setof public.chat_conversations
language plpgsql
security definer
set search_path = ''
rows 1
as $$
declare
  current_user_id uuid := auth.uid();
  listing_record public.book_listings%rowtype;
  conversation_record public.chat_conversations%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select conversation.*
  into conversation_record
  from public.chat_conversations as conversation
  where
    conversation.listing_id = p_listing_id
    and conversation.buyer_id = current_user_id;

  if found then
    return next conversation_record;
    return;
  end if;

  select listing.*
  into listing_record
  from public.book_listings as listing
  where listing.id = p_listing_id and listing.status = 'active';

  if not found then
    raise exception 'Active listing not found' using errcode = 'P0002';
  end if;

  if listing_record.seller_id = current_user_id then
    raise exception 'A seller cannot start a conversation with themselves'
      using errcode = '22023';
  end if;

  insert into public.chat_conversations (
    listing_id,
    buyer_id,
    seller_id,
    listing_title,
    listing_price,
    listing_cover_url
  )
  values (
    listing_record.id,
    current_user_id,
    listing_record.seller_id,
    listing_record.title,
    listing_record.price,
    coalesce(listing_record.cover_url, listing_record.image_urls[1])
  )
  on conflict (listing_id, buyer_id) do update
  set
    listing_title = excluded.listing_title,
    listing_price = excluded.listing_price,
    listing_cover_url = excluded.listing_cover_url
  returning * into conversation_record;

  return next conversation_record;
end;
$$;

revoke all on function public.get_or_create_listing_conversation(uuid)
from public;
grant execute on function public.get_or_create_listing_conversation(uuid)
to authenticated;

create or replace function public.mark_chat_conversation_read(
  p_conversation_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  update public.chat_conversations
  set
    buyer_unread_count = case
      when buyer_id = current_user_id then 0
      else buyer_unread_count
    end,
    seller_unread_count = case
      when seller_id = current_user_id then 0
      else seller_unread_count
    end
  where
    id = p_conversation_id
    and current_user_id in (buyer_id, seller_id);

  if not found then
    raise exception 'Conversation not found' using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.mark_chat_conversation_read(uuid)
from public;
grant execute on function public.mark_chat_conversation_read(uuid)
to authenticated;

create or replace function public.get_chat_other_participant_profile(
  p_conversation_id uuid
)
returns table (
  id uuid,
  display_name text,
  avatar_url text
)
language sql
stable
security definer
set search_path = ''
as $$
  select profile.id, profile.display_name, profile.avatar_url
  from public.chat_conversations as conversation
  join public.profiles as profile
    on profile.id = case
      when conversation.buyer_id = auth.uid() then conversation.seller_id
      else conversation.buyer_id
    end
  where
    conversation.id = p_conversation_id
    and auth.uid() in (conversation.buyer_id, conversation.seller_id);
$$;

revoke all on function public.get_chat_other_participant_profile(uuid)
from public;
grant execute on function public.get_chat_other_participant_profile(uuid)
to authenticated;

drop view if exists public.chat_conversation_summaries;
create view public.chat_conversation_summaries
with (security_invoker = true, security_barrier = true)
as
select
  conversation.id as conversation_id,
  conversation.listing_id,
  conversation.listing_title,
  conversation.listing_price,
  conversation.listing_cover_url,
  conversation.buyer_id,
  conversation.seller_id,
  other_profile.id as other_user_id,
  other_profile.display_name as other_user_display_name,
  other_profile.avatar_url as other_user_avatar_url,
  conversation.last_message_text,
  conversation.last_message_sender_id,
  conversation.last_message_at,
  case
    when conversation.buyer_id = auth.uid()
      then conversation.buyer_unread_count
    else conversation.seller_unread_count
  end as unread_count,
  conversation.created_at,
  conversation.updated_at
from public.chat_conversations as conversation
cross join lateral public.get_chat_other_participant_profile(
  conversation.id
) as other_profile
where auth.uid() in (conversation.buyer_id, conversation.seller_id);

revoke all on public.chat_conversations from public;
revoke all on public.chat_conversations from anon;
revoke all on public.chat_conversations from authenticated;
grant select on public.chat_conversations to authenticated;

revoke all on public.chat_messages from public;
revoke all on public.chat_messages from anon;
revoke all on public.chat_messages from authenticated;
grant select on public.chat_messages to authenticated;
grant insert (conversation_id, sender_id, body)
on public.chat_messages to authenticated;

revoke all on public.chat_conversation_summaries from public;
revoke all on public.chat_conversation_summaries from anon;
grant select on public.chat_conversation_summaries to authenticated;
