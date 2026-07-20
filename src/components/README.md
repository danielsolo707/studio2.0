# `src/components/`

React UI only — **no page shells** (those live in `src/app/`).

| Folder | Purpose |
|--------|---------|
| `ui/` | shadcn/Radix primitives |
| `sections/` | Landing sections (`home/`, `about/`, `contact/`, `shared/`) |
| `layout/` | Footer, mobile menu, error boundary, theme |
| `effects/` | Particles, film grain, scramble text, motion bg |
| `three/` | R3F helpers |
| `content/` | Markdown, rich text, video, gallery modal |
| `forms/` | Shared form controls |
| `project/` | Project galleries + detail (see `project/README.md`) |
| `dashboard/` | Admin UI by domain (see `dashboard/README.md`) |
| `hermes/` | AI chat widgets + config/history |
| `arcade/` | Arcade frame + 2048 |

## Rules

1. Do not import from `src/app/` except server actions.
2. Put new files in the matching domain folder — not at `components/` root.
3. Prefer clear subfolders over flat dumps.
