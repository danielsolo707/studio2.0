import { chromium } from '@playwright/test';

async function uploadWithDebug() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for network requests
  page.on('request', request => {
    const url = request.url();
    if (url.includes('upload') || url.includes('media')) {
      console.log('REQUEST:', request.method(), url);
    }
  });

  page.on('response', response => {
    const url = response.url();
    if (url.includes('upload') || url.includes('media')) {
      console.log('RESPONSE:', response.status(), url);
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });

  try {
    console.log('Step 1: Navigate to dashboard...');
    await page.goto('http://localhost:9002/dashboard');
    await page.waitForLoadState('networkidle');

    // Login
    const loginForm = page.locator('input[name="username"]');
    if (await loginForm.isVisible({ timeout: 5000 })) {
      await loginForm.fill('admin');
      await page.locator('input[name="password"]').fill('admin123');
      await page.locator('button[type="submit"]').click();
      await page.waitForLoadState('networkidle');
    }

    console.log('\nStep 2: Expand CODE section...');
    const codeSection = page.locator('button:has-text("CODE")').first();
    if (await codeSection.isVisible()) {
      await codeSection.click();
      await page.waitForTimeout(1000);
    }

    console.log('\nStep 3: Click on Dynamic Interface Flow...');
    const allButtons = await page.locator('button').all();
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && text.includes('Dynamic Interface Flow')) {
        await btn.click();
        await page.waitForTimeout(3000);
        break;
      }
    }

    console.log('\nStep 4: Select video file...');
    const videoPath = 'C:\\Users\\ASUS\\Desktop\\DanielEmpire\\Motion\\L06_UI_Main H_1920x1080.mp4';
    
    // Find file input
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(videoPath);
    await page.waitForTimeout(2000);

    console.log('\nStep 5: Click START UPLOAD...');
    const startBtn = page.locator('button:has-text("START UPLOAD")').first();
    await startBtn.click();
    
    // Wait for completion or errors
    for (let i = 0; i < 40; i++) {
      await page.waitForTimeout(1000);
      
      // Check for success
      const done = page.locator('text=✓ Done');
      if (await done.isVisible()) {
        console.log('✓ Upload completed!');
        break;
      }
      
      // Check for errors
      const error = page.locator('.text-red-400, .text-red-500');
      if (await error.isVisible()) {
        const errorText = await error.textContent();
        console.log('ERROR:', errorText);
        break;
      }
      
      console.log(`Waiting... ${i + 1}/40`);
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'upload-result.png', fullPage: true });

    console.log('\nDone!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

uploadWithDebug();