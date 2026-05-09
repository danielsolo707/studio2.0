import { chromium } from '@playwright/test';

async function checkWorksPageErrors() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('requestfailed', request => {
    errors.push(`Failed: ${request.url()} - ${request.failure()?.errorText}`);
  });

  try {
    await page.goto('http://localhost:9002/works/motion');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'works-errors.png', fullPage: true });
    
    console.log('Errors found:', errors.length);
    errors.forEach((e, i) => console.log(`${i + 1}. ${e}`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkWorksPageErrors();