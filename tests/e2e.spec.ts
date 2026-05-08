import { test, expect } from '@playwright/test';

test.describe('Portfolio Website E2E Tests', () => {
  test('homepage loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('http://localhost:9002');
    await page.waitForLoadState('networkidle');

    // Check page loads
    await expect(page).toHaveTitle(/Fluid Logic/i);
    
    // Check no critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('Warning') && 
      !e.includes('DevTools') &&
      !e.includes('favicon')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('navigation links work', async ({ page }) => {
    await page.goto('http://localhost:9002');
    
    // Test about section scroll
    const aboutLink = page.locator('a[href="#about"]').first();
    await aboutLink.click();
    await page.waitForTimeout(500);
    
    // Test contact section scroll
    const contactLink = page.locator('a[href="#contact"]').first();
    await contactLink.click();
    await page.waitForTimeout(500);
  });

  test('arcade page loads', async ({ page }) => {
    await page.goto('http://localhost:9002/arcade');
    await page.waitForLoadState('networkidle');
    
    // Check arcade page loads
    await expect(page.locator('body')).toBeVisible();
  });

  test('arcade/2048 page loads', async ({ page }) => {
    await page.goto('http://localhost:9002/arcade/2048');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('contact form validation', async ({ page }) => {
    await page.goto('http://localhost:9002');
    await page.locator('a[href="#contact"]').first().click();
    await page.getByRole('button', { name: /let's talk/i }).click();
    
    // Fill invalid data
    await page.fill('input[name="name"]', 'A');
    await page.fill('input[name="email"]', 'invalid');
    await page.fill('textarea[name="message"]', 'short');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
    
    // Check validation errors appear
    const body = await page.locator('body').textContent();
    expect(body).toMatch(/character|invalid|10/i);
  });

  test('project filters and detail links work', async ({ page }) => {
    await page.goto('http://localhost:9002');
    await page.locator('a[href="#about"]').first().click();
    await page.getByRole('button', { name: 'Creative Code', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'PORTFOLIO ADMIN SYSTEM' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'CHROME FLOW' })).toHaveCount(0);

    await page.getByRole('button', { name: 'All' }).click();
    await expect(page.getByRole('heading', { name: 'CHROME FLOW' })).toBeVisible();

    await page.getByRole('button', { name: /View PORTFOLIO ADMIN SYSTEM project/i }).click();
    await expect(page.getByRole('link', { name: /github/i })).toBeVisible();
    await expect(page.getByText('Creative Code / 2026')).toBeVisible();
  });

  test('dashboard login page loads', async ({ page }) => {
    await page.goto('http://localhost:9002/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check login form appears
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('projects page loads', async ({ page }) => {
    await page.goto('http://localhost:9002/projects');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });
});
