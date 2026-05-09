import { chromium } from '@playwright/test';

async function checkMotionProject() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:9002/projects/motion-ui-abstract');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'motion-project.png', fullPage: true });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkMotionProject();