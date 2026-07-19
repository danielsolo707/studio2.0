import { expect, test } from '@playwright/test';

async function expectConfiguredProjectVideos(
  page: import('@playwright/test').Page,
  expectedCount: number,
) {
  const projectVideos = page.locator(
    'iframe[src*="player.vimeo.com"][src*="autoplay=1"][src*="muted=1"][src*="controls=1"], video[autoplay][controls]',
  );
  await expect(projectVideos).toHaveCount(expectedCount);

  for (let index = 0; index < expectedCount; index += 1) {
    const embed = projectVideos.nth(index);
    await embed.scrollIntoViewIfNeeded();
    await expect(embed).toBeVisible();

    const source = await embed.getAttribute('src');
    if (source?.includes('player.vimeo.com')) {
      const playerUrl = new URL(source);
      expect(playerUrl.hostname).toBe('player.vimeo.com');
      expect(playerUrl.searchParams.get('autoplay')).toBe('1');
      expect(playerUrl.searchParams.get('muted')).toBe('1');
      expect(playerUrl.searchParams.get('loop')).toBe('1');
      expect(playerUrl.searchParams.get('controls')).toBe('1');
      expect(playerUrl.searchParams.get('playsinline')).toBe('1');
      await expect(embed).toHaveAttribute('allow', /autoplay/);
      await expect(embed).toHaveAttribute('allowfullscreen', '');
    } else {
      await expect.poll(() => embed.evaluate((element: HTMLVideoElement) => (
        !element.paused && element.readyState >= 2
      )), { timeout: 15_000 }).toBe(true);

      const timeBefore = await embed.evaluate((element: HTMLVideoElement) => element.currentTime);
      await page.waitForTimeout(1_500);
      const timeAfter = await embed.evaluate((element: HTMLVideoElement) => element.currentTime);
      expect(timeAfter).toBeGreaterThan(timeBefore);
    }
  }
}

test.describe('AI and motion runtime fixes', () => {
  test('motion grid uses lightweight posters and project videos autoplay with controls', async ({ page }) => {
    await page.goto('/works/motion');
    await expect(page.getByRole('heading', { name: /motion\s+design/i })).toBeVisible();

    expect(await page.locator('iframe[src*="player.vimeo.com"]').count()).toBe(0);
    expect(await page.getByRole('button').filter({ has: page.locator('svg.lucide-maximize-2') }).count()).toBe(0);

    await page.goto('/projects/systemic-motion-physics');
    await expect(page.getByRole('heading', { name: 'Physics & Precision' })).toBeVisible();
    await expectConfiguredProjectVideos(page, 3);

    await page.goto('/projects/som-animation-bootcamp');
    await expect(page.getByRole('heading', { name: 'Animation Bootcamp' })).toBeVisible();
    await expectConfiguredProjectVideos(page, 2);

    await page.goto('/projects/som-advanced-motion-methods');
    await expect(page.getByRole('heading', { name: 'Complex Systems' })).toBeVisible();
    await expectConfiguredProjectVideos(page, 1);

    await expect(page.getByRole('button', { name: /^Play / })).toHaveCount(0);
  });

  test('public assistant returns a live model response', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open Studio Assistant' }).click();
    await page.getByRole('button', { name: 'What kind of projects does Daniel build?' }).click();

    const assistant = page.locator('section').filter({ hasText: 'STUDIO ASSISTANT' }).last();
    await expect(assistant).toContainText(/Daniel (builds|combines|creates)/i, { timeout: 20_000 });
    await expect(assistant).not.toContainText('The live assistant is resting');
    await expect(assistant).not.toContainText('local portfolio guide');
  });
});
