const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('Starting automated screenshot capture...');
  const dir = path.join(__dirname);
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    // 1. Capture Login Page
    console.log('Navigating to Login Page...');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(dir, 'login_page.png') });
    console.log('Saved: login_page.png');

    // 2. Perform Login Bypass to Customer Portal
    console.log('Navigating to B2B Customer Portal...');
    await page.click('text=Switch to B2B Customer Portal →');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(dir, 'customer_portal.png') });
    console.log('Saved: customer_portal.png');

  } catch (err) {
    console.error('Error during screenshot capture:', err.message);
    console.log('Please ensure the frontend (npm run dev) is running locally at port 5173.');
  } finally {
    await browser.close();
    console.log('Screenshot capture session complete.');
  }
})();