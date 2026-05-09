import { chromium } from '@playwright/test';

async function checkUpload() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to dashboard...');
    await page.goto('http://localhost:9002/dashboard');
    await page.waitForLoadState('networkidle');

    // Login if needed
    const loginForm = page.locator('input[name="username"]');
    if (await loginForm.isVisible({ timeout: 5000 })) {
      console.log('Logging in...');
      await loginForm.fill('admin');
      await page.locator('input[name="password"]').fill('admin123');
      await page.locator('button[type="submit"]').click();
      await page.waitForLoadState('networkidle');
    }

    console.log('Looking for Dynamic Interface Flow project...');

    // Expand CODE section
    const codeSection = page.locator('button:has-text("CODE")').first();
    if (await codeSection.isVisible()) {
      await codeSection.click();
      await page.waitForTimeout(1000);
    }

    // Find and expand the project
    const allButtons = await page.locator('button').all();
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && text.includes('Dynamic Interface Flow')) {
        console.log('Expanding project...');
        await btn.click();
        await page.waitForTimeout(2000);
        break;
      }
    }

    // Look for uploaded media section
    console.log('Checking for uploaded media...');
    
    // Look for UPLOADED MEDIA section or media items
    const mediaSection = page.locator('text=UPLOADED MEDIA');
    if (await mediaSection.isVisible()) {
      console.log('✓ Found UPLOADED MEDIA section!');
      
      // Look for media items (video/image indicators)
      const mediaItems = page.locator('text=video');
      const itemCount = await mediaItems.count();
      console.log(`Found ${itemCount} media item(s)`);
      
      // Take a screenshot to see the media
      await page.screenshot({ path: 'uploaded-media-screenshot.png', fullPage: true });
      console.log('Screenshot saved to uploaded-media-screenshot.png');
    } else {
      console.log('No UPLOADED MEDIA section found');
    }
    
    // Also check the project page directly
    console.log('\nChecking project detail page...');
    await page.goto('http://localhost:9002/projects/dynamic-interface-flow');
    await page.waitForLoadState('networkidle');
    
    // Check for video player or gallery
    const videoElement = page.locator('video');
    if (await videoElement.isVisible()) {
      console.log('✓ Video is visible on project page!');
    }
    
    const gallerySection = page.locator('text=PROJECT GALLERY');
    if (await gallerySection.isVisible()) {
      console.log('✓ Found PROJECT GALLERY section on detail page');
    }
    
    // Take a screenshot of the project page
    await page.screenshot({ path: 'project-detail-screenshot.png', fullPage: true });
    console.log('Screenshot saved to project-detail-screenshot.png');

  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    console.log('\nDone!');
    await browser.close();
  }
}

checkUpload();