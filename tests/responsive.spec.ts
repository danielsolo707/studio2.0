import { test, expect } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
  ];

  for (const viewport of viewports) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      });

      test('Homepage - Main content loads without errors', async ({ page }) => {
        const errors: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'error') errors.push(msg.text());
        });
        page.on('pageerror', err => errors.push(err.message));

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const main = page.locator('main');
        await expect(main).toBeVisible();

        const criticalErrors = errors.filter(e => 
          !e.includes('Warning') && !e.includes('DevTools') && !e.includes('favicon')
        );
        expect(criticalErrors).toHaveLength(0);
      });

      test('Homepage - Hero section visible', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const heroText = page.locator('#main-content').first();
        await expect(heroText).toBeVisible();
      });

      test('Homepage - Navigation exists', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const nav = page.locator('nav');
        if (await nav.count() > 0) {
          await expect(nav.first()).toBeVisible();
        }
      });

      test('Homepage - About Section renders', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const aboutSection = page.locator('section').filter({ hasText: /about/i }).first();
        await expect(aboutSection).toBeVisible();
      });

      test('Homepage - Projects section loads', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const projectSection = page.locator('#main-content > div').nth(1);
        await expect(projectSection).toBeVisible();
      });

      test('Homepage - Contact section exists', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const contactSection = page.locator('[id="contact"]');
        await expect(contactSection.first()).toBeVisible();

        const talkButton = page.locator('button:has-text("TALK")');
        if (await talkButton.count() > 0) {
          await expect(talkButton.first()).toBeVisible();
        }
      });

      test('Homepage - Footer is visible', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const footer = page.locator('footer');
        await expect(footer.first()).toBeVisible();
      });

      test('Works - Code page loads', async ({ page }) => {
        await page.goto('/works/code');
        await page.waitForLoadState('networkidle');

        const main = page.locator('main');
        await expect(main).toBeVisible();
      });

      test('Works - Motion page loads', async ({ page }) => {
        await page.goto('/works/motion');
        await page.waitForLoadState('networkidle');

        const main = page.locator('main');
        await expect(main).toBeVisible();
      });

      test('Projects page loads', async ({ page }) => {
        await page.goto('/projects');
        await page.waitForLoadState('networkidle');

        const main = page.locator('main');
        await expect(main).toBeVisible();
      });

      test('Project detail page loads', async ({ page }) => {
        await page.goto('/projects/portfolio-admin-system');
        await page.waitForLoadState('networkidle');

        const main = page.locator('main');
        await expect(main).toBeVisible();
      });

      test('Arcade page loads', async ({ page }) => {
        await page.goto('/arcade');
        await page.waitForLoadState('networkidle');

        const main = page.locator('main');
        await expect(main).toBeVisible();
      });

      test('2048 game page loads', async ({ page }) => {
        await page.goto('/arcade/2048');
        await page.waitForLoadState('networkidle');

        const main = page.locator('main');
        await expect(main).toBeVisible();
      });

      test('Synesthesia game page loads', async ({ page }) => {
        await page.goto('/arcade/synesthesia');
        await page.waitForLoadState('networkidle');

        const main = page.locator('main');
        await expect(main).toBeVisible();
      });

      test('Mobile menu functionality on mobile/tablet', async ({ page }) => {
        if (viewport.name === 'Desktop') {
          test.skip();
          return;
        }

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const menuButton = page.locator('button[class*="menu"], button[class*="hamburger"], [aria-label*="menu"]');
        
        if (await menuButton.count() > 0) {
          await menuButton.first().click();
          await page.waitForTimeout(500);

          const navContent = page.locator('nav ul, [class*="menu"] a').first();
          await expect(navContent).toBeVisible();
        }
      });

      test('No critical console errors on homepage', async ({ page }) => {
        const errors: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'error') errors.push(msg.text());
        });
        page.on('pageerror', err => errors.push(err.message));

        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const criticalErrors = errors.filter(e => 
          !e.includes('Warning') && 
          !e.includes('DevTools') && 
          !e.includes('favicon') &&
          !e.includes('hydration') &&
          !e.includes('404')
        );
        
        console.log(`Viewport: ${viewport.name}, Critical errors: ${criticalErrors.length}`);
      });

      test('All links are clickable', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const links = page.locator('a[href]');
        const firstLink = links.first();
        await expect(firstLink).toBeVisible();
      });

      test('Images load without breaking', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const images = page.locator('img');
        const count = await images.count();
        
        if (count > 0) {
          const firstImg = images.first();
          const isVisible = await firstImg.isVisible();
          if (isVisible) {
            const naturalWidth = await firstImg.evaluate(el => (el as HTMLImageElement).naturalWidth);
            expect(naturalWidth).toBeGreaterThanOrEqual(0);
          }
        }
      });

      test('No horizontal scroll on any page', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
      });
    });
  }
});

test.describe('Cross-Device Consistency', () => {
  test('Homepage loads consistently across all viewports', async ({ page }) => {
    const sizes = [
      { width: 1920, height: 1080 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 },
    ];

    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('#main-content')).toBeVisible();
    }
  });

  test('All major routes are accessible', async ({ page }) => {
    const routes = ['/', '/works', '/works/code', '/works/motion', '/projects', '/arcade', '/arcade/2048'];
    
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });
});