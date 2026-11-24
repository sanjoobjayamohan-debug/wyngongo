import type {
  BudgetHotel,
  EventTicketListing,
  LocalRestaurant,
  TourOperator,
} from '../types/resort';

export const CATEGORY_IMAGE_PRESETS = {
  restaurant: [
    {
      label: 'Malabar Banana-Leaf Dining Room',
      url: '/src/assets/images/wayanad_kerala_dining_1795505921235.jpg',
    },
    {
      label: 'Coffee Estate Veranda Cafe',
      url: '/src/assets/images/resort_coffee_estate_mananthavady_1795504231221.jpg',
    },
    {
      label: 'Meppadi Tea Garden Patio',
      url: '/src/assets/images/hero_chembra_ridge_meppadi_1795504229570.jpg',
    },
  ],
  budget_hotel: [
    {
      label: 'Wayanad Hills Boutique Double Room',
      url: '/src/assets/images/wayanad_budget_inn_1795505921732.jpg',
    },
    {
      label: 'Edakkal Stone Lodge',
      url: '/src/assets/images/resort_edakkal_retreat_1795504231628.jpg',
    },
    {
      label: 'Mananthavady Estate Rooms',
      url: '/src/assets/images/resort_coffee_estate_mananthavady_1795504231221.jpg',
    },
  ],
  tour: [
    {
      label: '4x4 Tea Ridge Jeep Safari',
      url: '/src/assets/images/wayanad_jeep_safari_1795505922349.jpg',
    },
    {
      label: 'Chembra Sunrise Ridge Trail',
      url: '/src/assets/images/hero_chembra_ridge_meppadi_1795504229570.jpg',
    },
    {
      label: 'Soochipara Valley Gorge',
      url: '/src/assets/images/resort_soochipara_glade_1795504232428.jpg',
    },
  ],
  events: [
    {
      label: 'Poopoli Flower Archways & Hill Garden',
      url: '/src/assets/images/wayanad_flower_festival_1795510838898.jpg',
    },
    {
      label: 'Evening Fest Lights & Exhibition Stalls',
      url: '/src/assets/images/wayanad_night_carnival_1795510839515.jpg',
    },
    {
      label: 'Misty Valley Open Grounds',
      url: '/src/assets/images/hero_misty_woods_vythiri_1795504229144.jpg',
    },
  ],
};

export const WAYANAD_RESTAURANTS: LocalRestaurant[] = [
  {
    id: 'pepper-leaf-kitchen',
    name: 'Pepper Leaf Kitchen',
    town: 'Kalpetta',
    specialty: 'Kerala meals',
    hours: '11:30 AM – 10:00 PM',
    avgForTwoInr: 480,
    whatsappNumber: '919847101101',
    rating: 4.8,
    reviewCount: 312,
    offerBadge: 'Complimentary Sulaimani Tea on Direct Table Booking',
    primaryImage: '/src/assets/images/wayanad_kerala_dining_1795505921235.jpg',
    galleryImages: [
      '/src/assets/images/wayanad_kerala_dining_1795505921235.jpg',
      '/src/assets/images/resort_coffee_estate_mananthavady_1795504231221.jpg',
      '/src/assets/images/resort_edakkal_retreat_1795504231628.jpg',
      '/src/assets/images/hero_misty_woods_vythiri_1795504229144.jpg',
    ],
    description:
      'Known across Kalpetta for authentic Wayanad banana-leaf Kerala sadya, freshly ground black-pepper roasts, and slow-simmered clay-pot fish curries sourced from local spice farms.',
    highlights: [
      'Traditional Banana-Leaf Meals',
      'Wayanad Black Pepper Specials',
      'Family Seating & AC Dining',
      'Free Guest Parking',
    ],
    serviceItems: [
      {
        id: 'plk-1',
        name: 'Wayanad Sadya Banana-Leaf Meal',
        detail: 'Matta rice, 9 seasonal sides, sambar, avial, payasam & pappadam',
        priceInr: 220,
      },
      {
        id: 'plk-2',
        name: 'Clay-Pot Malabar Chicken Curry Combo',
        detail: 'Served with flaky Malabar parotta or appam (2 pcs)',
        priceInr: 310,
      },
      {
        id: 'plk-3',
        name: 'Bamboo Rice Payasam & Filter Coffee',
        detail: 'Traditional forest bamboo grain dessert with estate roast coffee',
        priceInr: 140,
      },
    ],
    faqs: [
      {
        question: 'Do I need a prior reservation for weekend lunch at Pepper Leaf Kitchen?',
        answer:
          'Walk-ins are welcome, and pre-booking via Wayngongo reserves a priority family table between 12:30 PM and 2:30 PM.',
      },
      {
        question: 'Are vegetarian and Jain-friendly Kerala meal options available?',
        answer:
          'Yes, our full vegetarian Kerala sadya and fresh avial platters are prepared in dedicated vegetarian cookware daily.',
      },
    ],
  },
  {
    id: 'malabar-spice-court',
    name: 'Malabar Spice Court',
    town: 'Sultan Bathery',
    regionFilter: 'Sultan Bathery',
    specialty: 'Biriyani',
    hours: '12:00 PM – 10:30 PM',
    avgForTwoInr: 550,
    whatsappNumber: '919847101102',
    rating: 4.9,
    reviewCount: 284,
    offerBadge: '10% Off Family Dum Handi Pre-Orders',
    primaryImage: '/src/assets/images/wayanad_kerala_dining_1795505921235.jpg',
    galleryImages: [
      '/src/assets/images/wayanad_kerala_dining_1795505921235.jpg',
      '/src/assets/images/resort_edakkal_retreat_1795504231628.jpg',
      '/src/assets/images/resort_coffee_estate_mananthavady_1795504231221.jpg',
      '/src/assets/images/resort_banasura_villa_1795504229875.jpg',
    ],
    description:
      'Located along the Sultan Bathery–Muthanga highway, Malabar Spice Court slow-cooks short-grain jeerakasala Thalassery and Wayanad biriyani in sealed copper handis over coconut-husk embers.',
    highlights: [
      'Jeerakasala Dum Biriyani',
      'Private Family Booths',
      'Highway Parking Near Edakkal',
      'Parcel & Group Takeaway',
    ],
    serviceItems: [
      {
        id: 'msc-1',
        name: 'Signature Malabar Dum Chicken Biriyani',
        detail: 'Jeerakasala rice, fried cashews, raisins, date pickle & raita',
        priceInr: 260,
      },
      {
        id: 'msc-2',
        name: 'Wayanad Mutton Clay-Pot Biriyani',
        detail: 'Slow-braised spiced mutton sealed with saffron ghee rice',
        priceInr: 360,
      },
      {
        id: 'msc-3',
        name: 'Paneer & Wild Mushroom Biriyani',
        detail: 'Aromatic spice-infused jeerakasala rice with roasted cashews',
        priceInr: 230,
      },
    ],
    faqs: [
      {
        question: 'How far is Malabar Spice Court from Edakkal Caves?',
        answer:
          'We are a 12-minute drive from Edakkal Caves on the Sultan Bathery town bypass road.',
      },
      {
        question: 'Can tour groups pre-order biriyani handis for fixed lunch times?',
        answer:
          'Yes! Use the WhatsApp reservation button to lock hot handi service for groups of 4 to 25 guests.',
      },
    ],
  },
  {
    id: 'kabani-bamboo-cafe',
    name: 'Kabani Bamboo Cafe',
    town: 'Mananthavady',
    regionFilter: 'Mananthavady',
    specialty: 'Bamboo biriyani',
    hours: '11:00 AM – 9:30 PM',
    avgForTwoInr: 520,
    whatsappNumber: '919847101103',
    rating: 4.8,
    reviewCount: 196,
    offerBadge: 'Free Bamboo Rice Payasam with Bamboo Biriyani',
    primaryImage: '/src/assets/images/resort_coffee_estate_mananthavady_1795504231221.jpg',
    galleryImages: [
      '/src/assets/images/resort_coffee_estate_mananthavady_1795504231221.jpg',
      '/src/assets/images/wayanad_kerala_dining_1795505921235.jpg',
      '/src/assets/images/resort_kabini_thirunelli_1795504231797.jpg',
      '/src/assets/images/hero_misty_woods_vythiri_1795504229144.jpg',
    ],
    description:
      'Set beneath shaded coffee trees near the Kabani river basin in Mananthavady, this rustic timber cafe crafts authentic Wayanad bamboo biriyani steamed inside fresh green bamboo hollows.',
    highlights: [
      'Smoked Bamboo Hollow Biriyani',
      'Organic Kabani Honey Glaze',
      'Open-Air Garden Veranda',
      'Estate Filter Coffee Bar',
    ],
    serviceItems: [
      {
        id: 'kbc-1',
        name: 'Smoked Bamboo Chicken Biriyani',
        detail: 'Steamed inside seasoned bamboo shoot with forest spices',
        priceInr: 290,
      },
      {
        id: 'kbc-2',
        name: 'Kabani Veg & Jackfruit Bamboo Biriyani',
        detail: 'Tender raw jackfruit, wild pepper & fragrant jeerakasala rice',
        priceInr: 240,
      },
      {
        id: 'kbc-3',
        name: 'Estate Roast Cold Coffee & Banana Fritters',
        detail: 'Single-origin Mananthavady arabica & crisp pazhampori',
        priceInr: 150,
      },
    ],
    faqs: [
      {
        question: 'Should we pre-book bamboo biriyani before visiting Kuruvadweep?',
        answer:
          'Bamboo biriyani is steamed in limited hourly batches—booking your slot via WhatsApp ensures hot service right after your raft tour.',
      },
    ],
  },
  {
    id: 'vythiri-tea-garden-diner',
    name: 'Vythiri Tea Garden Diner',
    town: 'Vythiri',
    regionFilter: 'Vythiri',
    specialty: 'Veg & snacks',
    hours: '7:30 AM – 9:00 PM',
    avgForTwoInr: 360,
    whatsappNumber: '919847101104',
    rating: 4.7,
    reviewCount: 229,
    offerBadge: 'Complimentary Cardamom Chai Refill Before 10 AM',
    primaryImage: '/src/assets/images/hero_chembra_ridge_meppadi_1795504229570.jpg',
    galleryImages: [
      '/src/assets/images/hero_chembra_ridge_meppadi_1795504229570.jpg',
      '/src/assets/images/wayanad_kerala_dining_1795505921235.jpg',
      '/src/assets/images/resort_treehouse_vythiri_1795504230546.jpg',
      '/src/assets/images/resort_banasura_villa_1795504229875.jpg',
    ],
    description:
      'Overlooking misty Vythiri tea slopes near Pookode Lake, Vythiri Tea Garden Diner serves crisp appams, puttu-kadala breakfasts, pure-veg Malabar thalis, and freshly steamed evening snacks.',
    highlights: [
      '100% Vegetarian Kitchen',
      'Early 7:30 AM Trekker Breakfast',
      'Tea Valley Balcony Seating',
      'Fresh Malabar Snacks & Chai',
    ],
    serviceItems: [
      {
        id: 'vtg-1',
        name: 'Early-Morning Puttu & Kadala Platter',
        detail: 'Steamed rice-coconut puttu, spiced black chickpea curry & pappad',
        priceInr: 140,
      },
      {
        id: 'vtg-2',
        name: 'Vythiri Pure-Veg Thali',
        detail: 'Red matta rice, rasam, thoran, kootu curry & curd',
        priceInr: 190,
      },
      {
        id: 'vtg-3',
        name: 'Evening Pazhampori & Cardamom Tea Tray',
        detail: 'Four hot plantain fritters with two pots of estate tea',
        priceInr: 160,
      },
    ],
    faqs: [
      {
        question: 'Is Vythiri Tea Garden Diner close to Lakkidi View Point?',
        answer:
          'Yes, we sit 6 minutes north of Lakkidi View Point and 1.5 km from Pookode Lake.',
      },
    ],
  },
  {
    id: 'thattukada-corner',
    name: 'Thattukada Corner',
    town: 'Meppadi',
    regionFilter: 'Meppadi',
    specialty: 'Late-night street food',
    hours: '5:30 PM – 1:00 AM',
    avgForTwoInr: 280,
    whatsappNumber: '919847101105',
    rating: 4.8,
    reviewCount: 410,
    offerBadge: 'Late-Night Trekker Combo: 3 Parottas + Pepper Roast ₹180',
    primaryImage: '/src/assets/images/wayanad_kerala_dining_1795505921235.jpg',
    galleryImages: [
      '/src/assets/images/wayanad_kerala_dining_1795505921235.jpg',
      '/src/assets/images/resort_soochipara_glade_1795504232428.jpg',
      '/src/assets/images/hero_chembra_ridge_meppadi_1795504229570.jpg',
      '/src/assets/images/resort_edakkal_retreat_1795504231628.jpg',
    ],
    description:
      'Meppadi’s favorite misty-evening street food hub serving sizzling tawa-flipped flaky parotta, spicy Wayanad pepper chicken fry, hot ginger kattan chai, and comforting late-night dosas until 1 AM.',
    highlights: [
      'Open Until 1:00 AM Daily',
      'Live Tawa Parotta & Omelette',
      'Wayanad Pepper Roast Specialties',
      'Quick Takeaway Counter',
    ],
    serviceItems: [
      {
        id: 'tkc-1',
        name: 'Tawa Parotta & Pepper Chicken Fry',
        detail: 'Three crisp layered parottas with crushed Tellicherry pepper roast',
        priceInr: 190,
      },
      {
        id: 'tkc-2',
        name: 'Kothu Parotta Special (Veg / Egg)',
        detail: 'Minced parotta tossed on cast-iron griddle with aromatic gravy',
        priceInr: 160,
      },
      {
        id: 'tkc-3',
        name: 'Midnight Thattu Dosa & Red Chutney',
        detail: 'Four mini stone-griddle dosas with fiery shallot chutney',
        priceInr: 110,
      },
    ],
    faqs: [
      {
        question: 'Can resorts in Meppadi order late-night takeaway parcels here?',
        answer:
          'Yes, guests staying around Chembra and Soochipara routinely pre-book hot parcels up to 12:30 AM.',
      },
    ],
  },
];

