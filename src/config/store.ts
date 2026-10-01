/**
 * Single source of truth for physical boutique configuration and store information.
 * All store coordinates, timings, contact channels, and visit details are centralized here.
 */

export interface StoreExperience {
  id: string;
  key: 'ready-to-wear' | 'custom-tailoring' | 'bridal-wear' | 'aari-embroidery';
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  features: string[];
  image: string;
  ctaText: string;
  ctaAction: 'shop' | 'whatsapp' | 'contact' | 'custom';
  categoryLink?: string;
}

export interface StoreGalleryItem {
  id: string;
  label: string;
  title: string;
  caption: string;
  image: string;
  aspect: string;
  span?: string;
}

export interface StoreStep {
  step: string;
  title: string;
  description: string;
  detail: string;
}

export interface OpeningHourItem {
  days: string;
  hours: string;
  note?: string;
}

export const storeInfo = {
  name: "Dheerah Designer Boutique",
  brandSubtitle: "Heritage Indian Designer Wear · Bespoke Couture & Handcrafted Textiles",
  locationBadge: "VADAPALANI · CHENNAI",
  address: "No. 14, South Sivan Koil Street, Vadapalani, Chennai, Tamil Nadu 600026",
  addressLines: [
    "No. 14, South Sivan Koil Street",
    "Vadapalani, Chennai",
    "Tamil Nadu 600026",
    "India"
  ],
  landmark: "Near Vadapalani Murugan Temple",
  city: "Chennai",
  state: "Tamil Nadu",
  postalCode: "600026",
  country: "India",
  phone: "+91 99621 76172",
  phoneDisplay: "+91 99621 76172",
  whatsapp: "+91 99621 76172",
  whatsappUrl: "https://wa.me/919962176172?text=Hello%20Dheerah%20Boutique%2C%20I%20would%20like%20to%20plan%20a%20visit%20to%20your%20Vadapalani%20store.",
  email: "hello@dheerah.com",
  openingHours: "Mon – Sat: 10:30 AM – 8:30 PM | Sunday: 11:00 AM – 6:00 PM (By Appointment)",
  openingHoursList: [
    { days: "Monday – Saturday", hours: "10:30 AM – 8:30 PM", note: "Walk-ins & Appointments welcome" },
    { days: "Sunday", hours: "11:00 AM – 6:00 PM", note: "Bespoke Bridal & Tailoring Appointments" },
  ] as OpeningHourItem[],
  mapsUrl: "https://www.google.com/maps/place/Dheerah+Designer+Boutique/@13.0468098,80.2124673,17z",
  embedMapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.824982489896!2d80.2124673!3d13.046809800000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52678e4be20755%3A0x753ec03c5eaad7b2!2sDheerah%20Designer%20Boutique!5e0!3m2!1sen!2sin!4v1790882526336!5m2!1sen!2sin",
  amenities: [
    "Personal Stylist Consultation",
    "Private Bridal Trial Suite",
    "Master Tailor On-Site Measurements",
    "Direct Fabric Swatch Selection",
    "Free Boutique Customer Parking",
    "Worldwide Insured Shipping"
  ],
  storefrontImage: "/store-assets/dheerah-storefront.jpg",
  interiorImage: "/store-assets/dheerah-interior.jpg",
  craftsmanshipImage: "/store-assets/dheerah-craftsmanship.jpg",
  redDoorImage: "/store-assets/dheerah-storefront.jpg"
};

export const storeExperiences: StoreExperience[] = [
  {
    id: "exp-ready-to-wear",
    key: "ready-to-wear",
    title: "READY TO WEAR",
    subtitle: "Pret-a-Porter & Everyday Luxury",
    tagline: "Off-the-rack perfection crafted from pure handlooms",
    description: "Discover our handpicked ready-to-wear silhouettes designed for immediate elegance — from lightweight cotton daily maxis to festive Banarasi coord sets and drape-ready sarees.",
    features: [
      "Curated seasonal collections in standard sizes XS to 2XL",
      "Immediate boutique trials with on-the-spot minor adjustments",
      "Contemporary festive styling matching modern sensibilities"
    ],
    image: "/figma-assets/about-sec3-landscape.jpg",
    ctaText: "Explore Ready to Wear",
    ctaAction: "shop",
    categoryLink: "salwar-suits"
  },
  {
    id: "exp-custom-tailoring",
    key: "custom-tailoring",
    title: "CUSTOM TAILORING",
    subtitle: "Made to Measure Proportions",
    tagline: "Tailored precisely to your body shape and posture",
    description: "Every body is unique. Our in-house master tailors take precision measurements and sculpt necklines, sleeve contours, and waist silhouettes to your exact specifications.",
    features: [
      "Dedicated measurement session with experienced pattern makers",
      "Custom neckline, sleeve cut, drape length and flare choices",
      "Complimentary trial & fine-tuning fitting session included"
    ],
    image: "/figma-assets/about-sec4-portrait.jpg",
    ctaText: "Book Tailoring Session",
    ctaAction: "whatsapp"
  },
  {
    id: "exp-bridal-wear",
    key: "bridal-wear",
    title: "BRIDAL WEAR",
    subtitle: "Heirloom Trousseau & Muhurtham Elegance",
    tagline: "Bespoke bridal lehengas, pure silk sarees and wedding ensembles",
    description: "From intimate engagement ceremonies to grand wedding receptions, our bridal atelier curates bespoke lehengas, hand-woven Kanjivarams, and royal bridal blouses.",
    features: [
      "Private bridal suite for comfortable family consultations",
      "Custom shade-matching with auspicious wedding color palettes",
      "Coordinated ensembles for brides, sisters, and bridal parties"
    ],
    image: "/products/lehenga/pearl-antique-gold.jpg",
    ctaText: "Consult Bridal Specialist",
    ctaAction: "whatsapp"
  },
  {
    id: "exp-aari-embroidery",
    key: "aari-embroidery",
    title: "AARI EMBROIDERY",
    subtitle: "Intricate Maggam & Zardozi Handwork",
    tagline: "Master artisans embroidering heirloom motifs on wooden khatias",
    description: "Witness authentic Aari, Zardozi, and Maggam needlecraft executed by generational artisans using antique gold zari, seed pearls, kundan stones, and silk threads.",
    features: [
      "Custom bridal blouse embroidery motifs tailored to your neckline",
      "Handcrafted sample swatches shown before full execution",
      "Preservation of centuries-old Indian artisan needlecraft"
    ],
    image: "/store-assets/dheerah-craftsmanship.jpg",
    ctaText: "Inquire Embroidery Designs",
    ctaAction: "whatsapp"
  }
];

