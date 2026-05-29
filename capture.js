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

  await page.fill('input[type="klyons1@fas.harvard.edu"]', process.env.NOTION_EMAIL);

  await page.click('button[type="submit"]');

  await page.waitForTimeout(3000);

  await page.fill('input[type="Z@ynK@yl@93"]', process.env.NOTION_PASSWORD);

  await page.click('button[type="submit"]');

  // WAIT FOR LOGIN
  await page.waitForTimeout(10000);

  // OPEN CALENDAR
  await page.goto(process.env.https://calendar.notion.so/event/M3RjZG50c212OXByYjI0ZmVhMWtrbDczNXUvZTdhODI5MTM4MTYzZDlhMjM2OTZiMzA0YWM1N2VhMThkOGRiZTVjZTkyZjllNWE3ZTBlY2QxNjNiYThhMTM4ZUBncm91cC5jYWxlbmRhci5nb29nbGUuY29tLzZhYjczYTI3LThkMjYtNDVhYi1hYmVjLTk3MjE0OTI2MmIzNQ==, {
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
