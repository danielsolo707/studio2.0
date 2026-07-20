# `src/data/`

**Portfolio content does not live here.**

| What | Where |
|------|--------|
| Projects, hero, about, options | Supabase tables `projects` + `site_content` |
| Contact messages | Supabase `contact_messages` |
| Admin / 2FA / captcha | Supabase `app_settings` |

`content.json` is kept only as an **empty placeholder** so old tooling that expects the path does not break. The app (`src/lib/cms/content.ts`) never reads or writes real portfolio data from this file.

Edit content via the **admin dashboard** or Supabase SQL Editor. Schema: [`supabase/schema.sql`](../../supabase/schema.sql).
