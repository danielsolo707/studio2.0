import { test, expect } from '@playwright/test';

async function waitForLoadingDone(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  const loader = page.locator('[role="progressbar"]');
  try {
    await loader.waitFor({ state: 'hidden', timeout: 10000 });
  } catch {
    // loader already gone
  }
}

test.describe('Navigation', () => {
  test('desktop nav links scroll to sections', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop only');
    await waitForLoadingDone(page);

    const worksLink = page.locator('nav[aria-label="Main navigation"] a[href="#works"]').first();
    await worksLink.click();
    await expect(page.locator('#works')).toBeInViewport();
  });

  test('mobile menu opens and closes on small screens', async ({ page, viewport }) => {
    if (!viewport || viewport.width >= 768) {
      test.skip(true, 'Mobile viewport only');
      return;
    }
    await waitForLoadingDone(page);

    const toggleBtn = page.getByRole('button', { name: /Toggle navigation menu/i });
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    const mobileNav = page.locator('nav[aria-label="Main navigation"]').last();
    await expect(mobileNav).toBeVisible();

    const closeBtn = page.getByRole('button', { name: /Close menu/i });
    await closeBtn.click();
    await expect(mobileNav).not.toBeVisible();
  });

  test('gateway page loads', async ({ page }) => {
    await page.goto('/gateway');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1').first();
    await expect(heading).toBeAttached();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });
});
