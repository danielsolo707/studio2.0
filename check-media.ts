import { chromium } from '@playwright/test';

async function checkProjectMedia() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Step 1: Navigate to project detail...');
    await page.goto('http://localhost:9002/projects/dynamic-interface-flow');
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

    console.log('\nStep 2: Get page HTML to find media info...');
    const html = await page.content();
    
    // Check what media is in the HTML
    if (html.includes('/api/media/')) {
      console.log('✓ Found /api/media/ references in page');
      
      // Extract media URLs
      const mediaMatches = html.match(/"\/api\/media\/[^"]+"/g);
      if (mediaMatches) {
        console.log('Media URLs found:', mediaMatches);
      }
    }
    
    if (html.includes('L06')) {
      console.log('✓ Found L06 in page');
    }
    
    if (html.includes('.mp4')) {
      console.log('✓ Found .mp4 in page');
    }

    console.log('\nStep 3: Take screenshot...');
    await page.screenshot({ path: 'project-media.png', fullPage: true });
    console.log('Screenshot saved');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkProjectMedia();