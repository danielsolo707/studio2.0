import { chromium } from '@playwright/test';

async function checkFailedRequests() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const failedUrls: string[] = [];
  page.on('requestfailed', request => {
    failedUrls.push(request.url());
  });

  try {
    await page.goto('http://localhost:9002/works/motion');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    console.log('Failed URLs:', failedUrls.length);
    failedUrls.forEach((url, i) => console.log(`${i + 1}. ${url}`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkFailedRequests();