import type {
  AdSlotConfig,
  AdSlotId,
  CrossPromoAd,
  HeroAdSlide,
  Resort,
  WeeklyDeal,
  WayanadLocation,
} from '../types/resort';

export const WAYANAD_LOCATIONS: WayanadLocation[] = [
  'All Wayanad',
  'Vythiri',
  'Mananthavady',
  'Meppadi',
  'Sultan Bathery',
  'Thirunelli',
];

export const GENERATED_BANNER_PRESETS = [
  {
    label: 'Vythiri Rainforest Infinity Pool',
    url: '/src/assets/images/hero_misty_woods_vythiri_1795504229144.jpg',
  },
  {
    label: 'Meppadi Tea Ridge Sunrise',
    url: '/src/assets/images/hero_chembra_ridge_meppadi_1795504229570.jpg',
  },
  {
    label: 'Banasura Dam Plunge Villa',
    url: '/src/assets/images/resort_banasura_villa_1795504229875.jpg',
  },
  {
    label: 'Soochipara Waterfall Suite',
    url: '/src/assets/images/resort_soochipara_glade_1795504232428.jpg',
  },
];

export const INITIAL_RESORTS: Resort[] = [
  {
    id: 'misty-woods-vythiri',
    name: 'Misty Woods Canopy Resort',
    location: 'Vythiri',
    landmarkDistance: '1.8 km from Pookode Lake',
    pricePerNight: 6800,
    verified: true,
    offerPill: 'Winter Deal: ₹2,000 Off + Breakfast',
    rating: 4.9,
    reviewCount: 214,
    hasVideoTour: true,
    videoLabel: '45s Infinity Pool & Canopy Walk',
    videoDuration: '0:45',
    primaryImage: '/src/assets/images/hero_misty_woods_vythiri_1795504229144.jpg',
    galleryImages: [
      '/src/assets/images/hero_misty_woods_vythiri_1795504229144.jpg',
      '/src/assets/images/resort_treehouse_vythiri_1795504230546.jpg',
      '/src/assets/images/resort_banasura_villa_1795504229875.jpg',
      '/src/assets/images/resort_soochipara_glade_1795504232428.jpg',
    ],
    description:
      'Perched above 14 acres of untouched Western Ghats rainforest in Vythiri, Misty Woods Canopy Resort pairs an emerald-edge heated infinity pool with handcrafted teak suites. Wake up to hornbill calls, enjoy farm-to-table Malabar breakfasts on the timber deck, and book directly with zero OTA markup.',
    amenities: ['pool', 'campfire', 'treehouse', 'jeep_safari', 'dining', 'wifi'],
    whatsappNumber: '919847011223',
    upiId: 'mistywoods.vythiri@okhdfcbank',
    directBookingUrl: 'https://mistywoodsvythiri.example.com/direct-book',
    faqs: [
      {
        question: 'How far is Misty Woods Canopy Resort from Pookode Lake?',
        answer:
          'We are located just 1.8 km (a 5-minute forest drive) from Pookode Lake and 4 km from Lakkidi View Point.',
      },
      {
        question: 'Is the infinity pool heated during Wayanad winter evenings?',
        answer:
          'Yes, our valley-facing infinity pool is solar-heated to a comfortable 29°C throughout November–February.',
      },
      {
        question: 'How do I claim the Winter Deal with complimentary breakfast?',
        answer:
          'Click Book via WhatsApp or Pay / Book Direct on this page to lock the ₹2,000 direct-booking discount and complimentary Kerala breakfast for two.',
      },
    ],
  },
  {
    id: 'banasura-mist-villas',
    name: 'Banasura Mist Eco Villas',
    location: 'Vythiri',
    landmarkDistance: '1.2 km from Banasura Sagar Dam',
    pricePerNight: 5400,
    verified: true,
    offerPill: 'Winter Deal: ₹2,000 + Breakfast',
    rating: 4.9,
    reviewCount: 142,
    hasVideoTour: true,
    videoLabel: '30s Private Plunge Pool Tour',
    videoDuration: '0:30',
    primaryImage: '/src/assets/images/resort_banasura_villa_1795504229875.jpg',
    galleryImages: [
      '/src/assets/images/resort_banasura_villa_1795504229875.jpg',
      '/src/assets/images/hero_misty_woods_vythiri_1795504229144.jpg',
      '/src/assets/images/resort_coffee_estate_mananthavady_1795504231221.jpg',
      '/src/assets/images/resort_edakkal_retreat_1795504231628.jpg',
    ],
    description:
      'Constructed with rammed earth and reclaimed Kerala teak, Banasura Mist Eco Villas offers private plunge pools overlooking the tranquil reservoir waters of Banasura Sagar Dam. Ideal for couples and families seeking quiet lakeside mornings and curated evening campfires.',
    amenities: ['pool', 'campfire', 'jeep_safari', 'dining', 'wifi'],
    whatsappNumber: '919847044556',
    upiId: 'banasuramist@okicici',
    directBookingUrl: 'https://banasuramist.example.com/reserve',
    faqs: [
      {
        question: 'Can we walk or kayak near Banasura Sagar Dam from the resort?',
        answer:
          'Yes, the Banasura boating jetty is 1.2 km away, and our concierge arranges morning guided coracle and kayak sessions.',
      },
      {
        question: 'Are private plunge pools available in every villa?',
        answer:
          'All six Lakefront Mud Villas feature an exclusive heated stone plunge pool with unobstructed dam views.',
      },
      {
        question: 'Do direct UPI or WhatsApp bookings include free cancellation?',
        answer:
          'Direct bookings via Wayngongo include 100% free date rescheduling up to 48 hours before check-in.',
      },
    ],
  },
  {
    id: 'chembra-ridge-retreat',
    name: 'Chembra Ridge Tea Retreat',
    location: 'Meppadi',
    landmarkDistance: '3.5 km from Chembra Peak Trail',
    pricePerNight: 7200,
    verified: true,
    offerPill: 'Sunrise Package: Guided Tea Walk',
    rating: 4.8,
    reviewCount: 176,
    hasVideoTour: true,
    videoLabel: '50s Glass Villa & Tea Estate Drone',
    videoDuration: '0:50',
    primaryImage: '/src/assets/images/hero_chembra_ridge_meppadi_1795504229570.jpg',
    galleryImages: [
      '/src/assets/images/hero_chembra_ridge_meppadi_1795504229570.jpg',
      '/src/assets/images/resort_soochipara_glade_1795504232428.jpg',
      '/src/assets/images/resort_edakkal_retreat_1795504231628.jpg',
      '/src/assets/images/hero_misty_woods_vythiri_1795504229144.jpg',
    ],
    description:
      'Set inside a 90-year-old organic tea estate in Meppadi, Chembra Ridge features floor-to-ceiling glass suites and a heated ridge pool facing the heart-shaped lake trail of Chembra Peak. Guests receive complimentary estate tea tasting and early-morning trekking permits support.',
    amenities: ['pool', 'campfire', 'jeep_safari', 'dining', 'wifi'],
    whatsappNumber: '919847077889',
    upiId: 'chembraridge@okaxis',
    directBookingUrl: 'https://chembraridge.example.com/book',
    faqs: [
      {
        question: 'Does the resort assist with Chembra Peak forest trekking passes?',
        answer:
          'Yes, our travel desk organizes early-morning jeep transfers to the Forest Office counter at 6:15 AM for priority entry.',
      },
      {
        question: 'What is included in the Sunrise Package offer?',
        answer:
          'Complimentary 90-minute naturalist-led tea plantation walk, estate black-tea tasting, and late 1:00 PM checkout.',
      },
    ],
  },
  {
    id: 'canopy-nest-treehouses',
    name: 'Canopy Nest Treehouses',
    location: 'Vythiri',
    landmarkDistance: '4.0 km from Lakkidi View Point',
    pricePerNight: 8900,
    verified: true,
    offerPill: 'Honeymoon Special: Candlelight Deck',
    rating: 5.0,
    reviewCount: 93,
    hasVideoTour: false,
    primaryImage: '/src/assets/images/resort_treehouse_vythiri_1795504230546.jpg',
    galleryImages: [
      '/src/assets/images/resort_treehouse_vythiri_1795504230546.jpg',
      '/src/assets/images/hero_misty_woods_vythiri_1795504229144.jpg',
      '/src/assets/images/resort_banasura_villa_1795504229875.jpg',
      '/src/assets/images/resort_kabini_thirunelli_1795504231797.jpg',
    ],
    description:
      'Suspended 35 feet above a mossy rainforest ravine without harming a single live trunk, Canopy Nest offers hand-woven bamboo and hardwood treehouses with wrap-around lantern decks and private valley-view soaking tubs.',
    amenities: ['treehouse', 'campfire', 'dining', 'wifi'],
    whatsappNumber: '919847099112',
    upiId: 'canopynest@okicici',
    directBookingUrl: 'https://canopynest.example.com/suites',
    faqs: [
      {
        question: 'Are the treehouses safe for families or strictly for couples?',
        answer:
          'Our wrap-around decks have 4-foot tempered glass railings; two lower-elevation canopy villas welcome families with kids aged 6+.',
      },
      {
        question: 'How is luggage carried up to the treehouses?',
        answer:
          'Our estate porters handle all luggage via our dedicated boardwalk access path on arrival.',
      },
    ],
  },
  {
    id: 'malabar-planters-bungalow',
    name: "Malabar Planter's Bungalow",
    location: 'Mananthavady',
    landmarkDistance: '2.5 km from Kuruvadweep Island',
    pricePerNight: 4200,
    verified: true,
    offerPill: 'Estate Stay: Free Coffee Tasting',
    rating: 4.8,
    reviewCount: 118,
    hasVideoTour: false,
    primaryImage: '/src/assets/images/resort_coffee_estate_mananthavady_1795504231221.jpg',
    galleryImages: [
      '/src/assets/images/resort_coffee_estate_mananthavady_1795504231221.jpg',
      '/src/assets/images/resort_kabini_thirunelli_1795504231797.jpg',
      '/src/assets/images/resort_banasura_villa_1795504229875.jpg',
      '/src/assets/images/resort_edakkal_retreat_1795504231628.jpg',
    ],
    description:
      'A lovingly restored 1938 colonial-era planter bungalow nestled inside 40 acres of shade-grown Arabica coffee, black pepper vines, and cardamom in Mananthavady. Authentic Malabar home cooking and peaceful veranda afternoons await.',
    amenities: ['campfire', 'jeep_safari', 'dining', 'wifi'],
    whatsappNumber: '919847022334',
    upiId: 'malabarplanter@oksbi',
    directBookingUrl: 'https://malabarbungalow.example.com/stay',
    faqs: [
      {
        question: 'How close is the bungalow to Kuruvadweep River Islands?',
        answer:
          'The Kuruvadweep bamboo rafting entrance is 2.5 km away—about a 7-minute drive along quiet estate lanes.',
      },
      {
        question: 'Do you serve authentic Wayanad bamboo rice and traditional meals?',
        answer:
          'Yes! Our kitchen prepares daily Malabar sadya, bamboo rice payasam, and estate-roasted filter coffee.',
      },
    ],
  },
  {
    id: 'brahmagiri-stream-camp',
    name: 'Brahmagiri Stream Camp',
    location: 'Thirunelli',
    landmarkDistance: '1.5 km from Thirunelli Temple',
    pricePerNight: 3900,
    verified: true,
    offerPill: 'Early Bird: 20% Off 2+ Nights',
    rating: 4.7,
    reviewCount: 89,
    hasVideoTour: true,
    videoLabel: '35s Riverside Glamping & Forest Trail',
    videoDuration: '0:35',
    primaryImage: '/src/assets/images/resort_kabini_thirunelli_1795504231797.jpg',
    galleryImages: [
      '/src/assets/images/resort_kabini_thirunelli_1795504231797.jpg',
      '/src/assets/images/resort_coffee_estate_mananthavady_1795504231221.jpg',
      '/src/assets/images/resort_treehouse_vythiri_1795504230546.jpg',
      '/src/assets/images/resort_edakkal_retreat_1795504231628.jpg',
    ],
    description:
      'Wake to the sound of a crystal-clear mountain stream bordering Brahmagiri Wildlife Sanctuary. Our stone-and-canvas luxury glamping tents blend wilderness immersion with orthopedic king beds, en-suite hot showers, and guided dawn wildlife drives to Tholpetty.',
    amenities: ['campfire', 'jeep_safari', 'dining'],
    whatsappNumber: '919847055667',
    upiId: 'brahmagiricamp@okicici',
    directBookingUrl: 'https://brahmagiricamp.example.com/glamping',
    faqs: [
      {
        question: 'Can you arrange Tholpetty Wildlife Sanctuary jeep safaris?',
        answer:
          'Yes, Tholpetty safari gate is 12 minutes away and we book morning 6:00 AM forest department jeeps directly for guests.',
      },
      {
        question: 'Is the stream safe for guests to dip their feet?',
        answer:
          'Our private shallow rock-pool bend inside the fenced estate is clean, crystal clear, and monitored by camp naturalists.',
      },
    ],
  },
  {
    id: 'edakkal-granite-haven',
    name: 'Edakkal Granite Haven',
    location: 'Sultan Bathery',
    landmarkDistance: '900 m from Edakkal Caves',
    pricePerNight: 4800,
    verified: true,
    offerPill: 'Family Combo: Free Campfire & BBQ',
    rating: 4.8,
    reviewCount: 164,
    hasVideoTour: false,
    primaryImage: '/src/assets/images/resort_edakkal_retreat_1795504231628.jpg',
    galleryImages: [
      '/src/assets/images/resort_edakkal_retreat_1795504231628.jpg',
      '/src/assets/images/resort_banasura_villa_1795504229875.jpg',
      '/src/assets/images/hero_chembra_ridge_meppadi_1795504229570.jpg',
      '/src/assets/images/resort_coffee_estate_mananthavady_1795504231221.jpg',
    ],
    description:
      'Built into natural Ambukuthi granite outcrops just 900 meters from the prehistoric Edakkal Caves, this boutique family retreat features spacious 2-bedroom stone cottages, starlit campfire terraces, and Muthanga safari pickups.',
    amenities: ['campfire', 'jeep_safari', 'dining', 'wifi'],
    whatsappNumber: '919847066778',
    upiId: 'edakkalhaven@okhdfcbank',
    directBookingUrl: 'https://edakkalhaven.example.com/family-stay',
    faqs: [
      {
        question: 'Can we walk to Edakkal Caves from the property?',
        answer:
          'Yes, the Edakkal Caves base ticket counter is a scenic 10-minute walk (900 m) from our main gate.',
      },
      {
        question: 'What is included in the Family Combo Campfire & BBQ?',
        answer:
          'Private stone firepit setup at 7:30 PM with freshly grilled pepper chicken or paneer skewers for up to 4 guests.',
      },
    ],
  },
  {
    id: 'soochipara-waterfall-suites',
    name: 'Soochipara Waterfall Suites',
    location: 'Meppadi',
    landmarkDistance: '1.1 km from Soochipara Waterfalls',
    pricePerNight: 6100,
    verified: true,
    offerPill: 'Weekend Flash: Free Jeep Safari',
    rating: 4.9,
    reviewCount: 131,
    hasVideoTour: true,
    videoLabel: '40s Natural Rock Pool & Mist Balcony',
    videoDuration: '0:40',
    primaryImage: '/src/assets/images/resort_soochipara_glade_1795504232428.jpg',
    galleryImages: [
      '/src/assets/images/resort_soochipara_glade_1795504232428.jpg',
      '/src/assets/images/hero_chembra_ridge_meppadi_1795504229570.jpg',
      '/src/assets/images/hero_misty_woods_vythiri_1795504229144.jpg',
      '/src/assets/images/resort_treehouse_vythiri_1795504230546.jpg',
    ],
    description:
      'Set on a misty cardamom ridge facing the Sentinel Rock cascade in Meppadi, Soochipara Waterfall Suites pairs natural spring-fed stone pools with breezy thatched-timber bedrooms and private sunrise decks.',
    amenities: ['pool', 'jeep_safari', 'dining', 'wifi'],
    whatsappNumber: '919847088990',
    upiId: 'soochiparasuites@okaxis',
    directBookingUrl: 'https://soochiparasuites.example.com/book',
    faqs: [
      {
        question: 'Do all suites have a view of the waterfall valley?',
        answer:
          'Yes, all 8 ridge suites face south-west directly toward the Sentinel Rock gorge and morning mist valley.',
      },
      {
        question: 'Which jeep safari route is included in the Weekend Flash offer?',
        answer:
          'Guests receive a complimentary 2-hour 4x4 ridge trail to Sunrise Viewpoint and hidden cardamom plantations.',
      },
    ],
  },
];

