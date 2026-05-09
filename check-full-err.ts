import { chromium } from '@playwright/test';

async function checkFullErrors() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`${response.status()} - ${response.url()}`);
    }
  });

  try {
    await page.goto('http://localhost:9002/works/motion');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'works-check.png', fullPage: true });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkFullErrors();