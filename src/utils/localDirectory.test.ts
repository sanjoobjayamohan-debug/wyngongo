import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WAYANAD_BUDGET_HOTELS,
  WAYANAD_EVENTS,
  WAYANAD_RESTAURANTS,
  WAYANAD_TOUR_OPERATORS,
} from '../data/localDirectoryData';
import {
  buildBudgetHotelSummary,
  buildEventBookingSummary,
  buildRestaurantInquiryHref,
  buildTourBookingSummary,
  createServiceItemRecord,
  validatePartnerServiceInput,
} from './localDirectory';

test('sidebar datasets contain all requested restaurants, budget hotels, tour operators, and events with detail data', () => {
  assert.equal(WAYANAD_RESTAURANTS.length, 5);
  assert.equal(WAYANAD_BUDGET_HOTELS.length, 4);
  assert.equal(WAYANAD_TOUR_OPERATORS.length, 4);
  assert.ok(WAYANAD_EVENTS.length >= 3);
  assert.ok(WAYANAD_RESTAURANTS.every((r) => r.serviceItems.length >= 2 && r.faqs.length >= 1));
  assert.ok(WAYANAD_BUDGET_HOTELS.every((h) => h.serviceItems.length >= 2 && h.faqs.length >= 1));
  assert.ok(WAYANAD_TOUR_OPERATORS.every((t) => t.serviceItems.length >= 2 && t.faqs.length >= 1));
  assert.ok(WAYANAD_EVENTS.every((ev) => ev.serviceItems.length >= 2 && ev.faqs.length >= 1));
});

test('buildTourBookingSummary scales vehicle groups by 4 guests and builds WhatsApp URL', () => {
  const operator = WAYANAD_TOUR_OPERATORS[0]; // Wayanad Trails & Tours (₹2,400)
  const twoGuests = buildTourBookingSummary(operator, '2026-12-12', 2, 'Vythiri pickup');
  assert.equal(twoGuests.estimatedTotalInr, 2400);
  assert.match(twoGuests.whatsappText, /Wayanad Trails & Tours/);
  assert.match(twoGuests.whatsappText, /Vythiri pickup/);
  assert.ok(twoGuests.whatsappHref.startsWith('https://wa.me/'));

  const sixGuests = buildTourBookingSummary(operator, '2026-12-12', 6, '');
  assert.equal(sixGuests.estimatedTotalInr, 4800);
});

test('buildBudgetHotelSummary multiplies starting tariff by nights', () => {
  const hotel = WAYANAD_BUDGET_HOTELS[2]; // Kabani Traveller Rooms (₹1,100)
  const summary = buildBudgetHotelSummary(hotel, '2026-12-15', 3);
  assert.equal(summary.estimatedTotalInr, 3300);
  assert.match(summary.whatsappText, /Kabani Traveller Rooms/);
});

test('buildRestaurantInquiryHref generates valid WhatsApp link', () => {
  const href = buildRestaurantInquiryHref(WAYANAD_RESTAURANTS[1], '2026-12-15', 4, 'Lunch');
  assert.ok(href.startsWith('https://wa.me/919847101102?text='));
});

test('validatePartnerServiceInput rejects missing fields and createServiceItemRecord builds category record', () => {
  const invalid = validatePartnerServiceInput({
    category: 'restaurant',
    name: '',
    townOrLocation: 'Vythiri',
    headlineMetric: 450,
    secondaryTag: 'Malabar meals',
    secondaryMeta: '11 AM - 10 PM',
    description: 'Too short',
    whatsappNumber: '919847000000',
    upiId: 'test@okicici',
    imageUrl: '/src/assets/images/wayanad_kerala_dining_1795505921235.jpg',
    offerBadge: 'Free Tea',
    serviceItems: [],
  });
  assert.equal(invalid.valid, false);

  const validInput = {
    category: 'restaurant' as const,
    name: 'Spice Canopy Kitchen',
    townOrLocation: 'Vythiri',
    headlineMetric: 520,
    secondaryTag: 'Malabar meals',
    secondaryMeta: '11 AM - 10 PM',
    description: 'Authentic Vythiri spice kitchen serving fresh Kerala banana-leaf meals.',
    whatsappNumber: '919847000000',
    upiId: 'spice@okicici',
    imageUrl: '/src/assets/images/wayanad_kerala_dining_1795505921235.jpg',
    offerBadge: '10% Off Direct Lunch',
    serviceItems: [{ id: 'i-1', name: 'Kerala Sadya', detail: 'Full meal', priceInr: 240 }],
  };
  assert.equal(validatePartnerServiceInput(validInput).valid, true);
  const created = createServiceItemRecord(validInput, '101');
  assert.equal(created.kind, 'restaurant');
  if (created.kind === 'restaurant') {
    assert.equal(created.record.regionFilter, 'Vythiri');
    assert.equal(created.record.serviceItems.length, 1);
  }
});

