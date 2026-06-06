// ============================================================================
// ADDITIVE DEMO TRIPS for a single existing account (default:
// wanderwarrior99@gmail.com). Adds a handful of realistic trips — contacts,
// itineraries, proposals and a couple of booked customers — to that user's
// agency so it looks lived-in for a client demo.
//
//   DRY RUN (no writes, just shows the target):
//     node --env-file=tripos-vercel.env scripts/seed-wanderwarrior-demo.mjs --dry
//   SEED:
//     node --env-file=tripos-vercel.env scripts/seed-wanderwarrior-demo.mjs
//
// SAFE BY DESIGN:
//   • Never deletes anything. Purely additive.
//   • Idempotent: if demo rows already exist (contacts @demo.tripos.local) it
//     stops without inserting duplicates.
//   • Touches ONLY the resolved agency. All demo rows are marked so they're
//     easy to find/remove later (contact email @demo.tripos.local, trip notes
//     contain "[demo-seed]").
// ============================================================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TARGET_EMAIL = (process.env.SEED_EMAIL || "wanderwarrior99@gmail.com")
  .trim()
  .toLowerCase();
const DRY = process.argv.includes("--dry");
const DEMO_DOMAIN = "@demo.tripos.local";
const DEMO_TAG = "[demo-seed]";

const today = new Date();
today.setHours(0, 0, 0, 0);
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(today.getTime() - n * DAY);
const daysFromNow = (n) => new Date(today.getTime() + n * DAY);
const yearsAgo = (n) =>
  new Date(today.getFullYear() - n, today.getMonth(), today.getDate());
let tokN = 0;
const tok = (p) => `${p}_demo_${Date.now().toString(36)}${(tokN++).toString(36)}`;

function price(items, markupPct, discountPct = 0) {
  const totalCost = items.reduce((s, it) => s + it.cost, 0);
  const markup = Math.round(totalCost * (markupPct / 100));
  const gross = totalCost + markup;
  const discount = Math.round(gross * (discountPct / 100));
  const sellingPrice = gross - discount;
  return { totalCost, sellingPrice, profit: sellingPrice - totalCost };
}

const UNS = "https://images.unsplash.com/";
const cover = {
  Bali: `${UNS}photo-1537996194471-e657df975ab4?w=1600&q=80`,
  Maldives: `${UNS}photo-1514282401047-d79a71a590e8?w=1600&q=80`,
  Rajasthan: `${UNS}photo-1599661046289-e31897846e41?w=1600&q=80`,
  Switzerland: `${UNS}photo-1530122037265-a5f1f91d3b99?w=1600&q=80`,
  Vietnam: `${UNS}photo-1528127269322-539801943592?w=1600&q=80`,
};
const day = (title, city, hotel, summary, activities = [], meals = { breakfast: true }, roomType = null) => ({
  title, city, hotel, roomType, summary, activities, meals,
});

// Polished itinerary content (mirrors the app's ItineraryContent shape).
const itineraries = {
  Bali: {
    summary:
      "Seven unhurried days across Bali's southern coast and the artistic heart of Ubud — heritage pavilions, a private waterfall breakfast, and slow evenings by the Indian Ocean.",
    coverImageUrl: cover.Bali,
    inclusions: ["6 nights in boutique villas with breakfast", "Private air-conditioned car with English-speaking driver", "Airport transfers", "Sunset dinner at Uluwatu", "All entrance fees on the itinerary"],
    exclusions: ["International flights", "Visa on arrival fees", "Lunches and dinners unless specified", "Personal expenses & spa treatments"],
    days: [
      day("Arrival in Bali · the southern coast", "Seminyak", "The Legian Seminyak", "Touch down in Denpasar where your driver waits with a cool towel and frangipani. Settle into an ocean-view suite and let the afternoon unwind with a barefoot walk along Seminyak beach as the sun melts into the Indian Ocean.", ["Private airport transfer & welcome", "Sunset at Seminyak beach"], { breakfast: true }, "Ocean Suite"),
      day("Uluwatu & the kecak fire dance", "Uluwatu", "The Legian Seminyak", "A leisurely morning by the pool gives way to an afternoon at the cliff-top Uluwatu temple, perched 70 metres above the surf. As dusk falls, the hypnotic kecak fire dance plays out against a burning sky.", ["Uluwatu temple visit", "Kecak fire dance at sunset", "Cliffside seafood dinner at Jimbaran"], { breakfast: true, dinner: true }),
      day("Into the hills — Ubud", "Ubud", "Tugu Bali", "Trade the coast for the green heart of the island. Check into a heritage pavilion hung with Balinese antiques, then wander Ubud's art markets and the Sacred Monkey Forest before a quiet riverside evening.", ["Drive to Ubud via Tanah Lot", "Sacred Monkey Forest Sanctuary", "Ubud art market"], { breakfast: true }, "Walter Spies Pavilion"),
      day("Rice terraces & a waterfall breakfast", "Ubud", "Tugu Bali", "Rise early for a private breakfast set beside the Tegenungan waterfall, then lose the morning among the emerald tiers of the Tegalalang rice terraces. The afternoon is yours — a spa ritual, perhaps, or simply the pool.", ["Private waterfall breakfast", "Tegalalang rice terraces", "Optional Balinese spa ritual"], { breakfast: true }),
      day("Mount Batur & hot springs", "Ubud", "Tugu Bali", "A gentle drive to the caldera of Mount Batur, with coffee overlooking the volcano, followed by a long soak in natural hot springs framed by the mountains. Evening at leisure in Ubud's lantern-lit lanes.", ["Mount Batur viewpoint & coffee", "Natural hot springs", "Free evening in Ubud"], { breakfast: true }),
      day("A free day in the green", "Ubud", "Tugu Bali", "An unscheduled day to travel at your own pace — cycle through the paddies, take a cooking class, or do gloriously little. Your driver is on call should the mood to explore strike.", [], { breakfast: true }),
      day("Farewell Bali", "Ubud", null, "A slow final breakfast among the frangipani before your private transfer to Denpasar, carrying home the quiet of the island.", ["Private airport transfer"], { breakfast: true }),
    ],
  },
  Maldives: {
    summary:
      "Five barefoot nights in an overwater villa — seaplane arrivals over turquoise lagoons, dawn dolphin cruises, and dinners under a canopy of stars.",
    coverImageUrl: cover.Maldives,
    inclusions: ["4 nights overwater villa with private pool", "All-inclusive dining plan", "Return seaplane transfers", "Sunset dolphin cruise", "Snorkelling equipment & house reef guiding"],
    exclusions: ["International flights to Malé", "Premium wines & champagne", "Spa treatments", "Scuba diving courses"],
    days: [
      day("Seaplane to the lagoon", "Baa Atoll", "Soneva Fushi", "A scenic seaplane skims over a mosaic of turquoise atolls before setting you down at your private island. Your barefoot butler shows you to an overwater villa where the lagoon laps just beneath the deck.", ["Seaplane transfer", "Overwater villa check-in", "Sunset on your private deck"], { breakfast: true, lunch: true, dinner: true }, "Overwater Villa with Pool"),
      day("The house reef", "Baa Atoll", "Soneva Fushi", "Slip straight from your deck into a kaleidoscope of coral and reef fish. An afternoon of nothing more strenuous than a hammock, then dinner at the over-water restaurant as the sky ignites.", ["Guided house-reef snorkelling", "Beach picnic", "Over-water dinner"], { breakfast: true, lunch: true, dinner: true }),
      day("Dolphins at dusk", "Baa Atoll", "Soneva Fushi", "A lazy morning gives way to a sunset dolphin cruise, where spinner pods arc through the golden water alongside the dhoni. Return for a private dinner on the sand.", ["Sunset dolphin cruise", "Private beach dinner"], { breakfast: true, lunch: true, dinner: true }),
      day("Stars & stillness", "Baa Atoll", "Soneva Fushi", "An unhurried day for the spa, the observatory, or simply the pool. The island's astronomer points out the southern constellations after dark.", ["Optional spa ritual", "Stargazing at the observatory"], { breakfast: true, lunch: true, dinner: true }),
      day("Farewell to the atoll", "Baa Atoll", null, "One last swim in the lagoon before the seaplane lifts you back over the reefs toward Malé.", ["Seaplane transfer to Malé"], { breakfast: true }),
    ],
  },
  Rajasthan: {
    summary:
      "A regal week through Rajasthan's lake city and blue city — palace hotels, vintage-car drives, and private dinners in the courtyards of forts.",
    coverImageUrl: cover.Rajasthan,
    inclusions: ["6 nights in heritage palace hotels", "Private chauffeured SUV throughout", "Expert local guides at each city", "Sunset boat ride on Lake Pichola", "Monument entrances"],
    exclusions: ["Flights", "Camera fees at monuments", "Lunches", "Gratuities"],
    days: [
      day("Arrival in Udaipur", "Udaipur", "The Oberoi Udaivilas", "Arrive in the city of lakes and step into a palace on the shores of Lake Pichola. The evening opens with a private boat ride past the floating Lake Palace as the ghats glow amber.", ["Private transfer", "Sunset boat ride on Lake Pichola"], { breakfast: true }, "Premier Lake-View Room"),
      day("The City Palace & old town", "Udaipur", "The Oberoi Udaivilas", "A morning with your guide through the sprawling City Palace and its mirrored halls, then the vintage-car museum and the artisan lanes of the old town.", ["City Palace tour", "Vintage & Classic Car Collection", "Old-town walk"], { breakfast: true }),
      day("Drive to Jodhpur", "Jodhpur", "RAAS Jodhpur", "A scenic drive to the blue city, arriving beneath the colossal Mehrangarh Fort. Settle into a boutique haveli with the fort floodlit above you at dusk.", ["Scenic drive to Jodhpur", "Evening at leisure beneath Mehrangarh"], { breakfast: true }, "Deluxe Suite"),
      day("Mehrangarh Fort", "Jodhpur", "RAAS Jodhpur", "Ascend to one of India's grandest forts for a guided morning among its palaces and ramparts, then lose yourself in the indigo lanes and the spice-scented Sardar Market.", ["Mehrangarh Fort tour", "Sardar Market & clock tower", "Blue-city lanes"], { breakfast: true }),
      day("Jaswant Thada & a free afternoon", "Jodhpur", "RAAS Jodhpur", "A quiet morning at the marble cenotaph of Jaswant Thada, then an open afternoon to shop for textiles or relax by the pool with the fort as your backdrop.", ["Jaswant Thada", "Free afternoon"], { breakfast: true }),
      day("Return to Udaipur", "Udaipur", "The Oberoi Udaivilas", "A leisurely drive back to Udaipur for a final palace night and a farewell dinner in a candle-lit courtyard.", ["Drive to Udaipur", "Farewell courtyard dinner"], { breakfast: true, dinner: true }),
      day("Departure", "Udaipur", null, "A last lakeside breakfast before your transfer to the airport.", ["Private airport transfer"], { breakfast: true }),
    ],
  },
  Switzerland: {
    summary:
      "Eight days through the Swiss Alps by panoramic rail — Lucerne's lake, the Jungfraujoch 'Top of Europe', the Glacier Express, and the Matterhorn at Zermatt.",
    coverImageUrl: cover.Switzerland,
    inclusions: ["7 nights in 4★ alpine hotels with breakfast", "Swiss Travel Pass (1st class)", "Jungfraujoch cogwheel railway", "Glacier Express seat reservation", "All rail & boat transfers"],
    exclusions: ["International flights", "Lunches & dinners", "Cable cars not listed", "Travel insurance"],
    days: [
      day("Arrive in Zürich · onward to Lucerne", "Lucerne", "Hotel des Balances", "Land in Zürich and glide by first-class rail to lakeside Lucerne. An evening stroll across the wooden Chapel Bridge sets the tone for the week.", ["First-class rail to Lucerne", "Chapel Bridge & old town walk"], { breakfast: true }),
      day("Mount Pilatus & lake cruise", "Lucerne", "Hotel des Balances", "The world's steepest cogwheel railway climbs Mount Pilatus for panoramic views, returning by aerial cableway and a gentle cruise across Lake Lucerne.", ["Mount Pilatus golden round-trip", "Lake Lucerne cruise"], { breakfast: true }),
      day("Into the Bernese Oberland", "Interlaken", "Victoria-Jungfrau Grand Hotel", "A scenic transfer to Interlaken, cradled between two alpine lakes. The afternoon is yours to wander or take in the Höhematte meadow with the Eiger beyond.", ["Scenic rail to Interlaken", "Höhematte & lakefront"], { breakfast: true }),
      day("Jungfraujoch — Top of Europe", "Interlaken", "Victoria-Jungfrau Grand Hotel", "The cogwheel railway climbs through tunnels in the Eiger to Europe's highest station at 3,454m — glaciers, an ice palace, and views deep into Italy.", ["Jungfraujoch cogwheel railway", "Ice Palace & Sphinx terrace"], { breakfast: true }),
      day("The Glacier Express", "Zermatt", "Hotel Mont Cervin Palace", "Board the famous Glacier Express for one of the world's great rail journeys — viaducts, gorges and alpine passes — arriving in car-free Zermatt beneath the Matterhorn.", ["Glacier Express panoramic journey", "Arrive car-free Zermatt"], { breakfast: true }),
      day("Gornergrat & the Matterhorn", "Zermatt", "Hotel Mont Cervin Palace", "A cogwheel ascent to Gornergrat opens a 360° amphitheatre of 29 peaks and glaciers, with the Matterhorn centre stage.", ["Gornergrat Bahn", "Matterhorn viewpoints"], { breakfast: true }),
      day("A free day in Zermatt", "Zermatt", "Hotel Mont Cervin Palace", "An open day to walk the high trails, ride a cable car, or relax in the village with the great peak watching over you.", [], { breakfast: true }),
      day("Departure via Zürich", "Zürich", null, "A scenic rail journey back to Zürich for your onward flight.", ["First-class rail to Zürich Airport"], { breakfast: true }),
    ],
  },
  Vietnam: {
    summary:
      "Nine days from the lanterns of Hoi An to an overnight cruise in Halong Bay — street-food walks, a private sampan, and the timber-and-tile beauty of old Hanoi.",
    coverImageUrl: cover.Vietnam,
    inclusions: ["8 nights in boutique hotels", "Overnight Halong Bay cruise (private balcony cabin)", "Private guides & transfers", "Hoi An street-food walk", "Domestic flights within Vietnam"],
    exclusions: ["International flights", "Vietnam e-visa", "Some lunches", "Drinks on the cruise"],
    days: [
      day("Arrive in Hanoi", "Hanoi", "Capella Hanoi", "Arrive in the capital and ease into the rhythm of the Old Quarter — timber shophouses, motorbike rivers, and a first bowl of phở at a corner stall.", ["Private transfer", "Old Quarter evening walk"], { breakfast: true }),
      day("Old Hanoi & street food", "Hanoi", "Capella Hanoi", "A guided morning through the Temple of Literature and Hoan Kiem Lake, then an evening street-food walk tasting bún chả, egg coffee and more.", ["Temple of Literature", "Hoan Kiem Lake", "Street-food walking tour"], { breakfast: true }),
      day("Halong Bay cruise", "Halong Bay", "Overnight Cruise", "Transfer to the coast and board a private-balcony cabin for an overnight cruise among Halong's limestone karsts — kayaking, a hidden grotto, and dinner on deck.", ["Board overnight cruise", "Kayaking among the karsts", "Sunset on deck"], { breakfast: true, lunch: true, dinner: true }, "Balcony Cabin"),
      day("Back to Hanoi · fly to Da Nang", "Hoi An", "Four Seasons The Nam Hai", "Tai chi at sunrise over the bay, then disembark and fly south to the beaches near Hoi An, checking into a villa by the sea.", ["Sunrise tai chi", "Flight to Da Nang", "Beach villa check-in"], { breakfast: true, lunch: true }, "Ocean-View Villa"),
      day("The lanterns of Hoi An", "Hoi An", "Four Seasons The Nam Hai", "An afternoon and evening in the UNESCO old town — tailors, the Japanese covered bridge, and the river aglow with thousands of silk lanterns after dark.", ["Hoi An old town & Japanese bridge", "Lantern-lit riverfront", "Sampan boat ride"], { breakfast: true }),
      day("A free beach day", "Hoi An", "Four Seasons The Nam Hai", "A day to do nothing in particular — the beach, the pool, a cooking class, or a cycle through the rice paddies.", [], { breakfast: true }),
      day("My Son Sanctuary", "Hoi An", "Four Seasons The Nam Hai", "A guided morning at the ancient Cham temples of My Son, set in a jungle valley, then a relaxed afternoon back at the resort.", ["My Son Sanctuary tour"], { breakfast: true }),
      day("Hoi An at leisure", "Hoi An", "Four Seasons The Nam Hai", "A final open day for last tailoring fittings and a quiet farewell dinner by the water.", ["Free day", "Farewell dinner"], { breakfast: true, dinner: true }),
      day("Departure", "Da Nang", null, "A relaxed final morning before your transfer to Da Nang airport.", ["Private airport transfer"], { breakfast: true }),
    ],
  },
};

