import { chromium } from '@playwright/test';

async function checkDashboard() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to dashboard...');
    await page.goto('http://localhost:9002/dashboard');
    await page.waitForLoadState('networkidle');

    // Login if needed
    const loginForm = page.locator('input[name="username"]');
    if (await loginForm.isVisible({ timeout: 5000 })) {
      console.log('Logging in...');
      await loginForm.fill('admin');
      await page.locator('input[name="password"]').fill('admin123');
      await page.locator('button[type="submit"]').click();
      await page.waitForLoadState('networkidle');
    }

    console.log('Taking screenshot of full dashboard...');
    await page.screenshot({ path: 'dashboard-full.png', fullPage: true });
    console.log('Screenshot saved to dashboard-full.png');

    // Look for any video/file references
    const pageContent = await page.content();
    if (pageContent.includes('L06')) {
      console.log('✓ Found reference to L06 in page!');
    }
    if (pageContent.includes('.mp4')) {
      console.log('✓ Found reference to mp4 in page!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkDashboard();