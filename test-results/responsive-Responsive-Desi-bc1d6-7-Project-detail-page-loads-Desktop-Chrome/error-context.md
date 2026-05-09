# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive.spec.ts >> Responsive Design Tests >> Mobile (375x667) >> Project detail page loads
- Location: tests\responsive.spec.ts:114:11

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('main')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('main')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - generic [ref=e13]:
    - heading "404" [level=1] [ref=e14]
    - paragraph [ref=e15]: PAGE NOT FOUND
    - paragraph [ref=e16]: The page you're looking for doesn't exist or has been moved.
    - link "BACK TO HOME" [ref=e17] [cursor=pointer]:
      - /url: /
```

# Test source

```ts
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
  49  |           await expect(nav.first()).toBeVisible();
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
> 119 |         await expect(main).toBeVisible();
      |                            ^ Error: expect(locator).toBeVisible() failed
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
```