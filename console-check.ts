import { chromium } from '@playwright/test';

async function checkBrowserConsole() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to console messages
  page.on('console', msg => {
    console.log(`Console [${msg.type()}]: ${msg.text()}`);
  });

  // Listen to page errors
  page.on('pageerror', error => {
    console.log(`Page error: ${error.message}`);
  });

  try {
    await page.goto('http://localhost:9002/works/motion', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(10000);
    
    await page.screenshot({ path: 'console-check.png', fullPage: true });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkBrowserConsole();