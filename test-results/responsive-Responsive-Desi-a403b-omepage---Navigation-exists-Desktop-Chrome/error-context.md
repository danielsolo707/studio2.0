# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive.spec.ts >> Responsive Design Tests >> Mobile (375x667) >> Homepage - Navigation exists
- Location: tests\responsive.spec.ts:43:11

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('nav').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('nav').first()
    9 × locator resolved to <nav aria-label="Main navigation" class="hidden md:flex gap-4 md:gap-8">…</nav>
      - unexpected value "hidden"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - link "Skip to content" [ref=e3] [cursor=pointer]:
      - /url: "#main-content"
    - generic [ref=e7]:
      - banner [ref=e8]:
        - generic [ref=e9]:
          - link "THE FLUID LOGIC" [ref=e10] [cursor=pointer]:
            - /url: /
          - button "Toggle navigation menu" [ref=e11] [cursor=pointer]:
            - img [ref=e12]
        - generic [ref=e15]:
          - heading "CREATIVE DEVELOPER" [level=1] [ref=e17]
          - paragraph [ref=e18]: Creative developer specializing in motion design (After Effects, Cinema 4D) and machine learning. Building interactive web experiences that blend visual storytelling with intelligent systems.
          - link "VIEW WORKS" [ref=e20] [cursor=pointer]:
            - /url: "#works"
          - paragraph [ref=e24]: SCROLL TO EXPLORE
      - region "SELECTED WORKS" [ref=e32]:
        - generic [ref=e33]:
          - generic [ref=e34]:
            - generic [ref=e35]:
              - heading "SELECTED WORKS" [level=2] [ref=e36]
              - paragraph [ref=e37]: Motion studies, practical code prototypes, and small data experiments.
            - generic "Filter projects by discipline" [ref=e38]:
              - button "All" [pressed] [ref=e39] [cursor=pointer]
              - button "Motion" [ref=e40] [cursor=pointer]
              - button "Data/ML" [ref=e41] [cursor=pointer]
          - button "View NEON PULSE project (2024) - MOTION DESIGN" [ref=e42] [cursor=pointer]:
            - generic [ref=e45]:
              - heading "NEON PULSE" [level=3] [ref=e46]
              - generic [ref=e48]: "2024"
          - button "View LIQUID FLOW project (2024) - EXPERIMENTAL" [ref=e50] [cursor=pointer]:
            - generic [ref=e53]:
              - heading "LIQUID FLOW" [level=3] [ref=e54]
              - generic [ref=e56]: "2024"
          - button "View TASKFLOW DASHBOARD project (2024) - PRODUCTIVITY TOOL" [ref=e58] [cursor=pointer]:
            - generic [ref=e61]:
              - heading "TASKFLOW DASHBOARD" [level=3] [ref=e62]
              - generic [ref=e64]: "2024"
          - button "View CLIMATE VIZ project (2023) - DATA VISUALIZATION" [ref=e66] [cursor=pointer]:
            - generic [ref=e69]:
              - heading "CLIMATE VIZ" [level=3] [ref=e70]
              - generic [ref=e72]: "2023"
          - button "View Dynamic Interface Flow project (2025) - Motion Graphics" [ref=e74] [cursor=pointer]:
            - generic [ref=e77]:
              - heading "Dynamic Interface Flow" [level=3] [ref=e78]
              - generic [ref=e80]: "2025"
          - navigation "Project pages" [ref=e82]:
            - link "NEON PULSE" [ref=e83] [cursor=pointer]:
              - /url: /projects/neon-pulse
            - link "LIQUID FLOW" [ref=e84] [cursor=pointer]:
              - /url: /projects/liquid-flow
            - link "TASKFLOW DASHBOARD" [ref=e85] [cursor=pointer]:
              - /url: /projects/taskflow-dashboard
            - link "CLIMATE VIZ" [ref=e86] [cursor=pointer]:
              - /url: /projects/climate-viz
            - link "Dynamic Interface Flow" [ref=e87] [cursor=pointer]:
              - /url: /projects/motion-ui-abstract
      - region "CREATIVE DEVELOPER IN MOTION" [ref=e88]:
        - generic [ref=e89]:
          - paragraph [ref=e90]: ABOUT DANIEL
          - heading "CREATIVE DEVELOPER IN MOTION" [level=2] [ref=e91]
          - paragraph [ref=e92]: I build small visual systems that connect motion graphics, interactive code, and early ML/data experiments. My work is still growing, but it is grounded in curiosity, clear process, and a love for turning abstract ideas into moving, usable things.
          - list "Skills and tools" [ref=e93]:
            - listitem [ref=e94]: AFTER EFFECTS
            - listitem [ref=e95]: /
            - listitem [ref=e96]: CINEMA 4D
            - listitem [ref=e97]: /
            - listitem [ref=e98]: PYTHON
            - listitem [ref=e99]: /
            - listitem [ref=e100]: DATA VISUALIZATION
          - link "GITHUB" [ref=e102] [cursor=pointer]:
            - /url: https://github.com/danielsolo707
      - region "LET'S TALK" [ref=e103]:
        - generic [ref=e105]:
          - paragraph [ref=e106]: GET IN TOUCH
          - button "LET'S TALK" [ref=e107] [cursor=pointer]
        - generic [ref=e108]:
          - paragraph [ref=e109]: © 2026 DANIEL PORTFOLIO
          - navigation "Social links" [ref=e110]:
            - link "Instagram" [ref=e111] [cursor=pointer]:
              - /url: https://instagram.com
            - link "Vimeo" [ref=e112] [cursor=pointer]:
              - /url: https://vimeo.com
            - link "Open hidden arcade" [ref=e113] [cursor=pointer]:
              - /url: /arcade
              - text: ARCADE
  - button "Open Next.js Dev Tools" [ref=e120] [cursor=pointer]:
    - img [ref=e121]
  - alert [ref=e124]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Responsive Design Tests', () => {
  4   |   const viewports = [
  5   |     { name: 'Desktop', width: 1920, height: 1080 },
  6   |     { name: 'Tablet', width: 768, height: 1024 },
  7   |     { name: 'Mobile', width: 375, height: 667 },
  8   |   ];
  9   | 
  10  |   for (const viewport of viewports) {
  11  |     test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
  12  |       test.beforeEach(async ({ page }) => {
  13  |         await page.setViewportSize({ width: viewport.width, height: viewport.height });
  14  |       });
  15  | 
  16  |       test('Homepage - Main content loads without errors', async ({ page }) => {
  17  |         const errors: string[] = [];
  18  |         page.on('console', msg => {
  19  |           if (msg.type() === 'error') errors.push(msg.text());
  20  |         });
  21  |         page.on('pageerror', err => errors.push(err.message));
  22  | 
  23  |         await page.goto('/');
  24  |         await page.waitForLoadState('networkidle');
  25  | 
  26  |         const main = page.locator('main');
  27  |         await expect(main).toBeVisible();
  28  | 
  29  |         const criticalErrors = errors.filter(e => 
  30  |           !e.includes('Warning') && !e.includes('DevTools') && !e.includes('favicon')
  31  |         );
  32  |         expect(criticalErrors).toHaveLength(0);
  33  |       });
  34  | 
  35  |       test('Homepage - Hero section visible', async ({ page }) => {
  36  |         await page.goto('/');
  37  |         await page.waitForLoadState('networkidle');
  38  | 
  39  |         const heroText = page.locator('#main-content').first();
  40  |         await expect(heroText).toBeVisible();
  41  |       });
  42  | 
  43  |       test('Homepage - Navigation exists', async ({ page }) => {
  44  |         await page.goto('/');
  45  |         await page.waitForLoadState('networkidle');
  46  | 
  47  |         const nav = page.locator('nav');
  48  |         if (await nav.count() > 0) {
> 49  |           await expect(nav.first()).toBeVisible();
      |                                     ^ Error: expect(locator).toBeVisible() failed
  50  |         }
  51  |       });
  52  | 
  53  |       test('Homepage - About Section renders', async ({ page }) => {
  54  |         await page.goto('/');
  55  |         await page.waitForLoadState('networkidle');
  56  | 
  57  |         const aboutSection = page.locator('section').filter({ hasText: /about/i }).first();
  58  |         await expect(aboutSection).toBeVisible();
  59  |       });
  60  | 
  61  |       test('Homepage - Projects section loads', async ({ page }) => {
  62  |         await page.goto('/');
  63  |         await page.waitForLoadState('networkidle');
  64  | 
  65  |         const projectSection = page.locator('#main-content > div').nth(1);
  66  |         await expect(projectSection).toBeVisible();
  67  |       });
  68  | 
  69  |       test('Homepage - Contact section exists', async ({ page }) => {
  70  |         await page.goto('/');
  71  |         await page.waitForLoadState('networkidle');
  72  | 
  73  |         const contactSection = page.locator('[id="contact"]');
  74  |         await expect(contactSection.first()).toBeVisible();
  75  | 
  76  |         const talkButton = page.locator('button:has-text("TALK")');
  77  |         if (await talkButton.count() > 0) {
  78  |           await expect(talkButton.first()).toBeVisible();
  79  |         }
  80  |       });
  81  | 
  82  |       test('Homepage - Footer is visible', async ({ page }) => {
  83  |         await page.goto('/');
  84  |         await page.waitForLoadState('networkidle');
  85  | 
  86  |         const footer = page.locator('footer');
  87  |         await expect(footer.first()).toBeVisible();
  88  |       });
  89  | 
  90  |       test('Works - Code page loads', async ({ page }) => {
  91  |         await page.goto('/works/code');
  92  |         await page.waitForLoadState('networkidle');
  93  | 
  94  |         const main = page.locator('main');
  95  |         await expect(main).toBeVisible();
  96  |       });
  97  | 
  98  |       test('Works - Motion page loads', async ({ page }) => {
  99  |         await page.goto('/works/motion');
  100 |         await page.waitForLoadState('networkidle');
  101 | 
  102 |         const main = page.locator('main');
  103 |         await expect(main).toBeVisible();
  104 |       });
  105 | 
  106 |       test('Projects page loads', async ({ page }) => {
  107 |         await page.goto('/projects');
  108 |         await page.waitForLoadState('networkidle');
  109 | 
  110 |         const main = page.locator('main');
  111 |         await expect(main).toBeVisible();
  112 |       });
  113 | 
  114 |       test('Project detail page loads', async ({ page }) => {
  115 |         await page.goto('/projects/portfolio-admin-system');
  116 |         await page.waitForLoadState('networkidle');
  117 | 
  118 |         const main = page.locator('main');
  119 |         await expect(main).toBeVisible();
  120 |       });
  121 | 
  122 |       test('Arcade page loads', async ({ page }) => {
  123 |         await page.goto('/arcade');
  124 |         await page.waitForLoadState('networkidle');
  125 | 
  126 |         const main = page.locator('main');
  127 |         await expect(main).toBeVisible();
  128 |       });
  129 | 
  130 |       test('2048 game page loads', async ({ page }) => {
  131 |         await page.goto('/arcade/2048');
  132 |         await page.waitForLoadState('networkidle');
  133 | 
  134 |         const main = page.locator('main');
  135 |         await expect(main).toBeVisible();
  136 |       });
  137 | 
  138 |       test('Synesthesia game page loads', async ({ page }) => {
  139 |         await page.goto('/arcade/synesthesia');
  140 |         await page.waitForLoadState('networkidle');
  141 | 
  142 |         const main = page.locator('main');
  143 |         await expect(main).toBeVisible();
  144 |       });
  145 | 
  146 |       test('Mobile menu functionality on mobile/tablet', async ({ page }) => {
  147 |         if (viewport.name === 'Desktop') {
  148 |           test.skip();
  149 |           return;
```