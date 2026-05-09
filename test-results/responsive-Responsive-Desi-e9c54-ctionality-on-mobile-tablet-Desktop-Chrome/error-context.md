# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive.spec.ts >> Responsive Design Tests >> Mobile (375x667) >> Mobile menu functionality on mobile/tablet
- Location: tests\responsive.spec.ts:146:11

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('nav ul, [class*="menu"] a').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('nav ul, [class*="menu"] a').first()

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - link "Skip to content" [ref=e3] [cursor=pointer]:
      - /url: "#main-content"
    - generic [ref=e7]:
      - banner [ref=e8]:
        - generic [ref=e9]:
          - link "THE FLUID LOGIC" [ref=e10] [cursor=pointer]:
            - /url: /
          - button "Toggle navigation menu" [expanded] [active] [ref=e11] [cursor=pointer]:
            - img [ref=e12]
          - navigation "Main navigation" [ref=e16]:
            - generic [ref=e17]:
              - button "Close menu" [ref=e18] [cursor=pointer]:
                - img [ref=e19]
              - generic [ref=e22]:
                - link "ABOUT" [ref=e23] [cursor=pointer]:
                  - /url: "#about"
                - link "WORKS" [ref=e24] [cursor=pointer]:
                  - /url: "#works"
                - link "MOTION" [ref=e25] [cursor=pointer]:
                  - /url: /works/motion
                - link "CODE" [ref=e26] [cursor=pointer]:
                  - /url: /works/code
                - link "CONTACT" [ref=e27] [cursor=pointer]:
                  - /url: "#contact"
                - generic [ref=e28]: ©2026
        - generic [ref=e31]:
          - heading "CREATIVE DEVELOPER" [level=1] [ref=e33]
          - paragraph [ref=e34]: Creative developer specializing in motion design (After Effects, Cinema 4D) and machine learning. Building interactive web experiences that blend visual storytelling with intelligent systems.
          - link "VIEW WORKS" [ref=e36] [cursor=pointer]:
            - /url: "#works"
          - paragraph [ref=e40]: SCROLL TO EXPLORE
      - region "SELECTED WORKS" [ref=e48]:
        - generic [ref=e49]:
          - generic [ref=e50]:
            - generic [ref=e51]:
              - heading "SELECTED WORKS" [level=2] [ref=e52]
              - paragraph [ref=e53]: Motion studies, practical code prototypes, and small data experiments.
            - generic "Filter projects by discipline" [ref=e54]:
              - button "All" [pressed] [ref=e55] [cursor=pointer]
              - button "Motion" [ref=e56] [cursor=pointer]
              - button "Data/ML" [ref=e57] [cursor=pointer]
          - button "View NEON PULSE project (2024) - MOTION DESIGN" [ref=e58] [cursor=pointer]:
            - generic [ref=e61]:
              - heading "NEON PULSE" [level=3] [ref=e62]
              - generic [ref=e64]: "2024"
          - button "View LIQUID FLOW project (2024) - EXPERIMENTAL" [ref=e66] [cursor=pointer]:
            - generic [ref=e69]:
              - heading "LIQUID FLOW" [level=3] [ref=e70]
              - generic [ref=e72]: "2024"
          - button "View TASKFLOW DASHBOARD project (2024) - PRODUCTIVITY TOOL" [ref=e74] [cursor=pointer]:
            - generic [ref=e77]:
              - heading "TASKFLOW DASHBOARD" [level=3] [ref=e78]
              - generic [ref=e80]: "2024"
          - button "View CLIMATE VIZ project (2023) - DATA VISUALIZATION" [ref=e82] [cursor=pointer]:
            - generic [ref=e85]:
              - heading "CLIMATE VIZ" [level=3] [ref=e86]
              - generic [ref=e88]: "2023"
          - button "View Dynamic Interface Flow project (2025) - Motion Graphics" [ref=e90] [cursor=pointer]:
            - generic [ref=e93]:
              - heading "Dynamic Interface Flow" [level=3] [ref=e94]
              - generic [ref=e96]: "2025"
          - navigation "Project pages" [ref=e98]:
            - link "NEON PULSE" [ref=e99] [cursor=pointer]:
              - /url: /projects/neon-pulse
            - link "LIQUID FLOW" [ref=e100] [cursor=pointer]:
              - /url: /projects/liquid-flow
            - link "TASKFLOW DASHBOARD" [ref=e101] [cursor=pointer]:
              - /url: /projects/taskflow-dashboard
            - link "CLIMATE VIZ" [ref=e102] [cursor=pointer]:
              - /url: /projects/climate-viz
            - link "Dynamic Interface Flow" [ref=e103] [cursor=pointer]:
              - /url: /projects/motion-ui-abstract
      - region "CREATIVE DEVELOPER IN MOTION" [ref=e104]:
        - generic [ref=e105]:
          - paragraph [ref=e106]: ABOUT DANIEL
          - heading "CREATIVE DEVELOPER IN MOTION" [level=2] [ref=e107]
          - paragraph [ref=e108]: I build small visual systems that connect motion graphics, interactive code, and early ML/data experiments. My work is still growing, but it is grounded in curiosity, clear process, and a love for turning abstract ideas into moving, usable things.
          - list "Skills and tools" [ref=e109]:
            - listitem [ref=e110]: AFTER EFFECTS
            - listitem [ref=e111]: /
            - listitem [ref=e112]: CINEMA 4D
            - listitem [ref=e113]: /
            - listitem [ref=e114]: PYTHON
            - listitem [ref=e115]: /
            - listitem [ref=e116]: DATA VISUALIZATION
          - link "GITHUB" [ref=e118] [cursor=pointer]:
            - /url: https://github.com/danielsolo707
      - region "LET'S TALK" [ref=e119]:
        - generic [ref=e121]:
          - paragraph [ref=e122]: GET IN TOUCH
          - button "LET'S TALK" [ref=e123] [cursor=pointer]
        - generic [ref=e124]:
          - paragraph [ref=e125]: © 2026 DANIEL PORTFOLIO
          - navigation "Social links" [ref=e126]:
            - link "Instagram" [ref=e127] [cursor=pointer]:
              - /url: https://instagram.com
            - link "Vimeo" [ref=e128] [cursor=pointer]:
              - /url: https://vimeo.com
            - link "Open hidden arcade" [ref=e129] [cursor=pointer]:
              - /url: /arcade
              - text: ARCADE
  - button "Open Next.js Dev Tools" [ref=e136] [cursor=pointer]:
    - img [ref=e137]
  - alert [ref=e140]
