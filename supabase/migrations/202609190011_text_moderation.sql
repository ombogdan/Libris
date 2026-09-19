-- Basic server-side text moderation.
--
-- Listing titles, authors and descriptions, profile names, chat messages and
-- review comments are checked against public.moderation_terms by triggers, so
-- the rule cannot be skipped by calling the API directly. A rejected write fails
-- with the message 'content_not_allowed' and the offending column in the error
-- hint; the app turns that into a readable message.
--
-- The list below is a small starting point. Add or remove terms in the SQL
-- editor, for example:
--   insert into public.moderation_terms (term, match_type) values ('word', 'word');
-- match_type: 'contains' finds the term anywhere (also inside longer words and
-- with punctuation between letters), 'prefix' finds words that start with it,
-- 'word' only finds it as a whole word. Use 'word' or 'prefix' for short stems
-- that appear inside harmless words.

-- Lower-cases the text and folds spelling variants so one term covers several:
-- ё є э -> е, і ї ы -> и, ґ -> г. Upper-case Cyrillic is mapped explicitly
-- because lower() depends on the database locale.
create or replace function public.moderation_fold(p_text text)
returns text
language sql
immutable
set search_path = ''
as $$
  select translate(
    translate(
      lower(coalesce(p_text, '')),
      'АБВГҐДЕЁЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯЫЭЪ',
      'абвгґдеёєжзиіїйклмнопрстуфхцчшщьюяыэъ'
    ),
    'ёєіїґыэ',
    'ееиигие'
  );
$$;

-- Removes everything but letters, digits and spaces (or turns it into a space
-- when p_keep_word_breaks is true) and collapses repeated characters, so
-- "х.у.й" and "хууууй" both become "хуй".
create or replace function public.moderation_squash(
  p_text text,
  p_keep_word_breaks boolean
)
returns text
language sql
immutable
set search_path = ''
as $$
  select btrim(
    regexp_replace(
      regexp_replace(
        p_text,
        '[^a-zа-я0-9 ]+',
        case when p_keep_word_breaks then ' ' else '' end,
        'g'
      ),
      '(.)\1+',
      '\1',
      'g'
    )
  );
$$;

create table if not exists public.moderation_terms (
  term text primary key,
  match_type text not null default 'contains'
    check (match_type in ('contains', 'prefix', 'word')),
  normalized text generated always as (
    public.moderation_squash(public.moderation_fold(term), true)
  ) stored,
  created_at timestamptz not null default now(),
  constraint moderation_terms_not_blank check (normalized <> '')
);

alter table public.moderation_terms enable row level security;
revoke all on public.moderation_terms from public, anon, authenticated;

insert into public.moderation_terms (term, match_type)
values
  ('хуй', 'contains'),
  ('пизд', 'contains'),
  ('бляд', 'contains'),
  ('блять', 'contains'),
  ('залуп', 'contains'),
  ('пидор', 'contains'),
  ('пидар', 'contains'),
  ('гандон', 'contains'),
  ('мудак', 'contains'),
  ('мудил', 'contains'),
  ('уебан', 'contains'),
  ('уебок', 'contains'),
  ('долбоеб', 'contains'),
  ('ебанат', 'contains'),
  ('ебанут', 'contains'),
  ('ебаный', 'contains'),
  ('fuck', 'contains'),
  ('bitch', 'contains'),
  ('asshole', 'contains'),
  ('whore', 'contains'),
  ('ебат', 'prefix'),
  ('ебал', 'prefix'),
  ('ебан', 'prefix'),
  ('ебл', 'prefix'),
  ('ибат', 'prefix'),
  ('ибал', 'prefix'),
  ('йоб', 'prefix'),
  ('шлюх', 'prefix'),
  ('шалав', 'prefix'),
  ('шльондр', 'prefix'),
  ('курв', 'prefix'),
  ('мраз', 'prefix'),
  ('дебил', 'prefix'),
  ('ублюд', 'prefix'),
  ('жополиз', 'prefix'),
  ('сучар', 'prefix'),
  ('хуев', 'prefix'),
  ('хует', 'prefix'),
  ('херн', 'prefix'),
  ('сука', 'word'),
  ('суки', 'word'),
  ('суку', 'word'),
  ('бля', 'word'),
  ('хер', 'word'),
  ('нахер', 'word'),
  ('похер', 'word'),
  ('нахрен', 'word'),
  ('похрен', 'word'),
  ('нах', 'word'),
  ('пох', 'word'),
  ('гнида', 'word'),
  ('shit', 'word'),
  ('shitty', 'word'),
  ('bullshit', 'word'),
  ('cunt', 'word'),
  ('slut', 'word')