test('createServiceItemRecord persists hotel A/C vs Non-A/C rooms, tour industry specs, and owner map pin', () => {
  const hotelCreated = createServiceItemRecord(
    {
      category: 'budget_hotel',
      name: 'Wayanad Crest Lodge',
      townOrLocation: 'Kalpetta',
      headlineMetric: 1200,
      secondaryTag: 'AC & Non-AC clean rooms',
      secondaryMeta: '24h Check-in',
      description: 'Comfortable budget rooms in Kalpetta with covered parking.',
      whatsappNumber: '919847000111',
      upiId: 'crest@okicici',
      imageUrl: '/src/assets/images/wayanad_budget_inn_1795505921732.jpg',
      offerBadge: 'Zero Fee',
      mapUrl: 'https://maps.google.com/?q=11.6102,76.0825',
      mapCoordinates: '11.6102, 76.0825',
      serviceItems: [
        { id: 'r1', name: 'Standard Non-AC Room', detail: 'Queen bed', priceInr: 1200, acType: 'Non-A/C', bedType: 'Queen Bed', maxGuests: 2 },
        { id: 'r2', name: 'Deluxe AC Room', detail: 'Split AC', priceInr: 1750, acType: 'A/C', bedType: 'King Bed', maxGuests: 3 },
      ],
    },
    '202'
  );
  assert.equal(hotelCreated.kind, 'budget_hotel');
  if (hotelCreated.kind === 'budget_hotel') {
    assert.equal(hotelCreated.record.mapUrl, 'https://maps.google.com/?q=11.6102,76.0825');
    assert.equal(hotelCreated.record.serviceItems[0].acType, 'Non-A/C');
    assert.equal(hotelCreated.record.serviceItems[1].acType, 'A/C');
  }

  const tourCreated = createServiceItemRecord(
    {
      category: 'tour',
      name: 'Banasura Safari Fleet',
      townOrLocation: 'Vythiri',
      headlineMetric: 2800,
      secondaryTag: '4x4 Off-Road Jeep Safari',
      secondaryMeta: '4 Hours',
      description: 'Guided 4x4 jeep tours across 900 Kandi and Banasura trails.',
      whatsappNumber: '919847000222',
      upiId: 'safari@okicici',
      imageUrl: '/src/assets/images/wayanad_jeep_safari_1795505922349.jpg',
      offerBadge: 'Free Pickup',
      tourCategory: '4x4 Off-Road Jeep Safari',
      tourVehicleType: 'Mahindra Thar 4x4 Jeep',
      tourSeatingCapacity: 6,
      tourCoveredSpots: ['900 Kandi Glass Bridge', 'Banasura Sagar Dam', 'Soochipara Waterfalls'],
      serviceItems: [
        {
          id: 't1',
          name: '900 Kandi Sunrise Jeep Ride',
          detail: 'Includes forest entry guidance',
          priceInr: 2800,
          vehicleType: 'Mahindra Thar 4x4 Jeep',
          seatingCapacity: 6,
          coveredSpots: ['900 Kandi Glass Bridge', 'Soochipara Waterfalls'],
        },
      ],
    },
    '303'
  );
  assert.equal(tourCreated.kind, 'tour');
  if (tourCreated.kind === 'tour') {
    assert.equal(tourCreated.record.vehicleType, 'Mahindra Thar 4x4 Jeep');
    assert.equal(tourCreated.record.seatingCapacity, 6);
    assert.equal(tourCreated.record.coveredSpots?.length, 3);
  }
});

test('buildEventBookingSummary calculates ticket vs stall totals and creates live event listing', () => {
  const poopoli = WAYANAD_EVENTS[0];
  const ticketBooking = buildEventBookingSummary(poopoli, '2026-12-20', 3, 'Ticket');
  assert.equal(ticketBooking.estimatedTotalInr, poopoli.ticketPriceInr * 3);
  assert.match(ticketBooking.whatsappText, /Wayngongo/);

  const stallBooking = buildEventBookingSummary(poopoli, '2026-12-20', 2, 'Stall', poopoli.stallPriceInr);
  assert.equal(stallBooking.estimatedTotalInr, (poopoli.stallPriceInr ?? 0) * 2);

  const createdEvent = createServiceItemRecord(
    {
      category: 'events',
      name: 'Wayanad Monsoon Food & Craft Fair',
      townOrLocation: 'Kalpetta',
      headlineMetric: 200,
      secondaryTag: 'Cultural Fest & Stalls',
      secondaryMeta: '10:00 AM – 9:30 PM',
      description: 'Three-day Wayanad culinary festival with 40 local craft stalls and folk music.',
      whatsappNumber: '919847055999',
      upiId: 'craftfair@okicici',
      imageUrl: '/src/assets/images/wayanad_flower_festival_1795510838898.jpg',
      offerBadge: 'Early Bird Entry ₹200',
      eventVenue: 'Kalpetta Stadium Grounds',
      eventDates: 'Dec 18 – Dec 21',
      eventEntryTime: '10:00 AM – 9:30 PM',
      availableTickets: 500,
      availableStalls: 20,
      stallPriceInr: 4500,
      serviceItems: [
        { id: 'ev-1', name: 'General Entry Pass', detail: 'Full day entry', priceInr: 200, passKind: 'Ticket', availableInventory: 500 },
      ],
    },
    '404'
  );
  assert.equal(createdEvent.kind, 'event');
  if (createdEvent.kind === 'event') {
    assert.equal(createdEvent.record.venue, 'Kalpetta Stadium Grounds');
    assert.equal(createdEvent.record.availableTickets, 500);
    assert.equal(createdEvent.record.availableStalls, 20);
  }
});
