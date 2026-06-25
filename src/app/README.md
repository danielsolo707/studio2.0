# src/app/ — Next.js App Router (pages & API routes)

This folder follows the **Next.js App Router** convention. Each subfolder is a
route segment. Files with special names are recognized by Next.js:

| File              | Purpose                                      |
|-------------------|----------------------------------------------|
| `page.tsx`        | The page UI for that route                   |
| `layout.tsx`      | Shared layout wrapping all child pages       |
| `loading.tsx`     | Loading skeleton shown while page loads      |
| `error.tsx`       | Error boundary for the route                 |
| `not-found.tsx`   | 404 UI                                       |
| `route.ts`        | API endpoint (instead of `page.tsx`)         |
| `middleware.ts`   | Runs before every request (auth, redirects)  |
| `globals.css`     | Global styles (imported by root layout)      |
| `robots.ts`       | Generates `robots.txt`                       |
| `sitemap.ts`      | Generates `sitemap.xml`                      |

## Route map

```
/                       → page.tsx              (landing page)
/gateway                → gateway/page.tsx      (discipline selector)
/works/motion           → works/motion/page.tsx (motion gallery)
/works/code             → works/code/page.tsx   (code gallery)
/projects/[slug]        → projects/[slug]/page.tsx (project detail)
/arcade                 → arcade/page.tsx       (arcade landing)
/arcade/[game]          → arcade/[game]/page.tsx (HTML game iframe)
/arcade/2048            → arcade/2048/page.tsx  (2048 — React)
/arcade/synesthesia     → arcade/synesthesia/page.tsx (visualizer)
/dashboard              → dashboard/page.tsx    (admin panel)
/dashboard/messages     → dashboard/messages/page.tsx (contact inbox)
```

## API routes

```
POST /api/admin/upload/local   — local file upload
POST /api/admin/upload/media   — media upload (GridFS)
POST /api/admin/captcha        — captcha verification
POST /api/admin/2fa            — 2FA verification
GET  /api/media/[id]           — serve media file by id
```

## Rule

**No components belong here.** Only `page.tsx`, `layout.tsx`, `loading.tsx`,
`error.tsx`, `route.ts`, and server-action files (`actions.ts`).
All UI components live in `src/components/`.
