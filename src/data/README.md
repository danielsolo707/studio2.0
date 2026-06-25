# src/data/ — JSON data files (runtime storage)

These files are read and written at runtime by `src/lib/`.

| File              | Used by             | Description                        |
|-------------------|---------------------|------------------------------------|
| `content.json`    | `lib/content.ts`    | All projects, hero, about content  |
| `contact-log.json`| `lib/contact-log.ts`| Contact form messages (inbox)      |
| `captcha.json`    | `lib/captcha-config.ts` | Captcha enabled flag           |
| `totp.json`       | `lib/totp.ts`       | 2FA secret + enabled flag          |

**Note:** `contact-log.json` and `totp.json` are gitignored (sensitive data).
`content.json` is committed — it's the portfolio content source of truth.
