const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage({
    viewport: {
      width: 1600,
      height: 1200
    }
  });

  // LOGIN
  await page.goto('https://www.notion.so/login');

  await page.fill('input[type="email"]', process.env.NOTION_EMAIL);

  await page.click('button[type="submit"]');

  await page.waitForTimeout(3000);

  await page.fill('input[type="password"]', process.env.NOTION_PASSWORD);

  await page.click('button[type="submit"]');

  // WAIT FOR LOGIN
  await page.waitForTimeout(10000);

  // OPEN CALENDAR
  await page.goto(process.env.NOTION_CALENDAR_URL, {
    waitUntil: 'networkidle'
  });

  // WAIT FOR FULL RENDER
  await page.waitForTimeout(10000);

  // SCREENSHOT
  await page.screenshot({
    path: 'calendar.png',
    fullPage: true
  });

  await browser.close();

  console.log('Calendar captured.');
})();
