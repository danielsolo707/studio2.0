import { chromium } from '@playwright/test';

async function verifyUpload() {
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

    await page.waitForTimeout(1000);

    // Expand first MOTION section (the one with projects count)
    const motionBtn = page.locator('button:has-text("MOTION 3 projects")');
    if (await motionBtn.isVisible()) {
      await motionBtn.click();
      await page.waitForTimeout(1500);
    }

    // Find and expand Dynamic Interface Flow project
    const projectCard = page.locator('button:has-text("Dynamic Interface Flow")').last();
    if (await projectCard.isVisible()) {
      await projectCard.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: 'verify-upload.png', fullPage: true });

    // Check if media section is visible
    const mediaSection = page.locator('text=UPLOADED MEDIA');
    console.log('UPLOADED MEDIA visible:', await mediaSection.isVisible());
    
    // Check for video reference
    const videoRef = page.locator('text=L06');
    console.log('L06 visible:', await videoRef.isVisible());

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

verifyUpload();