# e2e/ — Playwright end-to-end tests

Run with: `npm run test:e2e`

| File                  | What it tests                                |
|-----------------------|----------------------------------------------|
| `home.spec.ts`        | Landing page loads, hero visible, sections   |
| `navigation.spec.ts`  | Desktop nav links scroll to sections         |
| `responsive.spec.ts`  | No horizontal overflow, mobile cards, arcade |

## Configuration

See `playwright.config.ts` at the project root. Tests run across 3 viewports:
- Desktop (1440×900)
- Tablet (834×1194, touch)
- Mobile (390×844, touch)