export const INITIAL_HERO_ADS: HeroAdSlide[] = [
  {
    id: 'hero-ad-1',
    resortId: 'misty-woods-vythiri',
    resortName: 'Misty Woods Canopy Resort',
    location: 'Vythiri',
    headline: 'Winter Rainforest Escapes — Heated Infinity Pool Suites',
    subheadline:
      'Save ₹2,000 per night + complimentary Malabar breakfast when you book direct with zero OTA fees.',
    offerTag: 'Vythiri',
    ctaLabel: 'Claim Offer / Visit Site',
    imageUrl: '/src/assets/images/hero_misty_woods_vythiri_1795504229144.jpg',
    redirectUrl: 'https://mistywoodsvythiri.example.com/direct-book',
  },
  {
    id: 'hero-ad-2',
    resortId: 'chembra-ridge-retreat',
    resortName: 'Chembra Ridge Tea Retreat',
    location: 'Meppadi',
    headline: 'Wake Above the Clouds at Chembra Tea Gardens',
    subheadline:
      'Glass-front tea ridge villas with complimentary sunrise plantation walk and Chembra trek desk.',
    offerTag: 'Meppadi',
    ctaLabel: 'Claim Offer / Visit Site',
    imageUrl: '/src/assets/images/hero_chembra_ridge_meppadi_1795504229570.jpg',
    redirectUrl: 'https://chembraridge.example.com/book',
  },
];

