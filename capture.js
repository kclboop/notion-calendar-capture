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

    console.log('Login page loaded. Current URL:', page.url());
    console.log('Page title:', await page.title());

    // EMAIL
    console.log('Entering email...');
    const emailInput = await page.$('input[type="email"]');
    if (!emailInput) {
      console.error('Email input not found! Page content:', await page.content());
      throw new Error('Email input field not found');
    }
    
    await page.fill(
      'input[type="email"]',
      process.env.NOTION_EMAIL
    );
    console.log('Email entered');

    // Find and click continue button
    const continueButton = await page.$('div[role="button"]:has-text("Continue")');
    if (!continueButton) {
      console.error('Continue button not found after email');
      throw new Error('Continue button not found');
    }
    
    await continueButton.click();
    console.log('Clicked continue after email');
    await page.waitForTimeout(5000);

    console.log('After first continue. Current URL:', page.url());

    // CHECK IF PASSWORD OR VERIFICATION CODE IS REQUESTED
    const passwordField = await page.$('input[type="password"]');
    const codeField = await page.$('input[placeholder*="code"], input[placeholder*="Code"]');

    console.log('Password field found:', !!passwordField);
    console.log('Code field found:', !!codeField);

    if (codeField) {
      console.log('⚠️  Verification code requested - GitHub Actions cannot handle this automatically');
      console.log('You need to disable 2FA or use a recovery code');
      throw new Error('2FA verification code required - cannot proceed in automated environment');
    } else if (passwordField) {
      console.log('Entering password...');
      await page.fill(
        'input[type="password"]',
        process.env.NOTION_PASSWORD
      );
      console.log('Password entered');

      const continueButton2 = await page.$('div[role="button"]:has-text("Continue")');
      if (continueButton2) {
        await continueButton2.click();
        console.log('Clicked continue after password');
      }
    } else {
      console.log('No password or code field found. Checking if already logged in...');
    }

    // WAIT FOR LOGIN
    console.log('Waiting for login to complete...');
    await page.waitForTimeout(8000);

    console.log('After login wait. Current URL:', page.url());

    // Check if we're still on login page
    if (page.url().includes('login')) {
      console.error('❌ Still on login page! Login may have failed.');
      console.error('Current page title:', await page.title());
      
      // Take a debug screenshot
      await page.screenshot({
        path: 'debug-login-failed.png',
        fullPage: true
      });
      console.log('Saved debug screenshot to debug-login-failed.png');
      
      throw new Error('Login failed - still on login page');
    }

    // OPEN CALENDAR
    console.log('Opening calendar URL...');
    await page.goto(
      process.env.NOTION_CALENDAR_URL,
      {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      }
    );

    console.log('Calendar page loaded. Current URL:', page.url());

    // WAIT FOR FULL LOAD
    console.log('Waiting for calendar to load...');
    await page.waitForTimeout(8000);

    // SCREENSHOT
    console.log('Taking screenshot...');
    await page.screenshot({
      path: 'calendar.png',
      fullPage: true
    });

    console.log('✅ Calendar captured successfully at', new Date().toISOString());
  } catch (error) {
    console.error('❌ Error capturing calendar:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  }
})();