// The demo trips. Mix of statuses so pipeline, customers and dashboard fill in.
const SPECS = [
  {
    name: "Aarav & Diya Kapoor", spouse: "Diya Kapoor", phone: "+91 98200 41122",
    destination: "Bali", source: "INSTAGRAM", adults: 2, days: 7, budget: 320000,
    travelType: "Honeymoon", hotelType: "Boutique luxury", startInDays: 34, createdAt: daysAgo(26),
    leadStatus: "WON", tripStatus: "BOOKED", quoteStatus: "ACCEPTED", markupPct: 22,
    bookedAt: daysAgo(12), advance: 96000, notes: "Honeymoon, mid-Nov. Loved the Ubud heritage stay.",
    items: [["HOTEL", "6 nights — Legian Seminyak + Tugu Bali (BB)", 168000], ["TRANSFER", "Private car + driver, 7 days", 38000], ["ACTIVITY", "Uluwatu, Mount Batur, waterfall breakfast", 31000], ["FLIGHT", "Return DEL–DPS (indicative)", 64000]],
  },
  {
    name: "Rohan & Sneha Iyer", spouse: "Sneha Iyer", phone: "+91 99300 55471",
    destination: "Maldives", source: "REFERRAL", adults: 2, days: 5, budget: 480000,
    travelType: "Anniversary", hotelType: "Overwater luxury", startInDays: 58, createdAt: daysAgo(8),
    leadStatus: "QUOTED", tripStatus: "QUOTED", quoteStatus: "SENT", markupPct: 20,
    notes: "10th anniversary. Comparing two resorts — wants overwater with pool.",
    items: [["HOTEL", "4 nights overwater villa, all-inclusive", 360000], ["TRANSFER", "Return seaplane transfers", 58000], ["ACTIVITY", "Sunset dolphin cruise + house-reef guiding", 22000]],
  },
  {
    name: "The Nair Family", phone: "+91 98450 90021",
    destination: "Rajasthan", source: "WEBSITE", adults: 2, children: [11, 14], days: 7, budget: 360000,
    travelType: "Family", hotelType: "Heritage palace", startInDays: 21, createdAt: daysAgo(30),
    leadStatus: "WON", tripStatus: "BOOKED", quoteStatus: "ACCEPTED", markupPct: 18,
    bookedAt: daysAgo(18), advance: 120000, notes: "Family of four, winter break. Palace hotels a must.",
    items: [["HOTEL", "6 nights heritage palace hotels", 246000], ["TRANSFER", "Private SUV + chauffeur, 7 days", 44000], ["GUIDE", "City guides — Udaipur & Jodhpur", 26000], ["ACTIVITY", "Lake Pichola boat ride + monuments", 18000]],
  },
  {
    name: "Vikram Sethi", phone: "+91 98730 33218",
    destination: "Switzerland", source: "GOOGLE", adults: 4, days: 8, budget: 1100000,
    travelType: "Family", hotelType: "4★ alpine", startInDays: 95, createdAt: daysAgo(5),
    leadStatus: "FOLLOW_UP", tripStatus: "QUOTED", quoteStatus: "SENT", markupPct: 16, followUp: 2,
    notes: "Summer Alps with two teens. Wants Glacier Express + Jungfraujoch.",
    items: [["HOTEL", "7 nights 4★ alpine hotels (BB)", 520000], ["TRANSPORT", "Swiss Travel Pass 1st class ×4", 196000], ["ACTIVITY", "Jungfraujoch + Glacier Express reservations", 142000]],
  },
  {
    name: "Ananya Bose", phone: "+91 98310 77640",
    destination: "Vietnam", source: "WHATSAPP", adults: 2, days: 9, budget: 240000,
    travelType: "Custom", hotelType: "Boutique", startInDays: 70, createdAt: daysAgo(3),
    leadStatus: "NEW", tripStatus: "PLANNING", quoteStatus: null, followUp: 1,
    notes: "Hanoi + Hoi An + Halong. Just enquired on WhatsApp; itinerary drafted.",
    items: null,
  },
];