export const INITIAL_WEEKLY_DEALS: WeeklyDeal[] = [
  {
    id: 'deal-1',
    resortId: 'misty-woods-vythiri',
    resortName: 'Misty Woods Canopy Resort',
    location: 'Vythiri',
    dealTitle: 'Winter Special: 40% Off Pool Suites + Breakfast',
    validUntil: 'Ends Sunday',
  },
  {
    id: 'deal-2',
    resortId: 'banasura-mist-villas',
    resortName: 'Banasura Mist Eco Villas',
    location: 'Vythiri',
    dealTitle: '₹2,000 Off Lakefront Plunge Villa + Free Kayaking',
    validUntil: '3 nights left',
  },
  {
    id: 'deal-3',
    resortId: 'soochipara-waterfall-suites',
    resortName: 'Soochipara Waterfall Suites',
    location: 'Meppadi',
    dealTitle: 'Complimentary 4x4 Ridge Jeep Safari on Weekend Stays',
    validUntil: 'This Week',
  },
  {
    id: 'deal-4',
    resortId: 'edakkal-granite-haven',
    resortName: 'Edakkal Granite Haven',
    location: 'Sultan Bathery',
    dealTitle: 'Family Combo: Free Evening Campfire & Pepper BBQ',
    validUntil: 'Ends Friday',
  },
];

