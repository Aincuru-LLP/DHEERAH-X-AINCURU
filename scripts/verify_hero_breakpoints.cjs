const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  }).catch(() => chromium.launch({ headless: true }));

  const outDir = path.join(__dirname, '..', 'hero_qa_screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const viewports = [
    { name: 'mobile-390', width: 390, height: 844 },
    { name: 'mobile-425', width: 425, height: 900 },
    { name: 'mobile-430', width: 430, height: 932 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'desktop-1440', width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });

    console.log(`Testing viewport ${vp.name} (${vp.width}x${vp.height})...`);
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Screenshot top hero portion
    const heroShotPath = path.join(outDir, `hero-${vp.name}.png`);
    await page.screenshot({
      path: heroShotPath,
      clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 800) },
    });
    console.log(`Saved screenshot: ${heroShotPath}`);

    // If mobile, test clicking the hotspot button
    if (vp.width < 768) {
      const button = page.locator('button[aria-label="Explore the Collection"]').first();
      const isVisible = await button.isVisible();
      console.log(`  Button visible on ${vp.name}: ${isVisible}`);
      
      const box = await button.boundingBox();
      console.log(`  Button bounding box on ${vp.name}:`, box);

      // Click button and verify navigation
      await button.click();
      await page.waitForTimeout(1000);
      const url = page.url();
      console.log(`  After click URL: ${url}`);
    } else {
      const desktopButton = page.locator('button[aria-label="Explore the Collection"]').nth(1);
      const isVisible = await desktopButton.isVisible();
      console.log(`  Desktop button visible on ${vp.name}: ${isVisible}`);
    }

    await page.close();
  }

  await browser.close();
  console.log('All hero breakpoint checks complete!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