async function main() {
  console.log(`\n→ Target user: ${TARGET_EMAIL}`);
  const user = await prisma.user.findUnique({
    where: { email: TARGET_EMAIL },
    select: { id: true, name: true, email: true },
  });
  if (!user) {
    console.error(`✗ No user found with email ${TARGET_EMAIL}. Aborting (nothing written).`);
    process.exit(1);
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, suspendedAt: null },
    orderBy: { createdAt: "asc" },
    include: { agency: { select: { id: true, name: true, slug: true } } },
  });
  if (!membership) {
    console.error(`✗ ${TARGET_EMAIL} has no agency membership. Aborting.`);
    process.exit(1);
  }
  const agencyId = membership.agency.id;
  const ownerId = user.id;

  const [existingTrips, existingContacts, existingDemo] = await Promise.all([
    prisma.trip.count({ where: { agencyId, deletedAt: null } }),
    prisma.contact.count({ where: { agencyId, deletedAt: null } }),
    prisma.contact.count({ where: { agencyId, email: { endsWith: DEMO_DOMAIN } } }),
  ]);

  console.log(`→ Agency:   ${membership.agency.name}  (slug: ${membership.agency.slug}, role: ${membership.role})`);
  console.log(`→ Current:  ${existingTrips} trips, ${existingContacts} contacts`);
  console.log(`→ Existing demo rows: ${existingDemo}`);

  if (existingDemo > 0) {
    console.log(`\n✓ Demo data already present (${existingDemo} demo contacts). Skipping — nothing written.`);
    await prisma.$disconnect();
    return;
  }

  if (DRY) {
    console.log(`\n[DRY RUN] Would add ${SPECS.length} contacts + trips (with itineraries/proposals/bookings). No writes made.`);
    await prisma.$disconnect();
    return;
  }

  console.log(`\nSeeding ${SPECS.length} demo trips into "${membership.agency.name}"…`);
  const made = { contacts: 0, trips: 0, itineraries: 0, quotes: 0, bookings: 0 };
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "");

  for (const spec of SPECS) {
    const email = `${slug(spec.name)}${DEMO_DOMAIN}`;
    const startDate = spec.startInDays != null ? daysFromNow(spec.startInDays) : undefined;
    const isCustomer = spec.leadStatus === "WON";

    const contact = await prisma.contact.create({
      data: {
        agencyId, ownerId,
        name: spec.name, phone: spec.phone, email,
        source: spec.source, status: spec.leadStatus,
        destination: spec.destination, adults: spec.adults,
        children: spec.children ?? undefined, budget: spec.budget,
        travelStartDate: startDate,
        travelEndDate: startDate ? daysFromNow(spec.startInDays + spec.days) : undefined,
        nextFollowUpAt: spec.followUp != null ? daysFromNow(spec.followUp) : undefined,
        convertedAt: isCustomer ? spec.bookedAt : undefined,
        preferences: { style: spec.travelType, hotels: spec.hotelType },
        notes: spec.notes,
        createdAt: spec.createdAt,
        travelers: {
          create: [
            { fullName: spec.name.split(/ & | and /)[0].trim(), relationship: "SELF", isPrimary: true, nationality: "Indian", dateOfBirth: yearsAgo(33), phone: spec.phone, email },
            ...(spec.spouse ? [{ fullName: spec.spouse, relationship: "SPOUSE", nationality: "Indian", dateOfBirth: yearsAgo(31) }] : []),
          ],
        },
      },
    });
    made.contacts++;

    const trip = await prisma.trip.create({
      data: {
        agencyId, ownerId, contactId: contact.id,
        destination: spec.destination, days: spec.days,
        travelers: spec.adults + (spec.children?.length ?? 0),
        startDate, budget: spec.budget,
        travelType: spec.travelType ?? "Luxury", pace: "Relaxed", hotelType: spec.hotelType ?? "Boutique",
        interests: ["sightseeing", "food", "leisure"],
        notes: `${DEMO_TAG} ${spec.notes ?? ""}`.trim(),
        status: spec.tripStatus, createdAt: spec.createdAt,
      },
    });
    made.trips++;

    const content = itineraries[spec.destination];
    if (content) {
      await prisma.itinerary.create({
        data: { tripId: trip.id, version: 1, label: `${spec.destination} — v1`, content, isActive: true, createdAt: spec.createdAt },
      });
      made.itineraries++;
    }

    if (spec.items && spec.quoteStatus) {
      const items = spec.items.map((it, i) => ({ category: it[0], label: it[1], cost: it[2], position: i }));
      const { totalCost, sellingPrice, profit } = price(items, spec.markupPct ?? 18, 0);
      const isProposal = spec.quoteStatus === "SENT" || spec.quoteStatus === "ACCEPTED";
      const quote = await prisma.quote.create({
        data: {
          tripId: trip.id, version: 1, label: "Initial proposal", status: spec.quoteStatus,
          markupPct: spec.markupPct ?? 18, discountPct: 0, totalCost, sellingPrice, profit,
          shareToken: isProposal ? tok("q") : null,
          internalNotes: "Demo proposal. Markup floor 12%.",
          createdAt: spec.createdAt, items: { create: items },
        },
      });
      made.quotes++;

      if (spec.quoteStatus === "ACCEPTED" && spec.bookedAt) {
        const paid = spec.advance ?? Math.round(sellingPrice * 0.3);
        const booking = await prisma.booking.create({
          data: {
            tripId: trip.id, quoteId: quote.id, status: "CONFIRMED",
            totalAmount: sellingPrice, paidAmount: paid, createdAt: spec.bookedAt,
            payments: { create: [{ type: "ADVANCE", amount: paid, method: "Razorpay", reference: tok("pay"), paidAt: spec.bookedAt }] },
          },
        });
        made.bookings++;
        void booking;
      }
    }
    console.log(`  ✓ ${spec.destination} — ${spec.name} (${spec.leadStatus})`);
  }

  console.log(`\n✓ Done. Added: ${made.contacts} contacts, ${made.trips} trips, ${made.itineraries} itineraries, ${made.quotes} proposals, ${made.bookings} bookings.`);
  console.log(`  All demo rows are marked (contact email ${DEMO_DOMAIN}, trip notes contain "${DEMO_TAG}").`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("✗ Seed failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
