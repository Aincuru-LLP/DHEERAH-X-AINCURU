const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  const breakpoints = [
    { name: '320px', width: 320, height: 600 },
    { name: '375px', width: 375, height: 812 },
    { name: '390px', width: 390, height: 844 },
    { name: '414px', width: 414, height: 896 },
    { name: '768px', width: 768, height: 1024 },
    { name: '1024px', width: 1024, height: 768 },
    { name: '1280px', width: 1280, height: 800 },
    { name: '1440px', width: 1440, height: 900 },
    { name: '1920px', width: 1920, height: 1080 },
  ];

  const pagesToTest = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/about', label: 'About' },
  ];

  console.log('====================================================');
  console.log('DHEERAH TYPOGRAPHY RESPONSIVE VERIFICATION');
  console.log('====================================================\n');

  let allPassed = true;

  for (const pageInfo of pagesToTest) {
    console.log(`\n--- Testing ${pageInfo.label} (${pageInfo.path}) ---`);
    for (const bp of breakpoints) {
      const page = await browser.newPage({
        viewport: { width: bp.width, height: bp.height },
        deviceScaleFactor: 1,
      });

      try {
        await page.goto(`http://localhost:3000${pageInfo.path}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);

        const result = await page.evaluate(() => {
          const el = document.documentElement;
          const body = document.body;
          const overflow = el.scrollWidth > el.clientWidth;
          
          // Check computed fonts on body
          const bodyFont = window.getComputedStyle(body).fontFamily;
          
          // Check computed font on first h1 or h2
          const displayEl = document.querySelector('h1.font-serif, h2.font-serif, .section-title');
          const displayFont = displayEl ? window.getComputedStyle(displayEl).fontFamily : 'N/A';

          return {
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
            hasOverflow: overflow,
            bodyFont,
            displayFont,
          };
        });

        const status = !result.hasOverflow ? 'PASS' : 'FAIL';
        if (result.hasOverflow) allPassed = false;

        console.log(
          `[${status}] ${bp.name} (${bp.width}x${bp.height}) | overflow: ${result.hasOverflow} (scroll: ${result.scrollWidth}, client: ${result.clientWidth}) | Body: ${result.bodyFont.split(',')[0]} | Display: ${result.displayFont.split(',')[0]}`
        );
      } catch (err) {
        console.error(`Error on ${pageInfo.label} @ ${bp.name}:`, err.message);
        allPassed = false;
      } finally {
        await page.close();
      }
    }
  }

  await browser.close();

  console.log('\n====================================================');
  console.log(`Final Verification Result: ${allPassed ? 'ALL PASSED (0 OVERFLOW)' : 'SOME FAILED'}`);
  console.log('====================================================');

  if (!allPassed) process.exit(1);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
