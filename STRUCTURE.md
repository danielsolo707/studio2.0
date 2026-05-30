# Project Structure — motionverse

> Generate with: `tree src --dirsfirst -I 'node_modules|.next|__pycache__'`

```
src/
├── app/                            # Next.js App Router (pages, API, layouts)
│   ├── (public)/                   #   public route group (portfolio visitor)
│   │   ├── projects/[slug]/        #     project detail page
│   │   ├── works/motion/           #     motion works grid page
│   │   ├── works/code/             #     code works grid page
│   │   ├── arcade/2048/            #     2048 game page
│   │   ├── arcade/synesthesia/     #     synesthesia visualizer page
│   │   └── gateway/                #     gateway / project explorer
│   ├── (admin)/                    #   admin route group (dashboard)
│   │   └── dashboard/              #     dashboard pages + sub-routes
│   │       └── messages/           #       contact messages
│   ├── actions/                    #   server actions (shared across routes)
│   └── api/                        #   API routes
│       ├── admin/upload/           #     file upload endpoints
│       ├── admin/captcha/          #     captcha verification
│       ├── admin/2fa/              #     two-factor auth
│       ├── media/[id]/             #     media file serving
│       └── captcha/                #     public captcha endpoint
│
├── components/                     # React components (no page shells)
│   ├── ui/                         #   generic UI primitives (Radix/shadcn)
│   ├── shared/                     #   reusable cross-domain components
│   │   ├── VideoEmbed.tsx          #     Vimeo + MP4 universal embed
│   │   ├── GalleryModal.tsx        #     lightbox for images + videos
│   │   └── MarkdownRenderer.tsx    #     markdown → HTML renderer
│   ├── three/                      #   Three.js/3D components
│   │   ├── TiltCard.tsx            #     perspective tilt wrapper
│   │   └── MotionSphere.tsx        #     3D sphere animation
│   ├── project/                    #   project detail sub-components
│   │   ├── ide-header.tsx          #     VS Code-like top bar
│   │   ├── jsdoc-overview.tsx      #     JSDoc-style summary block
│   │   ├── code-accordion.tsx      #     expandable code sections
│   │   ├── tech-specs-grid.tsx     #     technology specification grid
│   │   └── terminal-back-button.tsx #    terminal-style back btn
│   └── admin/                      #   dashboard-only components
│       ├── MediaPreview.tsx        #     media hover/full preview
│       ├── ProjectList.tsx         #     manage projects list
│       └── ...                     #     form fields, upload fields, etc.
│
├── hooks/                          # Shared custom React hooks
│
├── lib/                            # Pure utilities, NO React imports
│   ├── video.ts                    #   Vimeo URL parsing + detection
│   ├── project-meta.ts             #   discipline/label resolvers
│   ├── content.ts                  #   content.json reader
│   ├── auth.ts                     #   authentication logic
│   ├── env.ts                      #   environment variable access
│   └── gridfs.ts                   #   file storage abstraction
│
├── types/                          # TypeScript interfaces
│   └── project.ts                  #   Project, ProjectLink, SiteContent
│
├── data/                           # Static data / JSON
│   └── content.json                #   project content (single source of truth)
│
├── middleware.ts                   # Next.js middleware (auth, redirects)
└── __tests__/                      # Vitest test suites
```

## Key Principles

1.  **`app/` = pages only.** No components, no hooks, no utilities. Components live in `components/`, logic in `lib/`.
2.  **`components/` mirrors the domain map.** `shared/` for cross-cutting, `admin/` for dashboard, `project/` for project detail molecules.
3.  **`lib/` is pure TypeScript.** No `"use client"`, no JSX. Only functions and types — this is where Graphify's AST extractor produces the cleanest edges.
4.  **`types/` is global.** Shared interfaces live here, co-located types go in a `types.ts` next to the component.
5.  **No circular imports between `lib/` modules.** Each file is a DAG leaf.
