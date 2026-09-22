-- Lets a reviewer edit or delete their own review, lets the reviewed user
-- post one reply to it, and adds a per-listing view counter for sellers.

alter table public.reviews
  add column if not exists reply text check (char_length(reply) <= 1000),
  add column if not exists reply_created_at timestamptz;

-- The existing on_review_summary_changed trigger (fires on
-- insert/update/delete of reviews) already recomputes rating_average /
-- review_count correctly for an edited or deleted review — no changes
-- needed there.

create or replace function public.update_review(
  p_review_id uuid,
  p_rating smallint,
  p_comment text default ''
)
returns public.reviews
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  review_record public.reviews%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_rating not between 1 and 5
    or char_length(btrim(coalesce(p_comment, ''))) > 1000 then
    raise exception 'Invalid review' using errcode = '22023';
  end if;

  update public.reviews
  set
    rating = p_rating,
    comment = btrim(coalesce(p_comment, '')),
    updated_at = now()
  where id = p_review_id and reviewer_id = current_user_id
  returning * into review_record;

  if not found then
    raise exception 'Review not found' using errcode = 'P0002';
  end if;

  return review_record;
end;
$$;

revoke all on function public.update_review(uuid, smallint, text)
from public, anon;
grant execute on function public.update_review(uuid, smallint, text)
to authenticated;

create or replace function public.delete_review(p_review_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.reviews
  where id = p_review_id and reviewer_id = (select auth.uid());

  if not found then
    raise exception 'Review not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.delete_review(uuid) from public, anon;
grant execute on function public.delete_review(uuid) to authenticated;

-- p_reply = '' or null clears an existing reply.
create or replace function public.reply_to_review(
  p_review_id uuid,
  p_reply text
)
returns public.reviews
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_reply text := nullif(btrim(coalesce(p_reply, '')), '');
  review_record public.reviews%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if char_length(coalesce(normalized_reply, '')) > 1000 then
    raise exception 'Reply is too long' using errcode = '22023';
  end if;

  update public.reviews
  set
    reply = normalized_reply,
    reply_created_at = case
      when normalized_reply is null then null
      else now()
    end
  where id = p_review_id and reviewee_id = current_user_id
  returning * into review_record;

  if not found then
    raise exception 'Review not found' using errcode = 'P0002';
  end if;

  return review_record;
end;
$$;

revoke all on function public.reply_to_review(uuid, text) from public, anon;
grant execute on function public.reply_to_review(uuid, text)
to authenticated;

-- Surface the reply (and the reviewer's own comment, for the "reviews about
-- me" list) plus the current user's own review id/comment on a conversation
-- (for prefilling an edit form) on the views that already expose reviews.
drop view if exists public.user_review_details;
create view public.user_review_details
with (security_barrier = true)
as
select
  review.id,
  review.listing_title,
  review.reviewer_id,
  reviewer.display_name as reviewer_name,
  reviewer.avatar_url as reviewer_avatar_url,
  review.reviewee_id,
  review.rating,
  review.comment,
  review.reply,
  review.reply_created_at,
  review.created_at,
  review.updated_at
from public.reviews as review
join public.profiles as reviewer on reviewer.id = review.reviewer_id;

revoke all on public.user_review_details from public, anon;
grant select on public.user_review_details to authenticated;

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
  case
    when conversation.archived_at is not null then 'archive'
    when conversation.buyer_id = auth.uid() then 'buying'
    else 'selling'
  end as section,
  conversation.archived_at,
  conversation.archive_reason,
  (
    conversation.review_enabled
    and conversation.archive_reason = 'sold'
    and conversation.last_message_at is not null
    and my_review.id is null
  ) as can_review,
  my_review.id as my_review_id,
  my_review.rating as my_review_rating,
  my_review.comment as my_review_comment,
  conversation.created_at,
  conversation.updated_at
from public.chat_conversations as conversation
cross join lateral public.get_chat_other_participant_profile(
  conversation.id
) as other_profile
left join public.reviews as my_review
  on my_review.conversation_id = conversation.id
  and my_review.reviewer_id = auth.uid()
where
  auth.uid() in (conversation.buyer_id, conversation.seller_id)
  and (
    conversation.archived_at is not null
    or conversation.last_message_at is not null
  )
  and not public.has_blocked(auth.uid(), other_profile.id);

revoke all on public.chat_conversation_summaries from public, anon;
grant select on public.chat_conversation_summaries to authenticated;

-- Per-listing view counter, shown to the seller in My Listings. The client
-- only calls this when someone other than the seller opens the listing.
alter table public.book_listings
  add column if not exists view_count integer not null default 0;

create or replace function public.increment_listing_view(p_listing_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.book_listings
  set view_count = view_count + 1
  where id = p_listing_id and status = 'active' and not is_deleted;
$$;

revoke all on function public.increment_listing_view(uuid) from public;
grant execute on function public.increment_listing_view(uuid)
to anon, authenticated;
