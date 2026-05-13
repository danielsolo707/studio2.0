import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// Intercept and log any console errors
page.on('console', msg => {
  if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
});

page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

await page.goto('http://localhost:9002', { waitUntil: 'networkidle', timeout: 30000 });

// Wait for loading screen to disappear (cube should be visible then)
await page.waitForTimeout(6000);

const info = await page.evaluate(() => {
  const godRays = document.querySelector('[class*="god"]') || 
    document.evaluate('//div[contains(@class, "ray")]', document, null, XPathResult.ANY_TYPE, null).iterateNext();
  
  const canvases = document.querySelectorAll('canvas');
  
  // Check for the bloom/godrays div in the cube container
  const allDivs = document.querySelectorAll('div');
  let hasGodRays = false;
  let hasBloom = false;
  allDivs.forEach(d => {
    const html = d.outerHTML;
    if (html.includes('god') || html.includes('mask-image')) hasGodRays = true;
  });

  return {
    canvasCount: canvases.length,
    canvasSizes: Array.from(canvases).map(c => ({ w: c.width, h: c.height })),
    hasGodRays,
    bodyBackground: getComputedStyle(document.body).backgroundColor,
    loadingScreenGone: !document.querySelector('[role="progressbar"]'),
    cubeContainerSize: (() => {
      const container = document.querySelector('[aria-hidden="true"]');
      if (!container) return null;
      const rect = container.getBoundingClientRect();
      return { w: rect.width, h: rect.height };
    })(),
    visibleText: document.body.innerText.substring(0, 300),
  };
});

console.log(JSON.stringify(info, null, 2));

// Also get a pixel analysis of the cube area
const pixelInfo = await page.evaluate(() => {
  const cubeContainer = document.querySelector('[aria-hidden="true"]');
  if (!cubeContainer) return 'no cube container';
  const rect = cubeContainer.getBoundingClientRect();
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
});
console.log('Cube area:', JSON.stringify(pixelInfo));

await browser.close();