on conflict (term) do nothing;

create or replace function public.contains_blocked_term(p_text text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  folded text;
  lookalike text;
  joined text;
  joined_lookalike text;
  spaced text;
  spaced_lookalike text;
begin
  if p_text is null or btrim(p_text) = '' then
    return false;
  end if;

  folded := public.moderation_fold(p_text);
  -- Latin letters standing in for Cyrillic ones ("xуй"). The Latin i is left
  -- out on purpose: it would turn IBAN into a Cyrillic word.
  lookalike := translate(folded, 'acekmotpxyh', 'асекмотрхун');

  joined := public.moderation_squash(folded, false);
  joined_lookalike := public.moderation_squash(lookalike, false);
  spaced := ' ' || public.moderation_squash(folded, true) || ' ';
  spaced_lookalike := ' ' || public.moderation_squash(lookalike, true) || ' ';

  return exists (
    select 1
    from public.moderation_terms as blocked
    where
      case blocked.match_type
        when 'contains' then
          strpos(joined, blocked.normalized) > 0
          or strpos(joined_lookalike, blocked.normalized) > 0
        when 'prefix' then
          strpos(spaced, ' ' || blocked.normalized) > 0
          or strpos(spaced_lookalike, ' ' || blocked.normalized) > 0
        else
          strpos(spaced, ' ' || blocked.normalized || ' ') > 0
          or strpos(spaced_lookalike, ' ' || blocked.normalized || ' ') > 0
      end
  );
end;
$$;

-- Trigger function: the columns to check are passed as trigger arguments.
create or replace function public.enforce_text_moderation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  field text;
begin
  foreach field in array tg_argv loop
    if public.contains_blocked_term(to_jsonb(new) ->> field) then
      raise exception 'content_not_allowed' using hint = field;
    end if;
  end loop;

  return new;
end;
$$;

-- Same as before, except that a name from the sign-in provider that breaks the
-- rules is left empty: the user picks one during onboarding, and sign-up does
-- not fail on the profile trigger below.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  provider_name text := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    ''
  );
begin
  insert into public.profiles (id, display_name, email, avatar_url)
  values (
    new.id,
    case when public.contains_blocked_term(provider_name) then '' else provider_name end,
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists moderate_listing_text on public.book_listings;
create trigger moderate_listing_text
  before insert or update of title, author, description
  on public.book_listings
  for each row
  execute function public.enforce_text_moderation('title', 'author', 'description');

drop trigger if exists moderate_profile_name on public.profiles;
create trigger moderate_profile_name
  before insert or update of display_name
  on public.profiles
  for each row
  execute function public.enforce_text_moderation('display_name');

drop trigger if exists moderate_chat_message on public.chat_messages;
create trigger moderate_chat_message
  before insert
  on public.chat_messages
  for each row
  execute function public.enforce_text_moderation('body');

drop trigger if exists moderate_review_comment on public.reviews;
create trigger moderate_review_comment
  before insert or update of comment
  on public.reviews
  for each row
  execute function public.enforce_text_moderation('comment');

-- None of this is meant to be called from the app: it would let anyone probe the
-- list word by word.
revoke all on function public.moderation_fold(text)
from public, anon, authenticated;
revoke all on function public.moderation_squash(text, boolean)
from public, anon, authenticated;
revoke all on function public.contains_blocked_term(text)
from public, anon, authenticated;
revoke all on function public.enforce_text_moderation()
from public, anon, authenticated;
