-- Push notification device tokens. Actually sending a push is handled by
-- the send-message-push Edge Function, wired up separately as a Database
-- Webhook on INSERT into chat_messages — see the setup instructions.

create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('android', 'ios')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_tokens_user_id_idx
on public.push_tokens (user_id);

alter table public.push_tokens enable row level security;

revoke all on public.push_tokens from public;
revoke all on public.push_tokens from anon;
revoke all on public.push_tokens from authenticated;

drop policy if exists "Users can read their own push tokens"
on public.push_tokens;
create policy "Users can read their own push tokens"
on public.push_tokens for select
to authenticated
using (user_id = (select auth.uid()));

grant select on public.push_tokens to authenticated;

-- Registering and removing a token both go through these functions rather
-- than direct table grants, same as block_user/unblock_user.
-- A token can move to a different account on the same device (sign out,
-- sign back in as someone else), so a re-registered token reassigns it
-- instead of failing on the unique constraint.
create or replace function public.upsert_push_token(
  p_token text,
  p_platform text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_platform not in ('android', 'ios') then
    raise exception 'Invalid platform' using errcode = '22023';
  end if;

  insert into public.push_tokens (user_id, token, platform)
  values (auth.uid(), p_token, p_platform)
  on conflict (token) do update
  set
    user_id = excluded.user_id,
    platform = excluded.platform,
    updated_at = now();
end;
$$;

revoke all on function public.upsert_push_token(text, text) from public;
grant execute on function public.upsert_push_token(text, text)
to authenticated;

create or replace function public.remove_push_token(p_token text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.push_tokens
  where token = p_token and user_id = (select auth.uid());
end;
$$;

revoke all on function public.remove_push_token(text) from public;
grant execute on function public.remove_push_token(text) to authenticated;

-- The actual FCM push is sent by the send-message-push Edge Function, wired
-- up as a Database Webhook (Database → Webhooks in the dashboard) on INSERT
-- into chat_messages — see the setup instructions for that. No SQL trigger
-- is needed here: a webhook keeps the auth secret out of this migration
-- entirely, configured once in the dashboard instead.
