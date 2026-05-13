# The Fluid Logic Portfolio

A cinematic creative-developer portfolio built with Next.js, React, Three.js, Framer Motion, and Tailwind CSS. The site combines typographic layouts, interactive 3D visuals, motion/code project galleries, a contact workflow, and an authenticated admin dashboard for content management.

## Features

- Interactive Three.js hero scene with responsive desktop/mobile framing
- Animated project lists with hover previews and gradient transitions
- Editable hero, about, and project content through the dashboard
- Contact form with server-side validation and message management
- Admin authentication with optional 2FA and CAPTCHA controls
- Admin password change flow from inside the dashboard
- First-visit intro counter with shorter loading screen on later visits
- Responsive layouts for desktop and phone
- SEO routes for sitemap and robots.txt

## Quick Start

### Prerequisites

- Node.js 20+
- npm

### Install And Run

```bash
npm install
npm run dev
```

The local app runs at:

```text
http://localhost:9002
```

### Production

```bash
npm run build
npm start
```

## Environment

Create `.env.local` for local secrets. Useful variables include:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret

RESEND_API_KEY=
RESEND_FROM=

TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

In development, if `ADMIN_PASSWORD` is missing, the fallback password is `change-me`. In production, configure real credentials and a strong `ADMIN_SESSION_SECRET`.

## Admin Dashboard

Open:

```text
http://localhost:9002/dashboard
```

From the dashboard you can:

- Edit hero and about content
- Add, update, reorder, and delete projects/media
- Read and manage contact messages
- Enable or disable 2FA
- Enable or disable CAPTCHA
- Change the admin password

### Password Changes

The dashboard password form requires the current password, a new password, and confirmation. New passwords must be at least 8 characters.

After the first password change, the app stores a hashed credential file at:

```text
src/data/admin-credentials.json
```

This file is intentionally ignored by git. The stored password is hashed with `scrypt`; the raw password is not written to disk.

If the credential file does not exist, login falls back to `ADMIN_PASSWORD` from the environment.

## Project Structure

```text
src/
  app/
    page.tsx                 Main portfolio page
    dashboard/               Admin dashboard and server actions
    projects/[slug]/         Project detail pages
    works/                   Motion/code listing pages
    api/                     Media/admin API routes
  components/
    TypographicHero.tsx
    FeaturedProjects.tsx
    AboutSection.tsx
    ContactSection.tsx
    ContactForm.tsx
    three/                   Three.js scenes and helpers
    ui/                      Reusable UI components
  data/
    content.json             Editable portfolio content
    captcha.json             CAPTCHA config
  lib/
    auth.ts                  Session helpers
    admin-credentials.ts     Admin password hashing/storage
    content.ts               Content read/write helpers
    contact-log.ts           Contact message storage
    gridfs.ts                Media storage helpers
  types/
    project.ts
```

## Scripts

```bash
npm run dev        # Start Next.js dev server on port 9002
npm run build      # Build for production
npm start          # Start production server
npm run typecheck  # TypeScript check
npm test           # Vitest watch mode
npm run test:run   # Vitest single run
```

## Testing Notes

Some checks may currently fail because of existing project configuration issues unrelated to the latest UI/admin updates, including stale `.next/types` route references and mismatched generated UI component typings. The dashboard password helper was checked separately with TypeScript.

## Security Notes

The following local data files are ignored by git:

```text
src/data/totp.json
src/data/contact-log.json
src/data/admin-credentials.json
```

Do not commit `.env.local` or any generated credential/message files.

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Three.js with `@react-three/fiber` and `@react-three/drei`
- Radix UI / shadcn-style components
- Vitest and React Testing Library

## License

MIT License. See [LICENSE](LICENSE).
