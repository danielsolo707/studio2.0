import { test, expect } from '@playwright/test';

test('Add Vimeo video to Animation Bootcamp', async ({ page }) => {
  // Login
  await page.goto('/dashboard');
  await page.waitForSelector('#admin-user', { timeout: 10000 });
  await page.fill('#admin-user', 'admin');
  await page.fill('#admin-pass', 'Abc138282');
  await page.click('button:has-text("SIGN IN")');
  await expect(page.locator('h1:has-text("DASHBOARD")')).toBeVisible({ timeout: 15000 });

  // Add Vimeo video via API (uses browser's session cookie for auth)
  const ok = await page.evaluate(async () => {
    // First get current project data
    const getRes = await fetch('/api/admin/update-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'som-animation-bootcamp',
        updates: {
          media: [
            { type: 'video', url: '/uploads/e2a10b05-bf1f-4486-9b9d-bde2a7df0c86.mp4', storage: 'local', fileId: 'e2a10b05-bf1f-4486-9b9d-bde2a7df0c86' },
            { type: 'video', url: '/uploads/33f8e06c-4325-42a9-9c1b-5ba8aabcad84.mp4', storage: 'local', fileId: '33f8e06c-4325-42a9-9c1b-5ba8aabcad84' },
            { type: 'video', url: 'https://vimeo.com/1196314298' },
          ],
          videoUrl: 'https://vimeo.com/1196314298',
        },
      }),
    });
    return getRes.ok;
  });

  expect(ok).toBeTruthy();
  console.log('Vimeo video added to Animation Bootcamp');
});
