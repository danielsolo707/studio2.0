# `src/data/` — offline fallback only

> **Production source of truth is Supabase**, not these files.
> Live projects, hero, about, and options live in `projects` + `site_content`.
> `content.json` is kept only so the app can boot without env vars (local/offline).
> Do not treat it as your CMS — edit content in the dashboard or Supabase.

## What moved where

| Old file               | Supabase table / column                             |
|------------------------|-----------------------------------------------------|
| `content.json`         | `site_content` (hero, about, options) + `projects`  |
| `contact-log.json`     | `contact_messages`                                  |
| `captcha.json`         | `app_settings.captcha_enabled`                      |
| `totp.json`            | `app_settings.totp_secret` / `app_settings.totp_enabled` |

## First-time setup

See [`supabase/schema.sql`](../../supabase/schema.sql) — run it in the
**Supabase SQL Editor** to create all tables.

After that, the app connects automatically via `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

## Why

- **Persistence** — Supabase data survives `git clean`, new clones, and redeploys.
- **Admin dashboard** — you can edit content, view messages, and toggle settings
  without touching JSON files.
- **AI chat logs** — chat history is stored in `ai_chat_sessions` / `ai_chat_messages`.
