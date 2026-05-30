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

test.describe('Homepage', () => {
  test('loads without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await waitForLoadingDone(page);

    expect(errors).toEqual([]);
  });

  test('hero section is visible', async ({ page }) => {
    await waitForLoadingDone(page);
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('CREATIVE');
  });

  test('scroll reveals works and about sections', async ({ page }) => {
    await waitForLoadingDone(page);

    const works = page.locator('#works');
    await works.scrollIntoViewIfNeeded();
    await expect(works).toBeVisible();

    const about = page.locator('#about');
    await about.scrollIntoViewIfNeeded();
    await expect(about).toBeVisible();
  });

  test('contact button toggles form', async ({ page }) => {
    await waitForLoadingDone(page);

    const contactSection = page.locator('#contact');
    await contactSection.scrollIntoViewIfNeeded();

    const btn = page.locator('#contact-heading');
    await expect(btn).toBeVisible();
    await btn.click();

    await expect(page.locator('#contact-form')).toBeVisible();
  });
});