```

# Test source

```ts
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
  150 |         }
  151 | 
  152 |         await page.goto('/');
  153 |         await page.waitForLoadState('networkidle');
  154 | 
  155 |         const menuButton = page.locator('button[class*="menu"], button[class*="hamburger"], [aria-label*="menu"]');
  156 |         
  157 |         if (await menuButton.count() > 0) {
  158 |           await menuButton.first().click();
  159 |           await page.waitForTimeout(500);
  160 | 
  161 |           const navContent = page.locator('nav ul, [class*="menu"] a').first();
> 162 |           await expect(navContent).toBeVisible();
      |                                    ^ Error: expect(locator).toBeVisible() failed
  163 |         }
  164 |       });
  165 | 
  166 |       test('No critical console errors on homepage', async ({ page }) => {
  167 |         const errors: string[] = [];
  168 |         page.on('console', msg => {
  169 |           if (msg.type() === 'error') errors.push(msg.text());
  170 |         });
  171 |         page.on('pageerror', err => errors.push(err.message));
  172 | 
  173 |         await page.goto('/');
  174 |         await page.waitForLoadState('networkidle');
  175 |         await page.waitForTimeout(2000);
  176 | 
  177 |         const criticalErrors = errors.filter(e => 
  178 |           !e.includes('Warning') && 
  179 |           !e.includes('DevTools') && 
  180 |           !e.includes('favicon') &&
  181 |           !e.includes('hydration') &&
  182 |           !e.includes('404')
  183 |         );
  184 |         
  185 |         console.log(`Viewport: ${viewport.name}, Critical errors: ${criticalErrors.length}`);
  186 |       });
  187 | 
  188 |       test('All links are clickable', async ({ page }) => {
  189 |         await page.goto('/');
  190 |         await page.waitForLoadState('networkidle');
  191 | 
  192 |         const links = page.locator('a[href]');
  193 |         const firstLink = links.first();
  194 |         await expect(firstLink).toBeVisible();
  195 |       });
  196 | 
  197 |       test('Images load without breaking', async ({ page }) => {
  198 |         await page.goto('/');
  199 |         await page.waitForLoadState('networkidle');
  200 | 
  201 |         const images = page.locator('img');
  202 |         const count = await images.count();
  203 |         
  204 |         if (count > 0) {
  205 |           const firstImg = images.first();
  206 |           const isVisible = await firstImg.isVisible();
  207 |           if (isVisible) {
  208 |             const naturalWidth = await firstImg.evaluate(el => (el as HTMLImageElement).naturalWidth);
  209 |             expect(naturalWidth).toBeGreaterThanOrEqual(0);
  210 |           }
  211 |         }
  212 |       });
  213 | 
  214 |       test('No horizontal scroll on any page', async ({ page }) => {
  215 |         await page.goto('/');
  216 |         await page.waitForLoadState('networkidle');
  217 | 
  218 |         const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  219 |         const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  220 |         
  221 |         expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  222 |       });
  223 |     });
  224 |   }
  225 | });
  226 | 
  227 | test.describe('Cross-Device Consistency', () => {
  228 |   test('Homepage loads consistently across all viewports', async ({ page }) => {
  229 |     const sizes = [
  230 |       { width: 1920, height: 1080 },
  231 |       { width: 768, height: 1024 },
  232 |       { width: 375, height: 667 },
  233 |     ];
  234 | 
  235 |     for (const size of sizes) {
  236 |       await page.setViewportSize(size);
  237 |       await page.goto('/');
  238 |       await page.waitForLoadState('networkidle');
  239 |       
  240 |       await expect(page.locator('main')).toBeVisible();
  241 |       await expect(page.locator('#main-content')).toBeVisible();
  242 |     }
  243 |   });
  244 | 
  245 |   test('All major routes are accessible', async ({ page }) => {
  246 |     const routes = ['/', '/works', '/works/code', '/works/motion', '/projects', '/arcade', '/arcade/2048'];
  247 |     
  248 |     for (const route of routes) {
  249 |       await page.goto(route);
  250 |       await page.waitForLoadState('networkidle');
  251 |       
  252 |       const body = page.locator('body');
  253 |       await expect(body).toBeVisible();
  254 |     }
  255 |   });
  256 | });
```