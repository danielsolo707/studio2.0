import { chromium } from '@playwright/test';

async function checkProjectPage() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:9002/projects/taskflow-dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'project-code.png', fullPage: true });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkProjectPage();