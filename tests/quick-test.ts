import { test, expect, chromium } from '@playwright/test';

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  console.log('Testing homepage...');
  await page.goto('http://localhost:9002', { waitUntil: 'networkidle' });
  
  const title = await page.title();
  console.log('Title:', title);
  
  if (errors.length > 0) {
    console.log('ERRORS FOUND:');
    errors.forEach(e => console.log(' -', e));
  } else {
    console.log('No errors found!');
  }

  console.log('\nTesting /arcade...');
  await page.goto('http://localhost:9002/arcade', { waitUntil: 'networkidle' });
  
  console.log('\nTesting /arcade/2048...');
  await page.goto('http://localhost:9002/arcade/2048', { waitUntil: 'networkidle' });
  
  console.log('\nTesting /dashboard...');
  await page.goto('http://localhost:9002/dashboard', { waitUntil: 'networkidle' });
  
  console.log('\nTesting /projects...');
  await page.goto('http://localhost:9002/projects', { waitUntil: 'networkidle' });

  if (errors.length > 0) {
    console.log('\n=== ERRORS FOUND ===');
    errors.forEach(e => console.log(' -', e));
    process.exit(1);
  } else {
    console.log('\n=== ALL TESTS PASSED ===');
  }

  await browser.close();
}

runTests().catch(e => {
  console.error('Test failed:', e.message);
  process.exit(1);
});