export const WAYANAD_BUDGET_HOTELS: BudgetHotel[] = [
  {
    id: 'hillview-budget-inn',
    name: 'Hillview Budget Inn',
    town: 'Kalpetta',
    priceFromInr: 1200,
    roomSummary: 'Clean double rooms near Kalpetta New Bus Stand with parking',
    whatsappNumber: '919847202201',
    upiId: 'hillviewinn@okicici',
    rating: 4.6,
    reviewCount: 185,
    offerBadge: 'Direct Stay Deal: Free Early Check-in at 10 AM',
    primaryImage: '/src/assets/images/wayanad_budget_inn_1795505921732.jpg',
    galleryImages: [
      '/src/assets/images/wayanad_budget_inn_1795505921732.jpg',
      '/src/assets/images/resort_edakkal_retreat_1795504231628.jpg',
      '/src/assets/images/resort_coffee_estate_mananthavady_1795504231221.jpg',
      '/src/assets/images/hero_chembra_ridge_meppadi_1795504229570.jpg',
    ],
    description:
      'Centrally located in Kalpetta just 400 meters from the KSRTC hub, Hillview Budget Inn offers spotless hillside-window rooms, high-speed Wi-Fi, 24-hour hot water, and covered parking for road-trippers.',
    highlights: [
      '24-Hour Check-in Desk',
      'High-Speed Fiber Wi-Fi',
      'Covered Car & Bike Parking',
      'Solar Hot Water & Clean Linens',
    ],
    serviceItems: [
      {
        id: 'hbi-1',
        name: 'Standard Hillside Double Room',
        detail: 'Queen bed, fan ventilation, valley window, Wi-Fi & hot shower',
        priceInr: 1200,
      },
      {
        id: 'hbi-2',
        name: 'Deluxe AC Twin / Couple Room',
        detail: 'Split AC, work desk, smart TV & complimentary morning tea',
        priceInr: 1650,
      },
      {
        id: 'hbi-3',
        name: 'Family Triple Bed Room',
        detail: 'One queen + one single bed for 3 guests with extra balcony chairs',
        priceInr: 2100,
      },
    ],
    faqs: [
      {
        question: 'Is Hillview Budget Inn convenient for early-morning buses and sightseeing cabs?',
        answer:
          'Yes, Kalpetta New Bus Stand is a 4-minute walk and all major Wayanad tour operators pick up directly from our gate.',
      },
    ],
  },
  {
    id: 'green-valley-lodge',
    name: 'Green Valley Lodge',
    town: 'Sultan Bathery',
    regionFilter: 'Sultan Bathery',
    priceFromInr: 1500,
    roomSummary: 'Family-friendly AC & non-AC rooms 10 min from Edakkal Caves',
    whatsappNumber: '919847202202',
    upiId: 'greenvalleylodge@okaxis',
    rating: 4.7,
    reviewCount: 148,
    offerBadge: 'Zero Booking Fee + Free Parking for Safari Jeeps',
    primaryImage: '/src/assets/images/wayanad_budget_inn_1795505921732.jpg',
    galleryImages: [
      '/src/assets/images/wayanad_budget_inn_1795505921732.jpg',
      '/src/assets/images/resort_edakkal_retreat_1795504231628.jpg',
      '/src/assets/images/wayanad_jeep_safari_1795505922349.jpg',
      '/src/assets/images/resort_banasura_villa_1795504229875.jpg',
    ],
    description:
      'Set on a quiet residential lane in Sultan Bathery within 10 minutes of Edakkal Caves and 18 minutes of Muthanga Wildlife Sanctuary, Green Valley Lodge offers bright, secure budget rooms for families and wildlife enthusiasts.',
    highlights: [
      '10 Min to Edakkal Caves',
      'Muthanga Safari Timing Support',
      'Spacious Family Rooms',
      'In-House Tea & Breakfast Service',
    ],
    serviceItems: [
      {
        id: 'gvl-1',
        name: 'Garden View Non-AC Double Room',
        detail: 'Quiet courtyard-facing room with fresh cotton bedding & Wi-Fi',
        priceInr: 1500,
      },
      {
        id: 'gvl-2',
        name: 'Executive AC Family Room',
        detail: 'Two double beds, air conditioning & seating area for 4 guests',
        priceInr: 2300,
      },
    ],
    faqs: [
      {
        question: 'Can we book a morning Muthanga safari cab from Green Valley Lodge?',
        answer:
          'Yes, our reception connects directly with licensed Muthanga & Edakkal drivers for 6:00 AM departures.',
      },
    ],
  },
  {
    id: 'kabani-traveller-rooms',
    name: 'Kabani Traveller Rooms',
    town: 'Mananthavady',
    regionFilter: 'Mananthavady',
    priceFromInr: 1100,
    roomSummary: 'Backpacker & solo traveller rooms near Kuruvadweep route',
    whatsappNumber: '919847202203',
    upiId: 'kabanitraveller@oksbi',
    rating: 4.7,
    reviewCount: 162,
    offerBadge: 'Stay 2+ Nights & Get ₹200 Off Per Night',
    primaryImage: '/src/assets/images/resort_coffee_estate_mananthavady_1795504231221.jpg',
    galleryImages: [
      '/src/assets/images/resort_coffee_estate_mananthavady_1795504231221.jpg',
      '/src/assets/images/wayanad_budget_inn_1795505921732.jpg',
      '/src/assets/images/resort_kabini_thirunelli_1795504231797.jpg',
      '/src/assets/images/wayanad_kerala_dining_1795505921235.jpg',
    ],
    description:
      'Designed for bikers, solo explorers, and small friend groups heading toward Kuruvadweep, Thirunelli, and Tholpetty, Kabani Traveller Rooms pairs pocket-friendly nightly tariffs with high-speed Wi-Fi and common terrace dining.',
    highlights: [
      'Most Affordable Private Rooms',
      'Rider Gear & Helmet Lockers',
      'Kuruvadweep & Tholpetty Access',
      'Shared Coffee Terrace',
    ],
    serviceItems: [
      {
        id: 'ktr-1',
        name: 'Solo / Couple Traveller Private Room',
        detail: 'Compact private room with en-suite bath, locker & fiber Wi-Fi',
        priceInr: 1100,
      },
      {
        id: 'ktr-2',
        name: '4-Bunk Friends Group Room',
        detail: 'Private 4-bed dorm room with individual charging & reading lamps',
        priceInr: 1800,
      },
    ],
    faqs: [
      {
        question: 'Is secure motorcycle parking available overnight?',
        answer:
          'Yes, our gated courtyard includes CCTV monitoring and covered parking for motorcycles and hatchbacks.',
      },
    ],
  },
  {
    id: 'meppadi-stay-express',
    name: 'Meppadi Stay Express',
    town: 'Meppadi',
    regionFilter: 'Meppadi',
    priceFromInr: 1400,
    roomSummary: 'Quick-check-in rooms ideal for early Chembra Peak trekkers',
    whatsappNumber: '919847202204',
    upiId: 'meppadistay@okhdfcbank',
    rating: 4.8,
    reviewCount: 139,
    offerBadge: 'Free 5:30 AM Trekker Flask Coffee Included',
    primaryImage: '/src/assets/images/wayanad_budget_inn_1795505921732.jpg',
    galleryImages: [
      '/src/assets/images/wayanad_budget_inn_1795505921732.jpg',
      '/src/assets/images/hero_chembra_ridge_meppadi_1795504229570.jpg',
      '/src/assets/images/resort_soochipara_glade_1795504232428.jpg',
      '/src/assets/images/wayanad_jeep_safari_1795505922349.jpg',
    ],
    description:
      'Built right in Meppadi town along the road to Chembra Peak and 900 Kandi, Meppadi Stay Express specializes in clean overnight rooms with instant digital check-in and early-morning hot showers before treks.',
    highlights: [
      '10 Min to Chembra Ticket Counter',
      'Early 5:30 AM Hot Shower Guarantee',
      'Luggage Hold After Checkout',
      '900 Kandi Jeep Pickup Point',
    ],
    serviceItems: [
      {
        id: 'mse-1',
        name: 'Trekker Express Double Room',
        detail: 'Queen bed, mountain mist window, fast Wi-Fi & 5 AM hot water',
        priceInr: 1400,
      },
      {
        id: 'mse-2',
        name: 'Meppadi Ridge Quad Room',
        detail: 'Spacious 4-person room ideal for trekking squads visiting Soochipara',
        priceInr: 2400,
      },
    ],
    faqs: [
      {
        question: 'Can we leave our backpacks safely while trekking Chembra Peak after checkout?',
        answer:
          'Yes! Complimentary locker storage and a freshen-up shower room are included for all registered guests.',
      },
    ],
  },
];

