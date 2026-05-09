import { chromium } from '@playwright/test';

async function debugUpload() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Step 1: Navigate to dashboard...');
    await page.goto('http://localhost:9002/dashboard');
    await page.waitForLoadState('networkidle');

    // Login
    const loginForm = page.locator('input[name="username"]');
    if (await loginForm.isVisible({ timeout: 5000 })) {
      console.log('Logging in...');
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

    console.log('\nStep 3: Find and click Dynamic Interface Flow project...');
    const allButtons = await page.locator('button').all();
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && text.includes('Dynamic Interface Flow')) {
        console.log(`Found button: "${text.trim()}"`);
        await btn.click();
        await page.waitForTimeout(3000);
        break;
      }
    }

    console.log('\nStep 4: Check what project ID is in the form...');
    // Check hidden input fields for project ID
    const hiddenInputs = page.locator('input[type="hidden"]');
    const hiddenCount = await hiddenInputs.count();
    console.log(`Found ${hiddenCount} hidden input(s)`);
    
    for (let i = 0; i < hiddenCount; i++) {
      const input = hiddenInputs.nth(i);
      const name = await input.getAttribute('name');
      const value = await input.inputValue();
      if (name || value) {
        console.log(`  Hidden input #${i}: name="${name}", value="${value}"`);
      }
    }

    // Check the URL to see current page
    const url = page.url();
    console.log(`\nCurrent URL: ${url}`);

    // Take screenshot
    await page.screenshot({ path: 'debug-upload.png', fullPage: true });
    console.log('Screenshot saved');

    console.log('\nStep 5: Check if project is saved (has ID)...');
    // Go directly to project edit page
    await page.goto('http://localhost:9002/dashboard?edit=motion-ui-abstract');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const editUrl = page.url();
    console.log(`Edit URL: ${editUrl}`);

    await page.screenshot({ path: 'debug-edit.png', fullPage: true });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugUpload();