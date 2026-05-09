import { chromium } from '@playwright/test';

async function checkDashboardFull() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:9002/dashboard');
    await page.waitForLoadState('networkidle');

    // Login
    const loginForm = page.locator('input[name="username"]');
    if (await loginForm.isVisible({ timeout: 5000 })) {
      await loginForm.fill('admin');
      await page.locator('input[name="password"]').fill('admin123');
      await page.locator('button[type="submit"]').click();
      await page.waitForLoadState('networkidle');
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'dashboard-full.png', fullPage: true });

    // Get all text content
    const bodyText = await page.locator('body').textContent();
    console.log('Page contains Dynamic Interface Flow:', bodyText?.includes('Dynamic Interface Flow'));
    console.log('Page contains MOTION:', bodyText?.includes('MOTION'));
    console.log('Page contains CODE:', bodyText?.includes('CODE'));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkDashboardFull();