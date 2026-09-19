# Purge deleted listings

This scheduled Edge Function permanently removes listings that were soft-deleted
at least three calendar months ago. It deletes registered objects from the
`book-images` bucket first, verifies that they are gone, and only then calls the
database finalization RPC. Failed jobs are released for a later retry.

## Required configuration

Set this Edge Function secret:

```sh
supabase secrets set PURGE_DELETED_LISTINGS_SECRET="a-long-random-value"
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are supplied by the hosted
Supabase Edge Function runtime. Do not expose the service-role key to the app or
store it in this repository.

The function uses its own `x-purge-secret` header, so disable JWT verification
for this function in the project-level `supabase/config.toml`:

```toml
[functions.purge-deleted-listings]
verify_jwt = false
```

Deploy it after applying the lifecycle migration:

```sh
supabase functions deploy purge-deleted-listings --no-verify-jwt
```

Schedule a daily `POST` request in Supabase Cron to:

```text
https://<project-ref>.supabase.co/functions/v1/purge-deleted-listings
```

Pass the same secret as `x-purge-secret`. An optional JSON body can limit one
run, for example `{"limit": 25}`. The accepted range is 1–100 and the default is 25. Store the request secret in Supabase Vault/Cron configuration rather than
embedding it in a migration.

The handler is retry-safe: Storage deletion may run again after a partial
failure, and database rows are finalized only after every registered object is
confirmed absent.
