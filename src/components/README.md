# src/components/ — React UI components

Organized by domain. **No page shells here** — only reusable building blocks.

## Subfolders

| Folder           | What's inside                                           |
|------------------|---------------------------------------------------------|
| `ui/`            | Generic shadcn/Radix primitives (Button, Dialog, etc.)  |
| `three/`         | Three.js / React-Three-Fiber 3D components              |
| `project/`       | Sub-components for the project detail page              |
| `project-detail/`| The full project detail client wrapper                  |
| `arcade/`        | Arcade game frame + thumbnails                          |
| `dashboard/`     | Admin dashboard forms, lists, panels                    |
| `works/`         | Gallery page header components                          |

## Root-level components (landing page)

| File                       | Used by          | Description                          |
|----------------------------|------------------|--------------------------------------|
| `TypographicHero.tsx`      | Home page        | Hero section with 3D cube            |
| `FeaturedProjects.tsx`     | Home page        | Featured works list                  |
| `AboutSection.tsx`         | Home page        | About + skills                       |
| `ContactSection.tsx`       | Home page        | Contact CTA + form                   |
| `Footer.tsx`               | Contact section  | Site footer                          |
| `LoadingScreen.tsx`        | Home page        | Intro loading overlay                |
| `ParticlesBackground.tsx`  | Home page        | Floating 3D particles                |
| `MobileMenu.tsx`           | Header           | Mobile slide-out menu                |
| `ScrollRestoration.tsx`    | Root layout      | Restores scroll on navigation        |
| `VideoEmbed.tsx`           | Galleries        | Vimeo / MP4 universal embed          |
| `GalleryModal.tsx`         | Project detail   | Lightbox for images + videos         |
| `MarkdownRenderer.tsx`     | Project detail   | Markdown → HTML renderer             |
| `ContactForm.tsx`          | Contact section  | The actual form fields               |
| `ProjectCardLink.tsx`      | Code gallery     | Card-style project link              |
| `CodeProjectGallery.tsx`   | Code gallery     | Grid of code projects                |
| `MotionProjectGallery.tsx` | Motion gallery   | Grid of motion projects              |
| `ProjectOverlay.tsx`       | (tested)         | Full-screen project preview          |
| `ProjectList.tsx`          | (tested)         | Compact project list                 |
| `ErrorBoundary.tsx`        | (tested)         | React error boundary                 |
| `Arcade2048.tsx`           | Arcade 2048      | 2048 game (React)                    |
| `MediaFields.tsx`          | Dashboard        | Media upload form fields              |
| `MediaFieldsEditable.tsx`  | Dashboard        | Editable media fields                 |
| `RichTextEditor.tsx`       | Dashboard        | Rich text editor                      |
| `SubmitButton.tsx`         | Dashboard        | Form submit button                    |
| `theme-provider.tsx`       | Root layout      | next-themes provider                  |
| `code-background.tsx`      | Code gallery     | Animated background                   |
| `motion-background.tsx`    | Motion gallery   | Animated background                   |
| `film-grain.tsx`           | Gateway/detail   | Film grain overlay                    |
| `scramble-text.tsx`        | Gateway          | Scramble text animation               |

## Rule

Components here must **never** import from `src/app/` (except server actions).
They receive data via props, not by reading content directly.