export const WAYANAD_TOUR_OPERATORS: TourOperator[] = [
  {
    id: 'wayanad-trails-tours',
    name: 'Wayanad Trails & Tours',
    services: 'Sightseeing · Jeep rides',
    startingPriceInr: 2400,
    duration: 'Half-day / 4x4 Ridge Trail',
    highlights: '900 Kandi glass bridge, Chembra viewpoint & off-road tea trails',
    whatsappNumber: '919847303301',
    upiId: 'wayanadtrails@okicici',
    rating: 4.9,
    reviewCount: 274,
    offerBadge: 'Resort Doorstep Pickup Included Across Vythiri & Meppadi',
    primaryImage: '/src/assets/images/wayanad_jeep_safari_1795505922349.jpg',
    galleryImages: [
      '/src/assets/images/wayanad_jeep_safari_1795505922349.jpg',
      '/src/assets/images/hero_chembra_ridge_meppadi_1795504229570.jpg',
      '/src/assets/images/resort_soochipara_glade_1795504232428.jpg',
      '/src/assets/images/hero_misty_woods_vythiri_1795504229144.jpg',
    ],
    description:
      'Licensed 4x4 Mahindra Thar and classic open-jeep specialists operating off-road trails to 900 Kandi Glass Bridge, hidden Attamala waterfalls, and private tea-ridge sunrise viewpoints.',
    inclusions: [
      '4x4 Off-Road Jeep & Driver',
      'Resort Pickup & Drop',
      'Bottled Water & Trail Permits Assistance',
      'Sunrise Photography Stops',
    ],
    serviceItems: [
      {
        id: 'wtt-1',
        name: '900 Kandi & Tea Ridge 4x4 Jeep Trail',
        detail: '3.5-hour private jeep expedition for up to 6 guests',
        priceInr: 2400,
      },
      {
        id: 'wtt-2',
        name: 'Full-Day Wayanad Waterfall & Lake Circuit',
        detail: 'Soochipara Falls, Pookode Lake, Lakkidi & Banasura Dam (8 hrs)',
        priceInr: 3800,
      },
    ],
    faqs: [
      {
        question: 'How many guests fit comfortably in one 4x4 safari jeep?',
        answer:
          'Each jeep seats up to 6 adults comfortably with forward- and side-facing padded seats.',
      },
    ],
  },
  {
    id: 'edakkal-explorers',
    name: 'Edakkal Explorers',
    services: 'Treks & cave visits',
    startingPriceInr: 1600,
    duration: 'Guided Morning Expedition',
    highlights: 'Edakkal Caves heritage walk, Phantom Rock & Ambalavayal museum',
    whatsappNumber: '919847303302',
    upiId: 'edakkalexplorers@okaxis',
    rating: 4.8,
    reviewCount: 192,
    offerBadge: 'Priority Morning Entry Guidance + Tea Break Included',
    primaryImage: '/src/assets/images/resort_edakkal_retreat_1795504231628.jpg',
    galleryImages: [
      '/src/assets/images/resort_edakkal_retreat_1795504231628.jpg',
      '/src/assets/images/wayanad_jeep_safari_1795505922349.jpg',
      '/src/assets/images/resort_coffee_estate_mananthavady_1795504231221.jpg',
      '/src/assets/images/hero_chembra_ridge_meppadi_1795504229570.jpg',
    ],
    description:
      'Led by certified Wayanad heritage naturalists, Edakkal Explorers curates small-group morning hikes up Ambukuthi Hill to decode the 6,000-year-old Neolithic petroglyphs alongside Phantom Rock and heritage spice gardens.',
    inclusions: [
      'Certified Heritage Trek Guide',
      'Ambukuthi Trail Storytelling',
      'Phantom Rock Sunset Stop',
      'Organic Spice Farm Walk',
    ],
    serviceItems: [
      {
        id: 'ee-1',
        name: 'Edakkal Neolithic Caves & Phantom Rock Walk',
        detail: 'Half-day guided heritage hike (8:00 AM – 12:30 PM)',
        priceInr: 1600,
      },
      {
        id: 'ee-2',
        name: 'Muthanga Dawn Safari + Edakkal Combo',
        detail: '6 AM wildlife safari pickup followed by cave heritage tour',
        priceInr: 3200,
      },
    ],
    faqs: [
      {
        question: 'Are Edakkal Caves entry tickets included in the tour?',
        answer:
          'We organize priority counter queuing at 8:45 AM; government entry passes are settled at actual counter tariff.',
      },
    ],
  },
  {
    id: 'green-route-travels',
    name: 'Green Route Travels',
    services: 'Taxi & day packages',
    startingPriceInr: 2200,
    duration: 'Full-day 8-hr Sightseeing Cab',
    highlights: 'Pookode Lake, Banasura Dam, Karlad Lake & Kozhikode drops',
    whatsappNumber: '919847303303',
    upiId: 'greenroute@okhdfcbank',
    rating: 4.9,
    reviewCount: 318,
    offerBadge: 'Zero Hidden Night-Halt Fee on 2+ Day Packages',
    primaryImage: '/src/assets/images/hero_chembra_ridge_meppadi_1795504229570.jpg',
    galleryImages: [
      '/src/assets/images/hero_chembra_ridge_meppadi_1795504229570.jpg',
      '/src/assets/images/wayanad_jeep_safari_1795505922349.jpg',
      '/src/assets/images/resort_banasura_villa_1795504229875.jpg',
      '/src/assets/images/hero_misty_woods_vythiri_1795504229144.jpg',
    ],
    description:
      'Reliable chauffeur-driven sedans and Innova Crysta SUVs based across Kalpetta and Vythiri for customizable Wayanad sightseeing circuits as well as Kozhikode Airport / Mysore station transfers.',
    inclusions: [
      'Clean AC Sedan or 7-Seater SUV',
      'Local Hill-Experienced Chauffeur',
      'Custom Sightseeing Stops',
      'Fuel & Driver Bata Included',
    ],
    serviceItems: [
      {
        id: 'grt-1',
        name: 'AC Sedan Full-Day Sightseeing (80 km / 8 hrs)',
        detail: 'Etios / Dzire for up to 4 guests across West & South Wayanad',
        priceInr: 2200,
      },
      {
        id: 'grt-2',
        name: 'Innova Crysta 7-Seater Wayanad Tour',
        detail: 'Spacious family SUV with luggage carrier & full-day itinerary',
        priceInr: 3400,
      },
    ],
    faqs: [
      {
        question: 'Do you provide early-morning Kozhikode Airport (CCJ) and Railway Station pickups?',
        answer:
          'Yes, 24/7 direct pickups from Kozhikode, Kannur, and Mysore are available with fixed upfront rates.',
      },
    ],
  },
  {
    id: 'banasura-adventure-co',
    name: 'Banasura Adventure Co.',
    services: 'Camping & trekking',
    startingPriceInr: 1850,
    duration: 'Sunset Trek & Ridge Camp',
    highlights: 'Guided Banasura hill trek, lakeside camp setup & sunrise coffee',
    whatsappNumber: '919847303304',
    upiId: 'banasuraadv@okicici',
    rating: 4.8,
    reviewCount: 167,
    offerBadge: 'Includes Evening Campfire Dinner & Sunrise Breakfast',
    primaryImage: '/src/assets/images/resort_kabini_thirunelli_1795504231797.jpg',
    galleryImages: [
      '/src/assets/images/resort_kabini_thirunelli_1795504231797.jpg',
      '/src/assets/images/resort_banasura_villa_1795504229875.jpg',
      '/src/assets/images/wayanad_jeep_safari_1795505922349.jpg',
      '/src/assets/images/resort_soochipara_glade_1795504232428.jpg',
    ],
    description:
      'Curated ridge-line tented camping, guided reservoir kayaking, and misty peak treks overlooking Banasura Sagar Dam—equipped with waterproof alpine tents, sleeping bags, campfire dinner, and trained trek marshals.',
    inclusions: [
      'Waterproof Alpine Tent & Sleeping Gear',
      'Guided Sunset Ridge Hike',
      'Campfire Dinner & Morning Breakfast',
      'First-Aid & Certified Trek Lead',
    ],
    serviceItems: [
      {
        id: 'bac-1',
        name: 'Banasura Ridge Guided Day Trek',
        detail: '4-hour scenic mountain hike with naturalist & tea refreshments',
        priceInr: 1150,
      },
      {
        id: 'bac-2',
        name: 'Overnight Lakeside Camp + Campfire Dinner',
        detail: 'Sunset walk, alpine tent stay, BBQ dinner & sunrise coffee',
        priceInr: 1850,
      },
    ],
    faqs: [
      {
        question: 'Are tents and sleeping bags sanitized and weather-protected for Wayanad mist?',
        answer:
          'All double-layer waterproof tents include thick foam mats, fresh inner liners, and clean sleeping bags.',
      },
    ],
  },
];

