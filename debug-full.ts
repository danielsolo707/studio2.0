import { chromium } from '@playwright/test';

async function debugUploadFull() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture all requests/responses
  page.on('request', request => {
    const url = request.url();
    const method = request.method();
    if (url.includes('upload') || url.includes('media')) {
      console.log(`\n=== REQUEST: ${method} ${url} ===`);
      const headers = request.headers();
      console.log('Headers:', JSON.stringify(headers, null, 2));
    }
  });

  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    if (url.includes('upload') || url.includes('media')) {
      console.log(`\n=== RESPONSE: ${status} ${url} ===`);
      if (status >= 400) {
        response.text().then(text => console.log('Error body:', text)).catch(() => {});
      }
    }
  });

  page.on('console', msg => {
    console.log('CONSOLE:', msg.text());
  });

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

    // Expand MOTION
    const motionBtn = page.locator('button:has-text("MOTION 3 projects")');
    if (await motionBtn.isVisible()) {
      await motionBtn.click();
      await page.waitForTimeout(1500);
    }

    // Expand Dynamic Interface Flow
    const allButtons = await page.locator('button').all();
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && text.includes('Dynamic Interface Flow')) {
        await btn.click();
        await page.waitForTimeout(2500);
        break;
      }
    }

    console.log('\n=== Now ready to upload ===');
    
    // Get the file input
    const fileInputs = page.locator('input[type="file"]');
    const count = await fileInputs.count();
    console.log(`Found ${count} file input(s)`);
    
    if (count > 0) {
      const videoPath = 'C:\\Users\\ASUS\\Desktop\\DanielEmpire\\Motion\\L06_UI_Main H_1920x1080.mp4';
      await fileInputs.first().setInputFiles(videoPath);
      await page.waitForTimeout(2000);

      const startBtn = page.locator('button:has-text("START UPLOAD")').first();
      if (await startBtn.isVisible()) {
        console.log('\n=== Clicking START UPLOAD ===');
        await startBtn.click();
        
        for (let i = 0; i < 60; i++) {
          await page.waitForTimeout(1000);
          const done = page.locator('text=✓ Done');
          if (await done.isVisible()) {
            console.log('\n✓ Upload completed!');
            break;
          }
          console.log(`Wait ${i + 1}/60`);
        }
      }
    }

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'debug-full.png', fullPage: true });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugUploadFull();