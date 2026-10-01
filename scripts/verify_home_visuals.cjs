const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyVisuals() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true }).catch(() => chromium.launch({ headless: true }));
  const outDir = path.join(__dirname, '..', 'home_spacing_qa_screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const consoleErrors = [];

  for (const vp of [{ name: 'mobile-390', w: 390, h: 844 }, { name: 'tablet-768', w: 768, h: 1024 }, { name: 'desktop-1440', w: 1440, h: 900 }]) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(`[${vp.name}] ${msg.text()}`);
    });

    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Accept consent if banner appears to clear view
    try {
      const consentBtn = page.locator('button:has-text("ACCEPT ALL")');
      if (await consentBtn.isVisible()) {
        await consentBtn.click();
        await page.waitForTimeout(300);
      }
    } catch (e) {}

    // Scroll down to trigger all whileInView animations
    await page.evaluate(async () => {
      const distance = 400;
      const delay = 100;
      while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
        document.scrollingElement.scrollBy(0, distance);
        await new Promise(r => setTimeout(r, delay));
      }
      // scroll back to top
      document.scrollingElement.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 400));
    });

    await page.waitForTimeout(500);

    // Full page screenshot
    const fullPath = path.join(outDir, `home-${vp.name}-full.png`);
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log(`Saved full screenshot for ${vp.name}: ${fullPath}`);

    // Check key elements
    const checks = await page.evaluate(() => {
      const hero = document.querySelector('section');
      const catStrip = document.querySelector('section:nth-of-type(2)');
      const newIn = Array.from(document.querySelectorAll('section')).find(s => s.innerText.includes('New In'));
      const offers = Array.from(document.querySelectorAll('div, section')).find(s => s.innerText.includes('Offers') && s.querySelector('img'));
      const footer = document.querySelector('footer');

      return {
        heroVisible: !!hero && hero.offsetHeight > 200,
        catStripVisible: !!catStrip && catStrip.offsetHeight > 150,
        newInVisible: !!newIn && newIn.offsetHeight > 200,
        offersVisible: !!offers && offers.offsetHeight > 150,
        footerVisible: !!footer && footer.offsetHeight > 200,
      };
    });

    console.log(`Checks for ${vp.name}:`, JSON.stringify(checks));
    await page.close();
  }

  await browser.close();

  console.log(`Console errors count: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Errors:', consoleErrors);
  }
}

verifyVisuals().catch(console.error);
