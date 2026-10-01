import React, { useEffect } from 'react';
import StoreHero from '../components/store/StoreHero';
import StoreExperiences from '../components/store/StoreExperiences';
import StoreJourney from '../components/store/StoreJourney';
import StoreExperienceSteps from '../components/store/StoreExperienceSteps';
import StoreRedDoor from '../components/store/StoreRedDoor';
import StoreGallery from '../components/store/StoreGallery';
import StoreSelector from '../components/store/StoreSelector';
import StoreLocation from '../components/store/StoreLocation';
import { storeInfo } from '../config/store';

/**
 * OurStorePage — Physical Boutique & Experience Page for Dheerah Designer Boutique
 * Vadapalani, Chennai
 * 
 * Page Sections:
 * 01 — HERO
 * 02 — MORE THAN A STORE
 * 03 — FROM YOUR SCREEN TO OUR STORE
 * 04 — THE DHEERAH EXPERIENCE
 * 05 — BEHIND THE RED DOOR
 * 06 — STORE GALLERY
 * 07 — WHAT ARE YOU LOOKING FOR?
 * 08 — VISIT DHEERAH
 * 09 — FINAL CTA
 * 10 — EXISTING GLOBAL FOOTER (Rendered by App Chrome)
 */
const OurStorePage: React.FC = () => {
  // Inject LocalBusiness / ClothingStore JSON-LD schema for local SEO
  useEffect(() => {
    const scriptId = 'dheerah-store-jsonld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const storeSchema = {
      "@context": "https://schema.org",
      "@type": "ClothingStore",
      "name": storeInfo.name,
      "description": "Dheerah Designer Boutique in Vadapalani, Chennai specializes in hand-woven Indian designer wear, bespoke bridal couture, custom tailoring and intricate aari embroidery.",
      "url": "https://dheerah.com/our-store",
      "telephone": storeInfo.phone,
      "email": storeInfo.email,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "No. 14, South Sivan Koil Street",
        "addressLocality": "Vadapalani",
        "addressRegion": "Tamil Nadu",
        "postalCode": "600026",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 13.0468,
        "longitude": 80.2125
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "10:30",
          "closes": "20:30"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Sunday"],
          "opens": "11:00",
          "closes": "18:00"
        }
      ],
      "priceRange": "₹₹ - ₹₹₹₹"
    };

    script.textContent = JSON.stringify(storeSchema);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, []);

  return (
    <main className="w-full bg-[color:var(--dheerah-ivory)] selection:bg-[color:var(--dheerah-crimson)] selection:text-white">
      {/* 01 — HERO */}
      <StoreHero />

      {/* 02 — MORE THAN A STORE */}
      <StoreExperiences />

      {/* 03 — FROM YOUR SCREEN TO OUR STORE */}
      <StoreJourney />

      {/* 04 — THE DHEERAH EXPERIENCE */}
      <StoreExperienceSteps />

      {/* 05 — BEHIND THE RED DOOR */}
      <StoreRedDoor />

      {/* 06 — STORE GALLERY */}
      <StoreGallery />

      {/* 07 — WHAT ARE YOU LOOKING FOR? */}
      <StoreSelector />

      {/* 08 — VISIT DHEERAH */}
      <StoreLocation />
    </main>
  );
};

export default OurStorePage;
