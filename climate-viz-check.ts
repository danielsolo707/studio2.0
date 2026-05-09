import { chromium } from '@playwright/test';

async function checkProject() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:9002/projects/climate-viz');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000);
    
    await page.screenshot({ path: 'climate-viz-check.png', fullPage: true });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkProject();