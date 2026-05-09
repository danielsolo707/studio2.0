const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:9002');
  await page.waitForLoadState('networkidle');
  
  await new Promise(r => setTimeout(r, 3000));
  
  const midPoint = await page.evaluate(() => document.body.scrollHeight / 2);
  await page.evaluate((y) => window.scrollTo(0, y), midPoint);
  await new Promise(r => setTimeout(r, 3000));
  
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 3000));
  
  await page.screenshot({ path: 'fullpage-screenshot.png', fullPage: true });
  console.log('Screenshot saved as fullpage-screenshot.png');
  
  await browser.close();
})();