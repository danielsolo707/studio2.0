import { chromium } from '@playwright/test';

async function investigateUpload() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('=== Step 1: Navigate to dashboard ===');
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

    console.log('\n=== Step 2: Expand CODE section ===');
    const codeSection = page.locator('button:has-text("CODE")').first();
    if (await codeSection.isVisible()) {
      await codeSection.click();
      await page.waitForTimeout(1000);
    }

    console.log('\n=== Step 3: Find and expand Dynamic Interface Flow ===');
    const allButtons = await page.locator('button').all();
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && text.includes('Dynamic Interface Flow')) {
        console.log(`Found project button: "${text.trim()}"`);
        await btn.click();
        await page.waitForTimeout(2000);
        break;
      }
    }

    console.log('\n=== Step 4: Check form fields ===');
    // Check what input fields are available
    const fileInputs = page.locator('input[type="file"]');
    const inputCount = await fileInputs.count();
    console.log(`Found ${inputCount} file input(s)`);

    // Check for any upload-related elements
    const uploadButtons = page.locator('button:has-text("UPLOAD")');
    const uploadBtnCount = await uploadButtons.count();
    console.log(`Found ${uploadBtnCount} UPLOAD button(s)`);

    // Get page HTML to understand structure
    const html = await page.content();
    
    // Look for video references in the HTML
    console.log('\n=== Step 5: Check page content ===');
    if (html.includes('L06')) {
      console.log('✓ Found L06 in page HTML');
    }
    if (html.includes('UPLOADED MEDIA')) {
      console.log('✓ Found UPLOADED MEDIA in page HTML');
    }
    if (html.includes('.mp4')) {
      console.log('✓ Found .mp4 in page HTML');
    }

    // Take screenshot
    await page.screenshot({ path: 'investigate-1.png', fullPage: true });
    console.log('Screenshot saved');

    console.log('\n=== Step 6: Do a fresh upload ===');
    const videoPath = 'C:\\Users\\ASUS\\Desktop\\DanielEmpire\\Motion\\L06_UI_Main H_1920x1080.mp4';
    console.log(`Setting file: ${videoPath}`);
    
    // Try to find and fill file input
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(videoPath);
    await page.waitForTimeout(1000);

    // Click START UPLOAD button
    const startBtn = page.locator('button:has-text("START UPLOAD")').first();
    if (await startBtn.isVisible()) {
      console.log('Clicking START UPLOAD...');
      await startBtn.click();
      
      // Wait for upload
      for (let i = 0; i < 20; i++) {
        await page.waitForTimeout(1000);
        const done = page.locator('text=✓ Done');
        if (await done.isVisible()) {
          console.log('Upload completed!');
          break;
        }
        console.log(`Waiting... ${i + 1}/20`);
      }
    }

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'investigate-2.png', fullPage: true });
    console.log('Screenshot after upload saved');

    // Check again what's visible
    const updatedHtml = await page.content();
    if (updatedHtml.includes('UPLOADED MEDIA')) {
      console.log('✓ UPLOADED MEDIA found after upload!');
    }
    if (updatedHtml.includes('L06')) {
      console.log('✓ L06 found after upload!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.log('\nDone!');
    await browser.close();
  }
}

investigateUpload();