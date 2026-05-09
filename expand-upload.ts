import { chromium } from '@playwright/test';

async function expandAndUpload() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
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

    await page.waitForTimeout(1000);

    console.log('Looking for MOTION or CODE buttons...');
    const sectionButtons = page.locator('button');
    const allBtn = await sectionButtons.all();
    
    for (const btn of allBtn) {
      const text = await btn.textContent();
      if (text && (text.includes('MOTION') || text.includes('CODE'))) {
        console.log(`Found: "${text.trim()}"`);
        await btn.click();
        await page.waitForTimeout(2000);
        break;
      }
    }

    await page.screenshot({ path: 'expanded.png', fullPage: true });

    console.log('\nLooking for Dynamic Interface Flow...');
    const projectButtons = await page.locator('button').all();
    for (const btn of projectButtons) {
      const text = await btn.textContent();
      if (text && text.includes('Dynamic Interface Flow')) {
        console.log(`Found project: "${text.trim()}"`);
        await btn.click();
        await page.waitForTimeout(3000);
        break;
      }
    }

    console.log('\nLooking for file input...');
    const fileInputs = page.locator('input[type="file"]');
    const count = await fileInputs.count();
    console.log(`Found ${count} file input(s)`);
    
    if (count > 0) {
      const videoPath = 'C:\\Users\\ASUS\\Desktop\\DanielEmpire\\Motion\\L06_UI_Main H_1920x1080.mp4';
      await fileInputs.first().setInputFiles(videoPath);
      await page.waitForTimeout(2000);
      
      const startBtn = page.locator('button:has-text("START UPLOAD")');
      if (await startBtn.isVisible()) {
        console.log('Clicking START UPLOAD...');
        await startBtn.first().click();
        
        for (let i = 0; i < 60; i++) {
          await page.waitForTimeout(1000);
          const done = page.locator('text=✓ Done');
          if (await done.isVisible()) {
            console.log('✓ Done!');
            break;
          }
          console.log(`Wait ${i + 1}/60`);
        }
      }
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'after-upload.png', fullPage: true });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

expandAndUpload();