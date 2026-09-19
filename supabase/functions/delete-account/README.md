# Delete account

Lets a signed-in user permanently delete their own account from the app
(Settings → Delete account). The function:

1. validates the caller's access token with Supabase Auth and resolves the
   user from it — the request carries no user id, so nobody can delete someone
   else's account;
2. removes every object under `<user id>/` in the `book-images` bucket and
   verifies that nothing is left;
3. deletes the user with the Auth admin API. The profile, listings, favorites,
   chats and messages, reviews, blocks and reports (filed by or about the user)
   follow through `on delete cascade`.

Storage goes first because it can be retried safely: if any step fails the
function answers `500`, the account is left intact and the user can try again.

## Deploy

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are supplied by the hosted
Supabase Edge Function runtime. Do not expose the service-role key to the app or
store it in this repository.

The function authenticates the caller itself, so gateway JWT verification is
not needed (it also does not work with asymmetric JWT signing keys):

```sh
supabase functions deploy delete-account --no-verify-jwt
```

The app calls it with `supabase.functions.invoke('delete-account')`, which sends
the signed-in user's access token in the `Authorization` header.
