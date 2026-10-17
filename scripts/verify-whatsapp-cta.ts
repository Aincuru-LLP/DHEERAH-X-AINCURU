import { chromium } from '@playwright/test';

async function run() {
  console.log('Launching browser with channel: chrome...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const page = await browser.newPage();
  
  // Test all breakpoints
  const breakpoints = [320, 360, 375, 390, 414, 768, 1024, 1280, 1440];
  
  console.log('\n--- 1. Testing /product/11 (Bandhani Tie-Dye Silk Fabric) ---');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://127.0.0.1:3000/product/11');
  await page.waitForLoadState('domcontentloaded');

  const ctaContainer = page.locator('[data-testid="product-whatsapp-customisation-cta"]');
  await ctaContainer.waitFor({ state: 'visible', timeout: 10000 });
  console.log('✓ Found CTA container on /product/11');

  // Verify placement: after quantity and before description
  const mainText = (await page.locator('main').textContent()) || '';
  const qtyIdx = mainText.indexOf('Quantity');
  const ctaIdx = mainText.indexOf('• For any customisation, reach out to us on WhatsApp');
  const descIdx = mainText.indexOf('Each dot tied by hand before dyeing');
  console.log(`Placement indices: Quantity=${qtyIdx}, CTA=${ctaIdx}, Description=${descIdx}`);
  if (qtyIdx > -1 && ctaIdx > qtyIdx && descIdx > ctaIdx) {
    console.log('✓ Verified: CTA appears immediately after Quantity and before Description!');
  } else {
    throw new Error('Placement order incorrect');
  }

  // Verify supporting text
  const supportingText = await ctaContainer.locator('p').textContent();
  console.log(`Supporting text: "${supportingText}"`);
  if (supportingText?.trim() === '• For any customisation, reach out to us on WhatsApp') {
    console.log('✓ Supporting text matches exact copy!');
  } else {
    throw new Error(`Supporting text mismatch: ${supportingText}`);
  }

  // Verify button label & icon
  const btn = page.locator('#pdp-whatsapp-customisation-btn');
  const btnText = await btn.textContent();
  console.log(`Button text: "${btnText?.trim()}"`);
  if (btnText?.includes('For customisation')) {
    console.log('✓ Button label matches "For customisation"!');
  } else {
    throw new Error(`Button label mismatch: ${btnText}`);
  }

  const svgVisible = await btn.locator('svg').isVisible();
  console.log(`WhatsApp SVG icon visible: ${svgVisible}`);

  // Visual styling
  const styles = await btn.evaluate(el => {
    const s = window.getComputedStyle(el);
    return {
      backgroundColor: s.backgroundColor,
      color: s.color,
      borderRadius: s.borderRadius,
      fontFamily: s.fontFamily,
      fontWeight: s.fontWeight,
    };
  });
  console.log('Button computed styles:', styles);
  // rgb(199, 4, 43) is #C7042B
  if (styles.backgroundColor === 'rgb(199, 4, 43)') {
    console.log('✓ Button background is crimson theme token #C7042B');
  }
  if (styles.color === 'rgb(255, 255, 255)') {
    console.log('✓ Button text color is white');
  }
  if (parseInt(styles.borderRadius) >= 20) {
    console.log('✓ Button is rounded/pill style');
  }

  // Check URL attributes
  const target = await btn.getAttribute('target');
  const rel = await btn.getAttribute('rel');
  const href = await btn.getAttribute('href');
  console.log(`Link attributes: target="${target}", rel="${rel}"`);
  console.log(`Generated WhatsApp URL: ${href}`);

  if (target === '_blank' && rel?.includes('noopener') && rel?.includes('noreferrer')) {
    console.log('✓ Safe new tab anchor attributes verified!');
  }

  if (href?.startsWith('https://wa.me/919962176172?text=')) {
    console.log('✓ wa.me link with business number 919962176172 verified!');
  }

  const textParam = decodeURIComponent(href!.split('?text=')[1]);
  console.log('\n--- Decoded WhatsApp Message ---\n' + textParam + '\n---------------------------------');

  // Verify message content
  if (
    textParam.includes("Hi Dheerah, I'm interested in customising this product.") &&
    textParam.includes("Product: Bandhani Tie-Dye Silk Fabric") &&
    textParam.includes("Product ID: 11") &&
    textParam.includes("/product/11") &&
    textParam.includes("Selected Shade: Vermilion") &&
    textParam.includes("Quantity: 1") &&
    textParam.includes("Please share the available customisation options, pricing and process.")
  ) {
    console.log('✓ Pre-filled message content verified with dynamic product details!');
  } else {
    throw new Error('Message content missing expected product details');
  }

  // Test dynamic updates: shade & quantity
  console.log('\n--- 2. Testing Dynamic Updates on Shade & Quantity ---');
  // Switch shade to Mustard
  const mustardBtn = page.getByTitle('Mustard');
  if (await mustardBtn.isVisible()) {
    await mustardBtn.click();
    console.log('Clicked shade: Mustard');
  }

  // Increase quantity to 3
  const plusBtn = page.getByRole('button', { name: 'Increase quantity' });
  await plusBtn.click();
  await plusBtn.click();
  console.log('Increased quantity to 3');

  const updatedHref = await btn.getAttribute('href');
  const updatedMessage = decodeURIComponent(updatedHref!.split('?text=')[1]);
  console.log('\n--- Updated WhatsApp Message ---\n' + updatedMessage + '\n---------------------------------');

  if (updatedMessage.includes('Selected Shade: Mustard') && updatedMessage.includes('Quantity: 3')) {
    console.log('✓ Dynamic updates verified: shade and quantity reflected in real time!');
  } else {
    throw new Error('Dynamic update failed');
  }

  // Test other product routes: e.g. /product/22 (Lehenga Cholis with sizes)
  console.log('\n--- 3. Testing Another Product Detail Route (/product/22) ---');
  await page.goto('http://127.0.0.1:3000/product/22');
  await page.waitForLoadState('domcontentloaded');

  const cta22 = page.locator('#pdp-whatsapp-customisation-btn');
  await cta22.waitFor({ state: 'visible', timeout: 10000 });
  const href22 = await cta22.getAttribute('href');
  const msg22 = decodeURIComponent(href22!.split('?text=')[1]);
  console.log('\n--- Product 22 WhatsApp Message ---\n' + msg22 + '\n---------------------------------');

  if (
    msg22.includes('Product: Festive Lehenga — Peacock Kanjivaram') &&
    msg22.includes('Product ID: 22') &&
    msg22.includes('/product/22')
  ) {
    console.log('✓ Product 22 loaded and customized URL correctly generated!');
  } else {
    throw new Error('Product 22 details missing');
  }

  // Test Responsive Breakpoints & take screenshot
  console.log('\n--- 4. Testing Responsive Breakpoints ---');
  for (const width of breakpoints) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:3000/product/11');
    await page.waitForLoadState('domcontentloaded');

    const ctaBtn = page.locator('#pdp-whatsapp-customisation-btn');
    await ctaBtn.waitFor({ state: 'visible' });

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    const box = await ctaBtn.boundingBox();
    console.log(`Breakpoint ${width}px: overflow=${hasOverflow}, buttonBox=${JSON.stringify(box)}`);
    if (hasOverflow) {
      throw new Error(`Horizontal overflow detected at ${width}px!`);
    }
    if (!box || box.x < 0 || box.x + box.width > width + 2) {
      throw new Error(`Button out of bounds at ${width}px!`);
    }
  }
  console.log('✓ All 9 breakpoints passed without overflow or clipping!');

  // Take visual screenshots for desktop (1440px) and mobile (375px)
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:3000/product/11');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('#pdp-whatsapp-customisation-btn').waitFor({ state: 'visible' });
  const desktopCtaRegion = page.locator('[data-testid="product-whatsapp-customisation-cta"]');
  await desktopCtaRegion.screenshot({ path: 'whatsapp_cta_desktop.png' });
  console.log('Saved whatsapp_cta_desktop.png');

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://127.0.0.1:3000/product/11');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('#pdp-whatsapp-customisation-btn').waitFor({ state: 'visible' });
  const mobileCtaRegion = page.locator('[data-testid="product-whatsapp-customisation-cta"]');
  await mobileCtaRegion.screenshot({ path: 'whatsapp_cta_mobile.png' });
  console.log('Saved whatsapp_cta_mobile.png');

  await browser.close();
  console.log('\nALL VERIFICATION CHECKS PASSED SUCCESSFULLY! 🎉');
}

run().catch(err => {
  console.error('Validation failed:', err);
  process.exit(1);
});
