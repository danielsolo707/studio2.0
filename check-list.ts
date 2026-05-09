import { chromium } from '@playwright/test';

async function checkUploadList() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:9002/dashboard');
    await page.waitForLoadState('networkidle');

    const loginForm = page.locator('input[name="username"]');
    if (await loginForm.isVisible({ timeout: 5000 })) {
      await loginForm.fill('admin');
      await page.locator('input[name="password"]').fill('admin123');
      await page.locator('button[type="submit"]').click();
      await page.waitForLoadState('networkidle');
    }

    await page.waitForTimeout(1500);

    // Expand first MOTION section
    const motionBtn = page.locator('button:has-text("MOTION 3 projects")');
    if (await motionBtn.isVisible()) {
      await motionBtn.click();
      await page.waitForTimeout(1500);
    }

    // Find and expand Dynamic Interface Flow
    const allButtons = await page.locator('button').all();
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && text.includes('Dynamic Interface Flow')) {
        await btn.click();
        await page.waitForTimeout(2000);
        break;
      }
    }

    await page.screenshot({ path: 'check-list.png', fullPage: true });

    // Get page HTML to see what's there
    const html = await page.content();
    console.log('Has video input:', html.includes('input[type="file"]'));
    console.log('Has START UPLOAD:', html.includes('START UPLOAD'));
    console.log('Has L06:', html.includes('L06'));
    console.log('Has UPLOADED MEDIA:', html.includes('UPLOADED MEDIA'));
    console.log('Has mp4:', html.includes('.mp4'));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkUploadList();