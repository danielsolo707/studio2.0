# The Fluid Logic — Creative Developer Portfolio

> A cinematic portfolio for a creative developer specializing in motion design
> and machine learning. Built with Next.js, Three.js, Framer Motion, and Tailwind CSS.

---

## Table of Contents

- [Overview](#overview)
- [Live Pages](#live-pages)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Admin Dashboard](#admin-dashboard)
- [Arcade Games](#arcade-games)
- [Scripts](#scripts)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [License](#license)

---

## Overview

This is a **personal portfolio website** for a creative developer. It features:

- A **typographic hero** with an interactive Rick character and hover speech-bubble
- **Featured works** with hover previews and gradient animations
- **Motion** and **code** project galleries with distinct visual identities
- **Project detail pages** with a dual-view layout (motion vs code style)
- An **admin dashboard** with authentication, 2FA, CAPTCHA, and content management
- A **contact form** with message inbox in the dashboard
- A hidden **arcade** with 8 nostalgic HTML5 games
- Full **responsive design** (mobile, tablet, desktop)
- **SEO** (sitemap, robots, OpenGraph, JSON-LD schema)

---

## Live Pages

| Route                  | Page                                        |
|------------------------|---------------------------------------------|
| `/`                    | Landing page (hero + works + about + contact)|
| `/gateway`             | Discipline selector (Motion vs Code)        |
| `/works/motion`        | Motion design project gallery               |
| `/works/code`          | Code project gallery (terminal style)       |
| `/projects/[slug]`     | Individual project detail page              |
| `/arcade`              | Arcade landing (8 games)                    |
| `/arcade/[game]`       | Play a specific game                        |
| `/dashboard`           | Admin dashboard (login required)           |
| `/dashboard/messages`  | Contact message inbox (login required)     |

---

## Tech Stack

| Layer            | Technology                                           |
|------------------|------------------------------------------------------|
| Framework        | Next.js 15 (App Router, Turbopack)                   |
| UI               | React 19, TypeScript                                 |
| Styling          | Tailwind CSS + shadcn/ui (Radix primitives)          |
| Animation        | Framer Motion                                        |
| 3D               | Three.js + @react-three/fiber + @react-three/drei    |
| Forms            | Zod validation                                       |
| Auth             | HMAC-signed cookies + scrypt password hashing        |
| 2FA              | TOTP (speakeasy + QRCode)                            |
| Testing          | Vitest (unit) + Playwright (e2e)                     |
| Fonts            | Inter (body) + Syncopate (headlines)                 |

---

## Quick Start

### Prerequisites

- **Node.js** 20+
- **npm**

### Install & Run

```bash
git clone <repo-url>
cd studio.2
npm install
npm run dev
```

The app runs at **http://localhost:9002**

### Supabase Setup (required for persistence)

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → open [`supabase-schema.sql`](./supabase-schema.sql) → **Run**
3. Copy your project URL and keys into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> The app **works without Supabase** (falls back to env vars / in-memory defaults),
> but you'll lose data on restart. For full features (persistent content, contact
> messages, chat history, AI config), Supabase is required.

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
studio.2/
├── src/
│   ├── app/                    # Next.js App Router — pages & API routes only
│   │   ├── page.tsx            #   Landing page
│   │   ├── layout.tsx          #   Root layout (fonts, SEO, providers)
│   │   ├── globals.css         #   Global styles + Tailwind
│   │   ├── gateway/            #   Discipline selector page
│   │   ├── works/              #   Motion & Code gallery pages
│   │   ├── projects/[slug]/    #   Project detail page
│   │   ├── arcade/             #   Arcade landing + game routes
│   │   ├── dashboard/          #   Admin dashboard (page + server actions)
│   │   │   ├── page.tsx        #     Dashboard page
│   │   │   ├── actions.ts      #     Server actions (CRUD, auth)
│   │   │   └── messages/       #     Message inbox page
│   │   ├── api/                #   API routes (upload, 2fa, captcha, media)
│   │   ├── actions/            #   Shared server actions (contact form)
│   │   ├── robots.ts           #   robots.txt generator
│   │   └── sitemap.ts          #   sitemap.xml generator
│   │
│   ├── components/             # React components — NO page shells
│   │   ├── ui/                 #   shadcn/Radix primitives (50+ components)
│   │   ├── three/              #   Three.js 3D components (particles, TiltCard)
│   │   ├── project/            #   Project detail sub-components
│   │   ├── project-detail/     #   Project detail client wrapper
│   │   ├── arcade/             #   Arcade game frame + thumbnails
│   │   ├── dashboard/          #   Dashboard forms, lists, panels (24 files)
│   │   ├── works/              #   Gallery header components
│   │   └── *.tsx               #   Landing page components (Hero, Featured, About, etc.)
│   │
│   ├── lib/                    # Pure TypeScript utilities — NO React, NO JSX
│   │   ├── content.ts          #   Read/write portfolio content
│   │   ├── auth/               #   Auth session, credentials, 2FA/TOTP
│   │   ├── ai/                 #   AI chat DB + settings
│   │   ├── cms/                #   Content management helpers
│   │   ├── contact/            #   Contact message storage
│   │   ├── database/           #   Supabase + migration
│   │   ├── platform/           #   Env vars + settings helpers
│   │   ├── security/           #   Captcha config
│   │   ├── core/               #   Utility functions
│   │   └── game2048.ts         #   2048 game logic
│   │
│   ├── hooks/                  # Custom React hooks (5 files)
│   ├── types/                  # Shared TypeScript interfaces
│   ├── data/                   # JSON fallback files (see README.md inside)
│   ├── middleware.ts           # Auth middleware (protects /api/admin/*)
│   └── __tests__/              # Vitest component tests
│
├── public/                     # Static assets
│   ├── arcade/                 #   HTML5 game files (8 games)
│   ├── sounds/                 #   Game sound effects
│   └── uploads/                #   User-uploaded media (gitignored)
│
├── e2e/                        # Playwright end-to-end tests
├── docs/                       # Design docs & brainstorming
│
├── next.config.ts              # Next.js configuration (security headers, images)
├── tailwind.config.ts          # Tailwind theme (acid green accent, fonts, animations)
├── playwright.config.ts        # E2E test config (3 viewports)
├── tsconfig.json               # TypeScript configuration
├── components.json             # shadcn/ui configuration
└── ecosystem.config.js         # PM2 process manager config
```

> Each folder has its own `README.md` explaining what's inside in detail.

---

## Environment Variables

Create a `.env.local` file:

```env
# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me
ADMIN_SESSION_SECRET=a-long-random-string

# Supabase (required for persistence)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini AI (chat assistant)
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-flash-latest

# Email (optional — for contact form notifications)
RESEND_API_KEY=
RESEND_FROM=
RESEND_TO=

# CAPTCHA (Cloudflare Turnstile, optional)
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

# 2FA (set on first setup via dashboard)
TOTP_SECRET=

# Telegram alerts (optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

**In development**, if `ADMIN_PASSWORD` is missing, the fallback is `change-me`.
**In production**, `ADMIN_SESSION_SECRET` is required.

---

## Admin Dashboard

Navigate to **http://localhost:9002/dashboard**

### Features

- **Login** with username + password (with optional 2FA + CAPTCHA)
- **Hero editor** — edit headline and description
- **About editor** — edit bio, skills list
- **Project manager** — add, edit, delete, reorder projects
- **Media upload** — upload images/videos for each project
- **Message inbox** — read, reply, archive, delete contact messages
- **Settings** — toggle 2FA, toggle CAPTCHA, change password

### Authentication

- Session is an HMAC-signed cookie (7-day expiry)
- Passwords hashed with **scrypt** + random salt
- 2FA uses **TOTP** (compatible with Google Authenticator, Authy, etc.)
- Admin credentials are stored in **Supabase** (`app_settings` table).
- Local JSON fallback (`admin-credentials.json`) is available when Supabase isn't configured.

---

## Arcade Games

Accessible at **http://localhost:9002/arcade** (linked from the footer).

| Game            | Year | Source                                         |
|-----------------|------|------------------------------------------------|
| 2048            | 2014 | Built in-app (React component)                 |
| Snake           | 1976 | [Vintage-Games](https://github.com/Gbolahan-Aziz/Vintage-Games) |
| Tetris          | 1984 | [Vintage-Games](https://github.com/Gbolahan-Aziz/Vintage-Games) |
| Breakout        | 1976 | [Vintage-Games](https://github.com/Gbolahan-Aziz/Vintage-Games) |
| Space Invaders  | 1978 | [Vintage-Games](https://github.com/Gbolahan-Aziz/Vintage-Games) |
| Pong            | 1972 | [browser-games](https://github.com/juliensimon/browser-games)   |
| Flappy Bird     | 2013 | [FlappyBird-JS](https://github.com/CodeExplainedRepo/FlappyBird-JavaScript) |
| Minesweeper     | 1989 | [Mine-Sweeper](https://github.com/bocaletto-luca/Mine-Sweeper)  |

Each game is a standalone HTML file loaded in an iframe. Keyboard + touch supported.

---

## Scripts

| Command              | Description                          |
|----------------------|--------------------------------------|
| `npm run dev`        | Start dev server (Turbopack, port 9002) |
| `npm run build`      | Production build                     |
| `npm start`          | Start production server (port 9002)  |
| `npm run lint`       | ESLint                               |
| `npm run typecheck`  | TypeScript check (`tsc --noEmit`)    |
| `npm test`           | Vitest (watch mode)                  |
| `npm run test:run`   | Vitest (single run)                  |
| `npm run test:e2e`   | Playwright e2e tests (3 viewports)   |

---

## Testing

### Unit Tests (Vitest)

```bash
npm run test:run
```

Covers: 2048 game logic, component rendering.

### End-to-End Tests (Playwright)

```bash
npm run test:e2e
```

Tests run across 3 viewports (desktop, tablet, mobile) and cover:
- Landing page loads without errors
- Hero section visible
- Scroll reveals works + about sections
- Contact button toggles form
- No horizontal overflow on any viewport
- Arcade pages load without errors
- All main pages load without errors

---

## Deployment

The app is designed to deploy on **Vercel** (recommended, zero config for Next.js)
or any Node.js host that supports Next.js 15.

### Vercel (Recommended)

1. Push the repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects Next.js — no config needed
4. Add environment variables in the Vercel dashboard (see below)
5. Deploy

### Build & Start (Self-hosted)

```bash
npm run build
npm start
```

### PM2

```bash
pm2 start ecosystem.config.js
```

### Environment Variables

Add these in your Vercel project settings (or `.env.local` for self-hosted):

| Variable                 | Required | Description                          |
|--------------------------|----------|--------------------------------------|
| `ADMIN_SESSION_SECRET`   | Yes      | Long random string for cookie HMAC   |
| `ADMIN_USERNAME`         | No       | Defaults to `admin`                  |
| `ADMIN_PASSWORD`         | No       | Set on first dashboard login         |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes    | Supabase project URL                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key           |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes   | Supabase service-role key (server)   |
| `GEMINI_API_KEY`         | No       | Google Gemini AI chat assistant      |
| `GEMINI_MODEL`           | No       | Default: `gemini-flash-latest`          |
| `RESEND_API_KEY`         | No       | For contact form email notifications |
| `RESEND_FROM`            | No       | Sender address                        |
| `RESEND_TO`              | No       | Recipient for contact submissions    |
| `TURNSTILE_SECRET_KEY`   | No       | Cloudflare Turnstile server key      |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | No | Cloudflare Turnstile site key     |

---

## Security

### Gitignored Files (never committed)

```
.env.local
public/uploads/
*.tsbuildinfo
server.log
```

> Legacy JSON data files (`content.json`, `contact-log.json`, `totp.json`, `captcha.json`)
> have been **deleted** from the repo. All data is now stored in **Supabase**.
> The only remaining file in `src/data/` is `README.md`.

### Security Headers

`next.config.ts` sets:
- `Strict-Transport-Security` (HSTS)
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`
- `Permissions-Policy` (camera, microphone, geolocation disabled)

### Auth Middleware

`src/middleware.ts` protects all `/api/admin/*` routes — requests without a
session cookie get a 401 response.

---

## License

MIT License. See [LICENSE](LICENSE).
