const { chromium } = require('playwright');
const fs = require('fs');

async function testAboutPage() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });
  
  const viewports = [
    { name: 'mobile_393', width: 393, height: 852 },
    { name: 'mobile_375', width: 375, height: 812 },
    { name: 'tablet_768', width: 768, height: 1024 },
    { name: 'desktop_1440', width: 1440, height: 1080 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });

    console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    await page.goto('http://localhost:3000/about', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    // Check horizontal scroll / overflow
    const overflow = await page.evaluate(() => {
      const el = document.documentElement;
      return {
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        hasOverflow: el.scrollWidth > el.clientWidth,
      };
    });
    console.log(`Overflow check:`, overflow);

    // Check images loaded
    const imagesInfo = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('main img'));
      return imgs.map(img => ({
        src: img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      }));
    });
    console.log(`Images loaded (${imagesInfo.length}):`, imagesInfo);

    // Check text contents
    const textCheck = await page.evaluate(() => {
      const h1 = document.querySelector('h1')?.innerText;
      const fastShipping = document.body.innerText.includes('FAST SHIPPING');
      const easyExchange = document.body.innerText.includes('EASY EXCHANGE');
      return { h1, fastShipping, easyExchange };
    });
    console.log(`Content check:`, textCheck);

    // Take full page screenshot
    const shotPath = `hero_qa_screenshots/about_${vp.name}_full.png`;
    await page.screenshot({ path: shotPath, fullPage: true });
    console.log(`Saved screenshot to ${shotPath}`);

    await page.close();
  }

  await browser.close();
  console.log('\nVerification complete!');
}

testAboutPage().catch(err => {
  console.error(err);
  process.exit(1);
});
