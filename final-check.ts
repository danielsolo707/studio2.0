import { chromium } from '@playwright/test';

async function refreshAndCheck() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Hard refresh
    await page.goto('http://localhost:9002/projects/motion-ui-abstract');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'final-check.png', fullPage: true });
    
    // Take video element screenshot specifically
    const video = page.locator('video');
    if (await video.isVisible()) {
      console.log('✓ Video element is visible!');
      const src = await video.getAttribute('src');
      console.log('  src:', src);
    } else {
      console.log('Video not visible');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

refreshAndCheck();