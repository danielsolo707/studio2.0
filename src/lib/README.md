# src/lib/ — Pure TypeScript utilities (NO React, NO JSX)

Every file here is a **DAG leaf** — no circular imports between modules.
No `"use client"`, no JSX, no `import React`. Just functions and types.

## Modules

| Directory            | Description                                              |
|----------------------|----------------------------------------------------------|
| `ai/`                | AI chat DB persistence + settings (Gemini config)         |
| `auth/`              | HMAC session, credentials (scrypt), TOTP 2FA              |
| `cms/`               | Content management (Supabase + fallback)                  |
| `contact/`           | Contact message storage (Supabase + fallback)             |
| `core/`              | Utility functions                                         |
| `database/`          | Supabase client, CRUD, migration runner                   |
| `game/`              | 2048 game logic (board, move, merge)                      |
| `integrations/`      | External integrations                                     |
| `platform/`          | Environment variable access + settings helpers            |
| `security/`          | Captcha config (Cloudflare Turnstile)                     |

## Data flow

Portfolio content, contact messages, admin credentials, and AI settings
are primarily stored in **Supabase** (`site_content`, `contact_messages`,
`app_settings`, `ai_chat_sessions` / `ai_chat_messages` tables).

Local JSON files in `src/data/` are **deprecated** and only used as a
fallback when Supabase environment variables are not configured.

## Tests

`__tests__/game2048.test.ts` — unit tests for 2048 game logic.
