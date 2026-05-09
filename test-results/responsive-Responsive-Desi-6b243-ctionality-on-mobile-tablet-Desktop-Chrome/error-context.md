# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive.spec.ts >> Responsive Design Tests >> Tablet (768x1024) >> Mobile menu functionality on mobile/tablet
- Location: tests\responsive.spec.ts:146:11

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button[class*="menu"], button[class*="hamburger"], [aria-label*="menu"]').first()
    - locator resolved to <button aria-expanded="false" aria-label="Toggle navigation menu" class="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#DFFF00]/50">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    37 × waiting for element to be visible, enabled and stable
       - element is not visible
     - retrying click action
       - waiting 500ms

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
          - navigation "Main navigation" [ref=e11]:
            - link "ABOUT" [ref=e12] [cursor=pointer]:
              - /url: "#about"
            - link "WORKS" [ref=e13] [cursor=pointer]:
              - /url: "#works"
            - link "MOTION" [ref=e14] [cursor=pointer]:
              - /url: /works/motion
            - link "CODE" [ref=e15] [cursor=pointer]:
              - /url: /works/code
            - link "CONTACT" [ref=e16] [cursor=pointer]:
              - /url: "#contact"
        - generic [ref=e19]:
          - heading "CREATIVE DEVELOPER" [level=1] [ref=e21]
          - paragraph [ref=e22]: Creative developer specializing in motion design (After Effects, Cinema 4D) and machine learning. Building interactive web experiences that blend visual storytelling with intelligent systems.
          - link "VIEW WORKS" [ref=e24] [cursor=pointer]:
            - /url: "#works"
          - paragraph [ref=e28]: SCROLL TO EXPLORE
      - region "SELECTED WORKS" [ref=e36]:
        - generic [ref=e37]:
          - generic [ref=e38]:
            - generic [ref=e39]:
              - heading "SELECTED WORKS" [level=2] [ref=e40]
              - paragraph [ref=e41]: Motion studies, practical code prototypes, and small data experiments.
            - generic "Filter projects by discipline" [ref=e42]:
              - button "All" [pressed] [ref=e43] [cursor=pointer]
              - button "Motion" [ref=e44] [cursor=pointer]
              - button "Data/ML" [ref=e45] [cursor=pointer]
          - button "View NEON PULSE project (2024) - MOTION DESIGN" [ref=e46] [cursor=pointer]:
            - generic [ref=e49]:
              - heading "NEON PULSE" [level=3] [ref=e50]
              - generic [ref=e51]:
                - generic [ref=e52]: Case Study
                - generic [ref=e53]: "2024"
          - button "View LIQUID FLOW project (2024) - EXPERIMENTAL" [ref=e55] [cursor=pointer]:
            - generic [ref=e58]:
              - heading "LIQUID FLOW" [level=3] [ref=e59]
              - generic [ref=e60]:
                - generic [ref=e61]: Case Study
                - generic [ref=e62]: "2024"
          - button "View TASKFLOW DASHBOARD project (2024) - PRODUCTIVITY TOOL" [ref=e64] [cursor=pointer]:
            - generic [ref=e67]:
              - heading "TASKFLOW DASHBOARD" [level=3] [ref=e68]
              - generic [ref=e69]:
                - generic [ref=e70]: Case Study
                - generic [ref=e71]: "2024"
          - button "View CLIMATE VIZ project (2023) - DATA VISUALIZATION" [ref=e73] [cursor=pointer]:
            - generic [ref=e76]:
              - heading "CLIMATE VIZ" [level=3] [ref=e77]
              - generic [ref=e78]:
                - generic [ref=e79]: Prototype
                - generic [ref=e80]: "2023"
          - button "View Dynamic Interface Flow project (2025) - Motion Graphics" [ref=e82] [cursor=pointer]:
            - generic [ref=e85]:
              - heading "Dynamic Interface Flow" [level=3] [ref=e86]
              - generic [ref=e87]:
                - generic [ref=e88]: Case Study
                - generic [ref=e89]: "2025"
          - navigation "Project pages" [ref=e91]:
            - link "NEON PULSE" [ref=e92] [cursor=pointer]:
              - /url: /projects/neon-pulse
            - link "LIQUID FLOW" [ref=e93] [cursor=pointer]:
              - /url: /projects/liquid-flow
            - link "TASKFLOW DASHBOARD" [ref=e94] [cursor=pointer]:
              - /url: /projects/taskflow-dashboard
            - link "CLIMATE VIZ" [ref=e95] [cursor=pointer]:
              - /url: /projects/climate-viz
            - link "Dynamic Interface Flow" [ref=e96] [cursor=pointer]:
              - /url: /projects/motion-ui-abstract
      - region "CREATIVE DEVELOPER IN MOTION" [ref=e97]:
        - generic [ref=e98]:
          - paragraph [ref=e99]: ABOUT DANIEL
          - heading "CREATIVE DEVELOPER IN MOTION" [level=2] [ref=e100]
          - paragraph [ref=e101]: I build small visual systems that connect motion graphics, interactive code, and early ML/data experiments. My work is still growing, but it is grounded in curiosity, clear process, and a love for turning abstract ideas into moving, usable things.
          - list "Skills and tools" [ref=e102]:
            - listitem [ref=e103]: AFTER EFFECTS
            - listitem [ref=e104]: /
            - listitem [ref=e105]: CINEMA 4D
            - listitem [ref=e106]: /
            - listitem [ref=e107]: PYTHON
            - listitem [ref=e108]: /
            - listitem [ref=e109]: DATA VISUALIZATION
          - link "GITHUB" [ref=e111] [cursor=pointer]:
            - /url: https://github.com/danielsolo707
      - region "LET'S TALK" [ref=e112]:
        - generic [ref=e114]:
          - paragraph [ref=e115]: GET IN TOUCH
          - button "LET'S TALK" [ref=e116] [cursor=pointer]
        - generic [ref=e117]:
          - paragraph [ref=e118]: © 2026 DANIEL PORTFOLIO
          - navigation "Social links" [ref=e119]:
            - link "Instagram" [ref=e120] [cursor=pointer]:
              - /url: https://instagram.com
            - link "Vimeo" [ref=e121] [cursor=pointer]:
              - /url: https://vimeo.com
            - link "Open hidden arcade" [ref=e122] [cursor=pointer]:
              - /url: /arcade
              - text: ARCADE
  - button "Open Next.js Dev Tools" [ref=e129] [cursor=pointer]:
    - img [ref=e130]
  - alert [ref=e133]
```

# Test source

```ts
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
  150 |         }
  151 | 
  152 |         await page.goto('/');
  153 |         await page.waitForLoadState('networkidle');
  154 | 
  155 |         const menuButton = page.locator('button[class*="menu"], button[class*="hamburger"], [aria-label*="menu"]');
  156 |         
  157 |         if (await menuButton.count() > 0) {
> 158 |           await menuButton.first().click();
      |                                    ^ Error: locator.click: Test timeout of 30000ms exceeded.
  159 |           await page.waitForTimeout(500);
  160 | 
  161 |           const navContent = page.locator('nav ul, [class*="menu"] a').first();
  162 |           await expect(navContent).toBeVisible();
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