export const WAYANAD_EVENTS: EventTicketListing[] = [
  {
    id: 'poopoli-wayanad-flower-fest',
    name: 'Poopoli Wayanad Flower Fest',
    venue: 'RARS Ambalavayal Botanical Grounds',
    town: 'Sultan Bathery',
    regionFilter: 'Sultan Bathery',
    eventDates: 'Jan 01 – Jan 18 · Annual Agri-Floral Show',
    entryTime: '9:00 AM – 8:00 PM Daily',
    ticketPriceInr: 120,
    stallPriceInr: 4500,
    availableTickets: 480,
    availableStalls: 14,
    whatsappNumber: '919847404401',
    upiId: 'poopoliwayanad@okicici',
    rating: 4.9,
    reviewCount: 426,
    offerBadge: 'Skip-the-Line QR Entry Pass + Family Pack Savings',
    primaryImage: '/src/assets/images/wayanad_flower_festival_1795510838898.jpg',
    galleryImages: [
      '/src/assets/images/wayanad_flower_festival_1795510838898.jpg',
      '/src/assets/images/wayanad_night_carnival_1795510839515.jpg',
      '/src/assets/images/hero_chembra_ridge_meppadi_1795504229570.jpg',
      '/src/assets/images/resort_edakkal_retreat_1795504231628.jpg',
    ],
    description:
      'Wayanad’s signature international flower show in Ambalavayal featuring 12-acre orchid and marigold arches, spice pavilion exhibitions, organic nursery stalls, and evening folk performances.',
    highlights: [
      '12-Acre Botanical & Orchid Pavilions',
      'Instant Mobile QR Entry Gate',
      'Artisan Spice & Nursery Stalls Available',
      'Evening Music & Food Court',
    ],
    serviceItems: [
      {
        id: 'pop-1',
        name: 'Adult Full-Day Entry Ticket',
        detail: 'Access to all floral domes, orchid house & evening stage',
        priceInr: 120,
        passKind: 'Ticket',
        availableInventory: 480,
        slotTiming: '9:00 AM – 8:00 PM',
      },
      {
        id: 'pop-2',
        name: 'Family 4-Pack Priority Entry Pass',
        detail: '4 adult tickets + dedicated parking lane pass',
        priceInr: 420,
        passKind: 'Ticket',
        availableInventory: 95,
        slotTiming: 'All Day Priority Gate',
      },
      {
        id: 'pop-3',
        name: '10×10 ft Craft / Nursery Exhibitor Stall',
        detail: 'Covered pavilion stall with power point & 2 exhibitor badges',
        priceInr: 4500,
        passKind: 'Stall',
        availableInventory: 14,
        slotTiming: 'Full Event Week',
      },
    ],
    faqs: [
      {
        question: 'How do I receive my Poopoli entry ticket after WhatsApp or UPI booking?',
        answer:
          'You receive an instant digital pass directly on WhatsApp ready to scan at the Ambalavayal main gate.',
      },
      {
        question: 'Can local artisans or food vendors reserve exhibition stalls here?',
        answer:
          'Yes! Select the Exhibitor Stall pass above and message our event desk via WhatsApp or UPI to lock your stall slot.',
      },
    ],
  },
  {
    id: 'boche-fest-night-carnival',
    name: 'Boche Fest & Wayanad Night Carnival',
    venue: 'Vythiri–Meppadi Hilltop Arena',
    town: 'Meppadi',
    regionFilter: 'Meppadi',
    eventDates: 'Dec 20 – Jan 05 · Music, Lights & Food Expo',
    entryTime: '4:00 PM – 11:00 PM',
    ticketPriceInr: 299,
    stallPriceInr: 6500,
    availableTickets: 320,
    availableStalls: 9,
    whatsappNumber: '919847404402',
    upiId: 'bochefestwayanad@okaxis',
    rating: 4.8,
    reviewCount: 318,
    offerBadge: 'Early Bird Concert Pass + Complimentary Welcome Drink',
    primaryImage: '/src/assets/images/wayanad_night_carnival_1795510839515.jpg',
    galleryImages: [
      '/src/assets/images/wayanad_night_carnival_1795510839515.jpg',
      '/src/assets/images/wayanad_flower_festival_1795510838898.jpg',
      '/src/assets/images/wayanad_kerala_dining_1795505921235.jpg',
      '/src/assets/images/resort_soochipara_glade_1795504232428.jpg',
    ],
    description:
      'High-energy winter night carnival in Meppadi bringing together live Malabar bands, illuminated hill-top walkways, amusement rides, Malabar street-food stalls, and curated craft pop-ups.',
    highlights: [
      'Live Acoustic & DJ Stage Nights',
      '35+ Malabar Street Food Stalls',
      'Family Carnival & Kids Zone',
      'Direct Stall Booking for Vendors',
    ],
    serviceItems: [
      {
        id: 'boche-1',
        name: 'General Evening Carnival Pass',
        detail: 'Entry to illuminated festival grounds, stalls & live stage',
        priceInr: 299,
        passKind: 'Ticket',
        availableInventory: 320,
        slotTiming: '4:00 PM – 11:00 PM',
      },
      {
        id: 'boche-2',
        name: 'VIP Front-Row Concert + Food Voucher',
        detail: 'Priority stage deck + ₹250 festival food & chai credit',
        priceInr: 699,
        passKind: 'Ticket',
        availableInventory: 64,
        slotTiming: '6:30 PM – 11:00 PM',
      },
      {
        id: 'boche-3',
        name: 'Food / Pop-Up Brand Commercial Stall',
        detail: '12×10 ft lit timber kiosk along main food street (per weekend)',
        priceInr: 6500,
        passKind: 'Stall',
        availableInventory: 9,
        slotTiming: 'Weekend Expo Slot',
      },
    ],
    faqs: [
      {
        question: 'Is parking available near the Boche Fest hilltop arena?',
        answer:
          'Yes, dedicated shuttle-assisted parking bays are open from 3:30 PM right off the Meppadi–Kalpetta bypass.',
      },
    ],
  },
  {
    id: 'valliyurkavu-arattu-craft-expo',
    name: 'Valliyurkavu Arattu & Wayanad Craft Expo',
    venue: 'Valliyurkavu Temple Grounds, Mananthavady',
    town: 'Mananthavady',
    regionFilter: 'Mananthavady',
    eventDates: 'Mar 14 – Mar 28 · Heritage Fair & Cultural Nights',
    entryTime: '10:00 AM – 10:30 PM',
    ticketPriceInr: 100,
    stallPriceInr: 3200,
    availableTickets: 650,
    availableStalls: 18,
    whatsappNumber: '919847404403',
    upiId: 'valliyurkavuexpo@oksbi',
    rating: 4.9,
    reviewCount: 254,
    offerBadge: 'Cultural Seating Pass + Handloom Bazaar Access',
    primaryImage: '/src/assets/images/wayanad_night_carnival_1795510839515.jpg',
    galleryImages: [
      '/src/assets/images/wayanad_night_carnival_1795510839515.jpg',
      '/src/assets/images/resort_kabini_thirunelli_1795504231797.jpg',
      '/src/assets/images/wayanad_flower_festival_1795510838898.jpg',
      '/src/assets/images/resort_coffee_estate_mananthavady_1795504231221.jpg',
    ],
    description:
      'Mananthavady’s beloved 14-day heritage festival celebrating traditional Wayanad folk arts, Chenda Melam performances, bamboo handicraft markets, and authentic North Malabar festival cuisine.',
    highlights: [
      'Traditional Chenda Melam & Folk Arts',
      'Wayanad Bamboo & Handloom Bazaar',
      'Reserved Cultural Stage Seating',
      'Affordable Local Vendor Stalls',
    ],
    serviceItems: [
      {
        id: 'val-1',
        name: 'Cultural Gallery Reserved Seat Pass',
        detail: 'Guaranteed shaded seating for evening classical & folk stage',
        priceInr: 100,
        passKind: 'Ticket',
        availableInventory: 650,
        slotTiming: '6:00 PM – 10:00 PM',
      },
      {
        id: 'val-2',
        name: 'Artisan Craft & Handloom Fair Stall',
        detail: '8×8 ft covered market stall for local crafts & spice packs',
        priceInr: 3200,
        passKind: 'Stall',
        availableInventory: 18,
        slotTiming: 'Full 7-Day Cycle',
      },
    ],
    faqs: [
      {
        question: 'Is general temple courtyard darshan free?',
        answer:
          'Yes, temple entry is open to all. The ₹100 pass reserves front gallery seating for evening stage performances and cultural workshops.',
      },
    ],
  },
];