export const INITIAL_CROSS_PROMO_ADS: CrossPromoAd[] = [
  {
    id: 'cross-1',
    resortId: 'chembra-ridge-retreat',
    resortName: 'Chembra Ridge Tea Retreat',
    location: 'Meppadi',
    tagline: 'Glass tea-estate suites overlooking Chembra Peak',
    offerBadge: 'Free Sunrise Tea Walk',
    imageUrl: '/src/assets/images/hero_chembra_ridge_meppadi_1795504229570.jpg',
    redirectUrl: 'https://chembraridge.example.com/book',
  },
  {
    id: 'cross-2',
    resortId: 'canopy-nest-treehouses',
    resortName: 'Canopy Nest Treehouses',
    location: 'Vythiri',
    tagline: 'Elevated bamboo suites 35 ft in the rainforest canopy',
    offerBadge: 'Free Candlelight Deck',
    imageUrl: '/src/assets/images/resort_treehouse_vythiri_1795504230546.jpg',
    redirectUrl: 'https://canopynest.example.com/suites',
  },
  {
    id: 'cross-3',
    resortId: 'soochipara-waterfall-suites',
    resortName: 'Soochipara Waterfall Suites',
    location: 'Meppadi',
    tagline: 'Natural spring rock pool facing Sentinel Rock falls',
    offerBadge: 'Free 4x4 Jeep Safari',
    imageUrl: '/src/assets/images/resort_soochipara_glade_1795504232428.jpg',
    redirectUrl: 'https://soochiparasuites.example.com/book',
  },
];

