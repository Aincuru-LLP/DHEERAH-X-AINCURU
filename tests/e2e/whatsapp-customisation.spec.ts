import { test, expect } from '@playwright/test';

const BREAKPOINTS = [320, 360, 375, 390, 414, 768, 1024, 1280, 1440];

test.describe('Product Page WhatsApp Customisation CTA', () => {
  test('renders CTA on /product/11 directly below quantity with correct styling and pre-filled message', async ({ page }) => {
    await page.goto('/product/11');
    await page.waitForLoadState('domcontentloaded');

    // Section container should be visible
    const ctaContainer = page.locator('[data-testid="product-whatsapp-customisation-cta"]');
    await expect(ctaContainer).toBeVisible({ timeout: 15_000 });

    // Verify it is placed after the quantity section and before description
    const textContent = await page.locator('main').textContent();
    const qtyIndex = textContent?.indexOf('Quantity') ?? -1;
    const ctaIndex = textContent?.indexOf('For any customisation, reach out to us on WhatsApp') ?? -1;
    const descIndex = textContent?.indexOf('Each dot tied by hand before dyeing') ?? -1;

    expect(qtyIndex).toBeGreaterThan(-1);
    expect(ctaIndex).toBeGreaterThan(qtyIndex);
    expect(descIndex).toBeGreaterThan(ctaIndex);

    // Supporting text copy
    const supportingText = ctaContainer.locator('p');
    await expect(supportingText).toHaveText('• For any customisation, reach out to us on WhatsApp');

    // Button and icon
    const button = page.locator('#pdp-whatsapp-customisation-btn');
    await expect(button).toBeVisible();
    await expect(button).toContainText('For customisation');
    await expect(button.locator('svg')).toBeVisible();

    // Visual attributes
    const target = await button.getAttribute('target');
    const rel = await button.getAttribute('rel');
    expect(target).toBe('_blank');
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');

    // Check crimson color styling
    const btnColor = await button.evaluate(el => window.getComputedStyle(el).backgroundColor);
    // #C7042B in rgb is rgb(199, 4, 43)
    expect(btnColor).toBe('rgb(199, 4, 43)');

    // Check wa.me link content
    const href = await button.getAttribute('href');
    expect(href).not.toBeNull();
    expect(href).toContain('https://wa.me/919962176172?text=');

    // Decode message
    const rawTextParam = href!.split('?text=')[1];
    const decodedMessage = decodeURIComponent(rawTextParam);

    expect(decodedMessage).toContain("Hi Dheerah, I'm interested in customising this product.");
    expect(decodedMessage).toContain("Product: Bandhani Tie-Dye Silk Fabric");
    expect(decodedMessage).toContain("Product ID: 11");
    expect(decodedMessage).toContain("/product/11");
    expect(decodedMessage).toContain("Selected Shade: Vermilion");
    expect(decodedMessage).toContain("Quantity: 1");
    expect(decodedMessage).toContain("Please share the available customisation options, pricing and process.");
  });

  test('updates pre-filled message dynamically when shade and quantity change', async ({ page }) => {
    await page.goto('/product/11');
    await page.waitForLoadState('domcontentloaded');

    const button = page.locator('#pdp-whatsapp-customisation-btn');
    await expect(button).toBeVisible({ timeout: 15_000 });

    // Click 'Mustard' shade
    const mustardBtn = page.getByRole('button', { name: /Mustard/i });
    if (await mustardBtn.isVisible()) {
      await mustardBtn.click();
    }

    // Increase quantity to 2
    const plusBtn = page.getByRole('button', { name: 'Increase quantity' });
    await plusBtn.click();

    // Verify updated href
    const updatedHref = await button.getAttribute('href');
    const updatedDecoded = decodeURIComponent(updatedHref!.split('?text=')[1]);

    expect(updatedDecoded).toContain("Selected Shade: Mustard");
    expect(updatedDecoded).toContain("Quantity: 2");
  });

  test('renders properly across all required viewport widths without overflow', async ({ page }) => {
    for (const width of BREAKPOINTS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/product/11');
      await page.waitForLoadState('domcontentloaded');

      const cta = page.locator('#pdp-whatsapp-customisation-btn');
      await expect(cta).toBeVisible({ timeout: 15_000 });

      // Verify no horizontal overflow on page
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasOverflow).toBe(false);

      // Verify CTA is inside viewport bounds
      const box = await cta.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
    }
  });
});
