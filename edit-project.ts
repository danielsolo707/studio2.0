import { chromium } from '@playwright/test';

async function fixAndUpload() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Step 1: Navigate to project edit page directly...');
    // Go directly to edit the project with the correct ID
    await page.goto('http://localhost:9002/dashboard?edit=motion-ui-abstract');
    await page.waitForLoadState('networkidle');

    // Login if needed
    const loginForm = page.locator('input[name="username"]');
    if (await loginForm.isVisible({ timeout: 5000 })) {
      await loginForm.fill('admin');
      await page.locator('input[name="password"]').fill('admin123');
      await page.locator('button[type="submit"]').click();
      await page.waitForLoadState('networkidle');
    }

    await page.waitForTimeout(3000);

    console.log('\nStep 2: Check page state...');
    // Look for any edit forms
    const editForms = page.locator('form');
    const formCount = await editForms.count();
    console.log(`Found ${formCount} form(s)`);

    // Check URL
    console.log(`URL: ${page.url()}`);

    // Look for the actual project data
    const pageContent = await page.content();
    if (pageContent.includes('motion-ui-abstract')) {
      console.log('✓ Found motion-ui-abstract in page');
    }

    await page.screenshot({ path: 'edit-project.png', fullPage: true });
    console.log('Screenshot saved');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

fixAndUpload();