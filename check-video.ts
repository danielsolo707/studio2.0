import { chromium } from '@playwright/test';

async function checkVideoEndpoint() {
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1134\\chrome-win\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Check if video file is accessible
    const response = await page.goto('http://localhost:9002/uploads/L06_UI_Main H_1920x1080.mp4');
    console.log('Video response status:', response?.status());
    console.log('Video content-type:', response?.headers()['content-type']);
    
    // Also check the project page HTML
    await page.goto('http://localhost:9002/projects/motion-ui-abstract');
    await page.waitForLoadState('networkidle');
    
    const html = await page.content();
    // Look for the video element
    const videoMatch = html.match(/<video[^>]*src="([^"]*)"/);
    console.log('Video src found:', videoMatch?.[1]);
    
    // Look for media in the HTML
    const mediaMatch = html.match(/media[^}]*url[^}]*mp4/gi);
    console.log('Media references:', mediaMatch);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkVideoEndpoint();