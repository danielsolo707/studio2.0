import { chromium } from '@playwright/test';

async function uploadCorrectly() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Step 1: Go to dashboard...');
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

    console.log('\nStep 2: Find existing project in list and expand...');
    // Look for MOTION section first
    const motionSection = page.locator('button:has-text("MOTION")').first();
    if (await motionSection.isVisible()) {
      await motionSection.click();
      await page.waitForTimeout(1000);
    }

    // Now look for Dynamic Interface Flow in the project cards
    // The expandable cards have the project name AND a ChevronDown/ChevronUp icon
    const projectCards = page.locator('.border.border-white\\/10 button');
    
    // Find the button that has the project name AND is inside a card (not the form)
    const allButtons = await page.locator('button').all();
    let found = false;
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && text.includes('Dynamic Interface Flow') && text.trim() !== 'Dynamic Interface Flow') {
        // This is probably the form with just the name
        continue;
      }
      if (text && text.includes('Dynamic Interface Flow')) {
        // This might be in a card or form - try clicking it
        console.log(`Found button: "${text.trim()}"`);
        
        // Check if it's near a chevron icon (would indicate it's a card)
        const parent = btn.locator('..');
        const hasChevron = parent.locator('svg').count();
        console.log(`  Has chevron nearby: ${hasChevron}`);
        
        await btn.click();
        await page.waitForTimeout(3000);
        found = true;
        break;
      }
    }

    if (!found) {
      console.log('Trying alternative method...');
      // Alternative: look for the card with the project
      const cardButtons = page.locator('div.border-white\\/10 button:has(span:text("Dynamic Interface Flow"))');
      const count = await cardButtons.count();
      console.log(`Found ${count} matching buttons`);
      if (count > 0) {
        await cardButtons.first().click();
        await page.waitForTimeout(3000);
      }
    }

    console.log('\nStep 3: Check for upload field...');
    const fileInput = page.locator('input[type="file"]');
    const inputCount = await fileInput.count();
    console.log(`Found ${inputCount} file input(s)`);

    if (inputCount > 0) {
      console.log('\nStep 4: Upload video...');
      const videoPath = 'C:\\Users\\ASUS\\Desktop\\DanielEmpire\\Motion\\L06_UI_Main H_1920x1080.mp4';
      await fileInput.first().setInputFiles(videoPath);
      await page.waitForTimeout(2000);

      const startBtn = page.locator('button:has-text("START UPLOAD")').first();
      if (await startBtn.isVisible()) {
        console.log('Clicking START UPLOAD...');
        await startBtn.click();
        
        for (let i = 0; i < 60; i++) {
          await page.waitForTimeout(1000);
          const done = page.locator('text=✓ Done');
          if (await done.isVisible()) {
            console.log('✓ Upload completed!');
            break;
          }
          console.log(`Waiting... ${i + 1}/60`);
        }
      }
    } else {
      console.log('\nNo file input found. Taking screenshot...');
      await page.screenshot({ path: 'debug-no-input.png', fullPage: true });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

uploadCorrectly();