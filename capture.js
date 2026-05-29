const { chromium } = require('playwright');

(async () => {
  let browser, context, page;
  try {
    console.log('Starting capture at', new Date().toISOString());
    
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled']
    });

    context = await browser.newContext({
      viewport: { width: 1600, height: 1200 }
    });

    page = await context.newPage();

    // OPEN LOGIN PAGE
    console.log('Going to login page...');
    await page.goto('https://www.notion.so/login', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // EMAIL
    console.log('Entering email...');
    await page.fill(
      'input[type="email"]',
      process.env.NOTION_EMAIL
    );

    await page.click('div[role="button"]:has-text("Continue")');
    await page.waitForTimeout(3000);

    // CHECK IF PASSWORD OR VERIFICATION CODE IS REQUESTED
    const passwordField = await page.$('input[type="password"]');
    const codeField = await page.$('input[placeholder*="code"], input[placeholder*="Code"]');

    if (codeField) {
      console.log('Verification code requested - this requires manual intervention');
      throw new Error('2FA verification code required - GitHub Actions cannot handle interactive input');
    } else if (passwordField) {
      console.log('Entering password...');
      await page.fill(
        'input[type="password"]',
        process.env.NOTION_PASSWORD
      );
    }

    await page.click('div[role="button"]:has-text("Continue")');

    // WAIT FOR LOGIN
    console.log('Waiting for login to complete...');
    await page.waitForTimeout(10000);

    // OPEN CALENDAR
    console.log('Opening calendar URL...');
    await page.goto(
      process.env.NOTION_CALENDAR_URL,
      {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      }
    );

    // WAIT FOR FULL LOAD
    console.log('Waiting for calendar to load...');
    await page.waitForTimeout(10000);

    // SCREENSHOT
    console.log('Taking screenshot...');
    await page.screenshot({
      path: 'calendar.png',
      fullPage: true
    });

    console.log('Calendar captured at', new Date().toISOString());
  } catch (error) {
    console.error('Error capturing calendar:', error);
    process.exit(1);
  } finally {
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  }
})();