export const storeJourneySteps = [
  { step: "01", label: "DISCOVER", text: "Browse collections online or step through our doors" },
  { step: "02", label: "VISIT", text: "Touch and feel authentic handlooms at our Vadapalani boutique" },
  { step: "03", label: "EXPERIENCE", text: "Discuss your silhouette, preferences and event theme with stylists" },
  { step: "04", label: "CUSTOMIZE", text: "Select fabrics, necklines, sleeves and aari embroidery patterns" },
  { step: "05", label: "MAKE IT YOURS", text: "Experience perfection in fit and take home an heirloom creation" }
];

export const dheerahExperienceSteps: StoreStep[] = [
  {
    step: "01",
    title: "DISCOVER",
    description: "Explore collections, fabrics and styles.",
    detail: "Browse our expansive collection of handwoven silks, breathable linens, organzas, and bridal lehengas in person or online."
  },
  {
    step: "02",
    title: "DISCUSS",
    description: "Share what you are looking for.",
    detail: "Sit down with our styling consultants in the boutique lounge. Share your vision, occasion dates, moodboards, and preferred palette."
  },
  {
    step: "03",
    title: "CUSTOMIZE",
    description: "Explore tailoring and design possibilities.",
    detail: "Fine-tune design parameters: choose blouse cut, neckline silhouette, sleeve length, lining material, and hand-embroidered aari motifs."
  },
  {
    step: "04",
    title: "FIT",
    description: "Refine the fit and finishing.",
    detail: "Try on your tailored piece in our private fitting suites. Our master tailors ensure seam placements and drape hang with absolute precision."
  },
  {
    step: "05",
    title: "YOURS",
    description: "Take home a look created for you.",
    detail: "Your bespoke creation is hand-pressed, steam-finished, and packaged with care — ready to shine at your special celebration."
  }
];

export const storeGalleryItems: StoreGalleryItem[] = [
  {
    id: "gal-1",
    label: "THE STOREFRONT",
    title: "Vadapalani Boutique Entrance",
    caption: "The welcoming crimson doors of Dheerah Designer Boutique on South Sivan Koil Street.",
    image: "/store-assets/dheerah-storefront.jpg",
    aspect: "aspect-[16/10]",
    span: "md:col-span-8"
  },
  {
    id: "gal-2",
    label: "THE ATELIER",
    title: "Boutique Showroom & Collections",
    caption: "Curated designer anarkalis, festive gowns, folded handloom silks, and styling displays.",
    image: "/store-assets/dheerah-interior.jpg",
    aspect: "aspect-[4/3]",
    span: "md:col-span-4"
  },
  {
    id: "gal-3",
    label: "THE CRAFTSMANSHIP",
    title: "Live Aari & Zardozi Needlework",
    caption: "Generational artisans executing delicate golden zari and pearl embroidery by hand.",
    image: "/store-assets/dheerah-craftsmanship.jpg",
    aspect: "aspect-[4/3]",
    span: "md:col-span-4"
  },
  {
    id: "gal-4",
    label: "THE COLLECTION",
    title: "Festive & Bridal Silhouettes",
    caption: "Handcrafted heritage kurta sets, maxis, and celebratory ensembles.",
    image: "/figma-assets/editorial-red-backdrop-suit.jpg",
    aspect: "aspect-[4/5]",
    span: "md:col-span-4"
  },
  {
    id: "gal-5",
    label: "THE FABRICS",
    title: "Pure Handloom Textiles",
    caption: "Natural fibers, soft organic textures, and hand-dyed yarns selected for comfort.",
    image: "/figma-assets/about-sec4-portrait.jpg",
    aspect: "aspect-[4/3]",
    span: "md:col-span-4"
  }
];