export const INITIAL_AD_SLOT_CONFIGS: Record<AdSlotId, AdSlotConfig> = {
  hero_slider: {
    selected: true,
    bannerUrl: '/src/assets/images/resort_banasura_villa_1795504229875.jpg',
    bannerFileName: 'banasura-hero-winter.jpg',
    redirectUrl: 'https://banasuramist.example.com/reserve',
    headline: 'Lakefront Plunge Villas Near Banasura Dam — Save ₹2,000 Direct',
  },
  cross_promo: {
    selected: false,
    bannerUrl: '/src/assets/images/resort_banasura_villa_1795504229875.jpg',
    bannerFileName: 'banasura-cross-promo.jpg',
    redirectUrl: 'https://banasuramist.example.com/reserve',
    headline: 'Book Lakefront Plunge Villas Direct — Free Kayaking Included',
  },
  notification_bar: {
    selected: false,
    bannerUrl: '',
    bannerFileName: '',
    redirectUrl: 'https://banasuramist.example.com/reserve',
    headline: 'Flash Offer: Save ₹2,000 + Free Breakfast at Banasura Mist Eco Villas',
  },
  directory_banner: {
    selected: false,
    bannerUrl: '/src/assets/images/hero_misty_woods_vythiri_1795504229144.jpg',
    bannerFileName: 'banasura-directory-banner.jpg',
    redirectUrl: 'https://banasuramist.example.com/reserve',
    headline: 'Direct Weekend Escape at Banasura Mist Eco Villas — Zero Commission',
  },
};
