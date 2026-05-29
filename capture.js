const { chromium } = require('playwright');
const readline = require('readline');

function waitForUserInput(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

(async () => {
  try {
    console.log('Starting capture at', new Date().toISOString());
    
    const browser = await chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled']
    });

    const page = await browser.newPage({
      viewport: {
        width: 1600,
        height: 1200
      }
    });

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

    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(3000);

    // CHECK IF PASSWORD OR VERIFICATION CODE IS REQUESTED
    const passwordField = await page.$('input[type="password"]');
    const codeField = await page.$('input[placeholder*="code"], input[placeholder*="Code"]');

    if (codeField) {
      console.log('Verification code requested...');
      console.log('Check your email for the verification code.');
      const code = await waitForUserInput('Enter the verification code: ');
      await page.fill(
        'input[placeholder*="code"], input[placeholder*="Code"]',
        code
      );
    } else if (passwordField) {
      console.log('Entering password...');
      await page.fill(
        'input[type="password"]',
        process.env.NOTION_PASSWORD
      );
    }

    await page.click('button:has-text("Continue")');

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

    await browser.close();

    console.log('Calendar captured at', new Date().toISOString());
  } catch (error) {
    console.error('Error capturing calendar:', error);
    process.exit(1);
  }
})();
