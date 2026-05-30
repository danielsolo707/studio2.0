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

test.describe('Responsive layout', () => {
  test('no horizontal overflow on any viewport', async ({ page }) => {
    await waitForLoadingDone(page);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test('project cards are clickable on mobile', async ({ page, viewport }) => {
    if (!viewport || viewport.width >= 768) {
      test.skip(true, 'Mobile viewport only');
      return;
    }
    await waitForLoadingDone(page);

    const works = page.locator('#works');
    await works.scrollIntoViewIfNeeded();

    const firstProject = page.locator('#works [role="button"]').first();
    await expect(firstProject).toBeVisible();

    const href = await firstProject.getAttribute('aria-label');
    expect(href).toBeTruthy();
  });

  test('arcade page loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/arcade');
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });

  test('all main pages load without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    for (const path of ['/', '/gateway', '/arcade']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
    }

    expect(errors).toEqual([]);
  });
});
