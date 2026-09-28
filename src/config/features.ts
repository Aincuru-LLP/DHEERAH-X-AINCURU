/**
 * Application feature flags.
 * Central switchboard to enable or disable features across the entire storefront and admin console.
 */
export const FEATURES = {
  /**
   * Ratings, customer reviews, and client feedback.
   * Set to `false` to completely hide star ratings, review counts, reviews section, and admin moderation.
   * Set to `true` when requested to re-enable.
   */
  reviewsAndFeedback: false,

  /**
   * In-store Barcode POS Counter billing.
   * Set to `false` to completely disable the counter feature from the admin console and sidebar.
   * Set to `true` when you want to re-enable it.
   */
  counterSale: false,

  /**
   * Bulk Email marketing suite.
   * Set to `false` to hide Bulk Email from the admin navigation and interface.
   * Set to `true` when you want to re-enable it.
   */
  bulkEmail: false,

  /**
   * Catalogue SEO audit section.
   * Set to `false` to hide Catalogue SEO from the admin navigation and interface.
   * Set to `true` when you want to re-enable it.
   */
  catalogueSeo: false,

  /**
   * Seeding utilities (Seed Laces, Seed catalog from FABRICS).
   * Set to `false` to disable / hide seeding buttons and actions from the admin UI.
   * Set to `true` when you want to re-enable them.
   */
  seedTools: false,
} as const;

