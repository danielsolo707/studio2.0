# Studio 2.0 — Project Structure

Quick map so anyone can find code fast.

```
site/
├── src/
│   ├── app/                 # Next.js App Router (routes + API only)
│   │   ├── page.tsx         #   /
│   │   ├── gateway/         #   /gateway
│   │   ├── works/           #   /works/motion | /works/code
│   │   ├── projects/        #   /projects/[slug]
│   │   ├── arcade/          #   /arcade/*
│   │   ├── dashboard/       #   /dashboard (+ actions, messages, hermes)
│   │   ├── api/             #   REST handlers (admin, media, hermes)
│   │   └── actions/         #   Shared server actions (contact)
│   │
│   ├── components/          # React UI by domain
│   │   ├── sections/        #   Landing page sections
│   │   ├── layout/          #   Shell chrome
│   │   ├── effects/         #   Visual effects
│   │   ├── project/         #   Galleries + detail + media fields
│   │   ├── dashboard/       #   Admin (auth / content / projects / …)
│   │   ├── hermes/          #   AI chat UI
│   │   ├── arcade/          #   Games UI
│   │   ├── content/         #   Markdown / video / gallery
│   │   ├── forms/           #   Shared form bits
│   │   ├── three/           #   Three.js helpers
│   │   └── ui/              #   shadcn primitives
│   │
│   ├── agents/hermes/       # Hermes agent runtime (server-side)
│   ├── lib/                 # Pure TS domains (auth, cms, db, …)
│   ├── hooks/               # React hooks
│   ├── types/               # Shared TypeScript types
│   ├── data/                # Offline JSON fallback (not production CMS)
│   ├── tests/               # Vitest unit/component tests
│   └── middleware.ts        # Protects /api/admin/*
│
├── public/                  # Static assets + HTML5 arcade games
├── e2e/                     # Playwright end-to-end tests
├── docs/                    # Human docs (Hermes VPS, design notes)
├── supabase/                # Database schema SQL
├── scripts/                 # Dev utilities
└── package.json
```

## Where to put new code

| If you are building… | Put it in… |
|----------------------|------------|
| A new page/route | `src/app/<route>/` |
| Landing section UI | `src/components/sections/` |
| Project gallery/detail | `src/components/project/` |
| Admin form/widget | `src/components/dashboard/<domain>/` |
| AI chat UI | `src/components/hermes/` |
| Auth / CMS / DB logic | `src/lib/<domain>/` |
| Shared types | `src/types/` |
| Unit test | `src/tests/` or colocated `__tests__/` |
| E2E test | `e2e/` |
| DB schema change | `supabase/` |

## Source of truth

- **Content:** Supabase only (`projects`, `site_content`) via `src/lib/cms` + `src/lib/database`
- **`src/data/content.json`:** intentionally empty — not read or written by the app
