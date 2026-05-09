import { chromium } from '@playwright/test';

async function uploadVideo() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to dashboard
    console.log('Navigating to dashboard...');
    await page.goto('http://localhost:9002/dashboard');

    // Wait for login form or dashboard to load
    await page.waitForLoadState('networkidle');

    // Check if we need to login
    const loginForm = page.locator('input[name="username"]');
    if (await loginForm.isVisible({ timeout: 5000 })) {
      console.log('Logging in...');
      await loginForm.fill('admin');
      await page.locator('input[name="password"]').fill('admin123');
      await page.locator('button[type="submit"]').click();
      await page.waitForLoadState('networkidle');
    }

    console.log('Looking for Dynamic Interface Flow project...');

    // Click on CODE section to expand it
    const codeSection = page.locator('button:has-text("CODE")').first();
    if (await codeSection.isVisible()) {
      await codeSection.click();
      await page.waitForTimeout(1000);
    }

    // Find and click the project row
    const allButtons = await page.locator('button').all();
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && text.includes('Dynamic Interface Flow')) {
        console.log('Found project, clicking to expand...');
        await btn.click();
        await page.waitForTimeout(2000);
        break;
      }
    }

    // Set the video file
    const videoPath = 'C:\\Users\\ASUS\\Desktop\\DanielEmpire\\Motion\\L06_UI_Main H_1920x1080.mp4';
    console.log(`Setting file: ${videoPath}`);
    
    const fileInputs = page.locator('input[type="file"]');
    await fileInputs.first().setInputFiles(videoPath);
    await page.waitForTimeout(2000);

    // Click the first START UPLOAD button (from the project form)
    console.log('Clicking START UPLOAD...');
    await page.locator('button:has-text("START UPLOAD")').first().click();
    
    // Wait for upload to complete - watch for progress
    console.log('Upload started, waiting for completion...');
    
    // Wait for the status to show "Done" or for the file to appear in the list
    let completed = false;
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(1000);
      const doneText = page.locator('text=✓ Done');
      const progressText = page.locator('text=%');
      
      if (await doneText.isVisible()) {
        console.log('Upload completed!');
        completed = true;
        break;
      }
      
      if (!(await progressText.first().isVisible())) {
        // No more progress, check if done
        await page.waitForTimeout(2000);
        if (await doneText.isVisible()) {
          console.log('Upload completed!');
          completed = true;
          break;
        }
      }
      
      console.log(`Waiting... ${i + 1}/30`);
    }
    
    if (!completed) {
      console.log('Upload may have completed, checking status...');
    }

    console.log('Done!');

  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

uploadVideo();