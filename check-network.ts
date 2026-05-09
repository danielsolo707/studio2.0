import { chromium } from '@playwright/test';

async function checkNetworkRequests() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    if (status >= 400) {
      console.log(`Failed: ${status} ${url}`);
    }
  });

  try {
    await page.goto('http://localhost:9002/works/motion');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkNetworkRequests();