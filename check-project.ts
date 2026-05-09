import { chromium } from '@playwright/test';

async function checkProjectPage() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:9002/projects/motion-ui-abstract');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'project-page.png', fullPage: true });

    // Check what's visible
    const video = page.locator('video');
    console.log('Video element visible:', await video.isVisible());

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkProjectPage();