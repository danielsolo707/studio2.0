A cinematic motion design portfolio experience built with Next.js 15, React 19, Three.js, and Framer Motion.

## ✨ Features

- **3D Motion Graphics**: Interactive Three.js scenes with WebGL effects
- **Smooth Animations**: Scroll-based animations powered by Framer Motion
- **Modern Stack**: Next.js 15 with React 19, TypeScript, and Tailwind CSS
- **Performance Optimized**: Pre-allocated vectors, optimized rendering, and lazy loading
- **Fully Typed**: 100% TypeScript with strict mode
- **Accessible**: ARIA labels, keyboard navigation, and reduced motion support
- **SEO Ready**: Open Graph tags, sitemap, and robots.txt generation

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app will be available at `http://localhost:9002`

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.9 (App Router)
- **UI Library**: React 19.2.1
- **3D Graphics**: Three.js 0.174.0 + @react-three/fiber
- **Animation**: Framer Motion 11.11.11
- **Styling**: Tailwind CSS 3.4.1
- **Type Safety**: TypeScript 5
- **UI Components**: Radix UI + shadcn/ui
- **Testing**: Vitest + React Testing Library

## 📁 Project Structure

```
src/
├── app/              # Next.js app directory
│   ├── page.tsx      # Main landing page
│   ├── layout.tsx    # Root layout with fonts
│   ├── globals.css   # Global styles
│   ├── robots.ts     # Robots.txt generation
│   └── sitemap.ts    # Sitemap generation
├── components/       # React components
│   ├── ui/           # Reusable UI components (shadcn)
│   ├── LoadingScreen.tsx
│   ├── MotionSphere.tsx
│   ├── ProjectList.tsx
│   ├── ProjectOverlay.tsx
│   ├── TypographicHero.tsx
│   └── ErrorBoundary.tsx
├── types/            # TypeScript type definitions
│   └── project.ts
├── hooks/            # Custom React hooks
└── lib/              # Utility functions
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 🎨 Customization

### Colors

Edit `src/app/globals.css` to change the color scheme:
- Primary accent: `--accent` (Acid Green #DFFF00)
- Background: `--background`
- Foreground: `--foreground`

### Fonts

Fonts are loaded via `next/font/google` in `src/app/layout.tsx`:
- Body: Inter (300, 400, 500, 600, 700)
- Headline: Syncopate (400, 700)

### Projects

Edit the `PROJECTS` array in `src/components/ProjectList.tsx` to add/modify portfolio items.

## 🌐 Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Vercel

```bash
vercel deploy
```

## 📝 Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run Vitest in watch mode
- `npm run test:run` - Run tests once

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

Found a bug? Please [open an issue](https://github.com/danielsolo707/studio/issues).

