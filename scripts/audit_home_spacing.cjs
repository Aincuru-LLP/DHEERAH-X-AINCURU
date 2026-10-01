const { chromium } = require('playwright');

async function audit() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  }).catch(() => chromium.launch({ headless: true }));

  const viewports = [
    { name: '320px (Mobile S)', width: 320, height: 700 },
    { name: '360px (Android Small)', width: 360, height: 740 },
    { name: '375px (iPhone SE)', width: 375, height: 667 },
    { name: '390px (iPhone 12/13/14)', width: 390, height: 844 },
    { name: '414px (iPhone Plus/Max)', width: 414, height: 896 },
    { name: '768px (iPad Mini/Portrait)', width: 768, height: 1024 },
    { name: '820px (iPad Air)', width: 820, height: 1180 },
    { name: '912px (Surface Pro)', width: 912, height: 1368 },
    { name: '1024px (iPad Pro/Small Desktop)', width: 1024, height: 768 },
    { name: '1280px (HD Desktop)', width: 1280, height: 800 },
    { name: '1366px (Typical Laptop)', width: 1366, height: 768 },
    { name: '1440px (MacBook / FHD)', width: 1440, height: 900 },
    { name: '1600px (Large Desktop)', width: 1600, height: 1000 },
    { name: '1920px (1080p Desktop)', width: 1920, height: 1080 },
  ];

  const results = [];

  for (const vp of viewports) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
    });

    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const report = await page.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const winWidth = window.innerWidth;
      const hasHorizontalOverflow = docWidth > winWidth;

      const main = document.querySelector('main');
      if (!main) return { error: 'No main element' };

      const children = Array.from(main.children);
      const footer = document.querySelector('footer');
      const allElements = [...children];
      if (footer) allElements.push(footer);

      const sections = allElements.map((el, index) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const heading = el.querySelector('h1, h2, h3, p');
        const headingText = heading ? heading.innerText.trim().slice(0, 30) : '';
        return {
          index,
          tag: el.tagName.toLowerCase(),
          headingText,
          height: Math.round(rect.height),
          top: Math.round(rect.top + window.scrollY),
          bottom: Math.round(rect.bottom + window.scrollY),
          pt: style.paddingTop,
          pb: style.paddingBottom,
        };
      });

      const gaps = [];
      for (let i = 0; i < sections.length - 1; i++) {
        const gap = sections[i + 1].top - sections[i].bottom;
        gaps.push(gap);
      }

      // Check all images
      const images = Array.from(document.querySelectorAll('main img, footer img'));
      const brokenImages = images.filter(img => img.naturalWidth === 0 && !img.complete).length;

      return {
        hasHorizontalOverflow,
        docWidth,
        winWidth,
        sectionCount: sections.length,
        gaps,
        brokenImages,
        maxGap: Math.max(...gaps),
        minGap: Math.min(...gaps),
      };
    });

    results.push({ name: vp.name, width: vp.width, ...report });
    await page.close();
  }

  await browser.close();

  console.log(`\n========================================================================================================`);
  console.log(`COMPREHENSIVE RESPONSIVE AUDIT RESULTS (ALL 14 BREAKPOINTS)`);
  console.log(`========================================================================================================`);
  console.log(
    'Breakpoint'.padEnd(30) +
    'Width'.padEnd(10) +
    'DocWidth'.padEnd(12) +
    'Overflow?'.padEnd(12) +
    'Sections'.padEnd(12) +
    'Min Gap'.padEnd(10) +
    'Max Gap'.padEnd(10) +
    'Status'
  );
  console.log('-'.repeat(100));

  let allPassed = true;
  for (const r of results) {
    const passed = !r.hasHorizontalOverflow && r.maxGap === 0 && r.minGap === 0;
    if (!passed) allPassed = false;
    console.log(
      r.name.padEnd(30) +
      `${r.width}px`.padEnd(10) +
      `${r.docWidth}px`.padEnd(12) +
      (r.hasHorizontalOverflow ? 'FAIL (YES)' : 'PASS (NO)').padEnd(12) +
      `${r.sectionCount}`.padEnd(12) +
      `${r.minGap}px`.padEnd(10) +
      `${r.maxGap}px`.padEnd(10) +
      (passed ? '✓ PERFECT' : '⚠ CHECK')
    );
  }
  console.log('='.repeat(100));
  console.log(`ALL 14 BREAKPOINTS PASSED: ${allPassed}`);
}

audit().catch(console.error);
