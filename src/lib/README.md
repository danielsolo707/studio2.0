# src/lib/ — Pure TypeScript utilities (NO React, NO JSX)

Every file here is a **DAG leaf** — no circular imports between modules.
No `"use client"`, no JSX, no `import React`. Just functions and types.

## Files

| File                    | Description                                              |
|-------------------------|----------------------------------------------------------|
| `content.ts`            | Read/write `content.json` (the single source of truth)   |
| `auth.ts`               | HMAC-signed session cookies (create/verify/clear)        |
| `admin-credentials.ts`  | Admin password hashing (scrypt) + storage                |
| `totp.ts`               | TOTP 2FA (generate secret, verify token, QR code)        |
| `captcha-config.ts`     | Read/write captcha enabled flag                          |
| `contact-log.ts`        | Contact message storage (JSON file)                      |
| `gridfs.ts`             | File upload/delete abstraction (local disk)               |
| `project-meta.ts`       | Discipline/status/role/links label resolvers             |
| `env.ts`                | Environment variable access + validation                 |
| `game2048.ts`           | 2048 game logic (board, move, merge)                     |
| `utils.ts`              | `cn()` — Tailwind class merge helper                     |

## Tests

`__tests__/game2048.test.ts` — unit tests for 2048 game logic.
