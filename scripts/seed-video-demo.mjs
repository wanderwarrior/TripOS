// ============================================================================
// VIDEO DEMO SEED — a self-contained, login-able demo agency with realistic,
// high-grade data across the whole app: CRM pipeline, AI itineraries, branded
// proposals, quotes, bookings, GST invoices, operations, vendors, vouchers,
// WhatsApp threads and analytics. Built for recording product demo videos.
//
//   node --env-file=.env scripts/seed-video-demo.mjs
//
// Idempotent: re-running wipes this agency's data and reseeds it fresh, while
// keeping the login (user + agency + settings + subscription) stable. It only
// ever touches the demo agency below — your real data is never affected.
//
//   Login:  demo@saffronsea.app  /  Wanderlust@2026
// ============================================================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// --- account identity --------------------------------------------------------
const OWNER_EMAIL = "demo@saffronsea.app";
const OWNER_PASSWORD = "Wanderlust@2026";
const OWNER_NAME = "Aditi Rao";
const AGENCY_NAME = "Saffron & Sea";
const AGENCY_SLUG = "saffron-and-sea";
const LEGAL_NAME = "Saffron & Sea Voyages Pvt Ltd";
const GSTIN = "29AABCS1234F1Z5"; // Karnataka (29)
const STATE = "Karnataka";
const STATE_CODE = "29";

// --- date helpers ------------------------------------------------------------
const today = new Date();
today.setHours(0, 0, 0, 0);
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(today.getTime() - n * DAY);
const daysFromNow = (n) => new Date(today.getTime() + n * DAY);
const monthsAgo = (n) => {
  const d = new Date(today);
  d.setMonth(d.getMonth() - n);
  return d;
};
const yearsAgo = (n) =>
  new Date(today.getFullYear() - n, today.getMonth(), today.getDate());
const at = (date, h, m = 0) => {
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
};

// Indian fiscal year label for a date, e.g. 2026-05 -> "26-27".
function fyOf(date) {
  const y = date.getFullYear();
  const start = date.getMonth() >= 3 ? y : y - 1; // FY starts in April
  return `${String(start % 100).padStart(2, "0")}-${String((start + 1) % 100).padStart(2, "0")}`;
}

// Rough INR-in-words for invoice display (good enough for a demo).
function rupeesInWords(n) {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
    "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (x) => (x < 20 ? a[x] : `${b[Math.floor(x / 10)]}${x % 10 ? " " + a[x % 10] : ""}`);
  const three = (x) => (x >= 100 ? `${a[Math.floor(x / 100)]} Hundred${x % 100 ? " " + two(x % 100) : ""}` : two(x));
  let num = Math.round(n);
  if (num === 0) return "Zero Rupees Only";
  const crore = Math.floor(num / 10000000); num %= 10000000;
  const lakh = Math.floor(num / 100000); num %= 100000;
  const thousand = Math.floor(num / 1000); num %= 1000;
  const rest = num;
  let out = "";
  if (crore) out += `${three(crore)} Crore `;
  if (lakh) out += `${three(lakh)} Lakh `;
  if (thousand) out += `${three(thousand)} Thousand `;
  if (rest) out += three(rest);
  return `${out.trim()} Rupees Only`;
}

// computePricing mirror (from src/types) so quote totals are exact.
function price(items, markupPct, discountPct = 0) {
  const totalCost = items.reduce((s, i) => s + i.cost, 0);
  const markup = Math.round(totalCost * (markupPct / 100));
  const gross = totalCost + markup;
  const discount = Math.round(gross * (discountPct / 100));
  const sellingPrice = gross - discount;
  return { totalCost, sellingPrice, profit: sellingPrice - totalCost };
}

const tok = (p) => `${p}-${Math.random().toString(36).slice(2, 12)}`;

// ----------------------------------------------------------------------------
async function main() {
  console.log("→ Building the Saffron & Sea video-demo account…\n");

  // === 1. Owner user + agency + membership + PRO subscription ==============
  const hashedPassword = await bcrypt.hash(OWNER_PASSWORD, 10);
  const owner = await prisma.user.upsert({
    where: { email: OWNER_EMAIL },
    update: { name: OWNER_NAME, hashedPassword, emailVerified: new Date() },
    create: { email: OWNER_EMAIL, name: OWNER_NAME, hashedPassword, emailVerified: new Date() },
  });

  let agency = await prisma.agency.findUnique({ where: { slug: AGENCY_SLUG } });
  if (!agency) {
    agency = await prisma.agency.create({ data: { name: AGENCY_NAME, slug: AGENCY_SLUG } });
  } else {
    agency = await prisma.agency.update({ where: { id: agency.id }, data: { name: AGENCY_NAME } });
  }
  const agencyId = agency.id;

  await prisma.membership.upsert({
    where: { userId_agencyId: { userId: owner.id, agencyId } },
    update: { role: "OWNER", suspendedAt: null },
    create: { userId: owner.id, agencyId, role: "OWNER" },
  });

  // PRO + ACTIVE so Reports & WhatsApp automations are unlocked in the demo.
  await prisma.subscription.upsert({
    where: { agencyId },
    update: { plan: "PRO", status: "ACTIVE", trialEndsAt: null, currentPeriodEnd: daysFromNow(300) },
    create: { agencyId, plan: "PRO", status: "ACTIVE", currentPeriodEnd: daysFromNow(300) },
  });

  // === 2. Two staff agents (attribution for agent-performance analytics) ===
  async function ensureAgent(email, name, pwd) {
    const u = await prisma.user.upsert({
      where: { email },
      update: { name, hashedPassword: await bcrypt.hash(pwd, 10), emailVerified: new Date() },
      create: { email, name, hashedPassword: await bcrypt.hash(pwd, 10), emailVerified: new Date() },
    });
    await prisma.membership.upsert({
      where: { userId_agencyId: { userId: u.id, agencyId } },
      update: { role: "STAFF", suspendedAt: null },
      create: { userId: u.id, agencyId, role: "STAFF" },
    });
    return u;
  }
  const rohan = await ensureAgent("rohan@saffronsea.app", "Rohan Verma", "Wanderlust@2026");
  const ishita = await ensureAgent("ishita@saffronsea.app", "Ishita Menon", "Wanderlust@2026");
  const agents = [owner, rohan, ishita];
  console.log(`→ Team ready: ${OWNER_NAME} (Owner), Rohan Verma, Ishita Menon`);

  // === 3. Agency settings — full identity + premium proposal branding ======
  await prisma.agencySettings.upsert({
    where: { agencyId },
    update: {},
    create: { agencyId, legalName: LEGAL_NAME },
  });
  await prisma.agencySettings.update({
    where: { agencyId },
    data: {
      legalName: LEGAL_NAME,
      tradeName: AGENCY_NAME,
      gstin: GSTIN,
      pan: "AABCS1234F",
      addressLine1: "No. 14, Lavelle Road",
      addressLine2: "Off MG Road",
      city: "Bengaluru",
      state: STATE,
      stateCode: STATE_CODE,
      pincode: "560001",
      country: "India",
      phone: "+91 80 4123 7788",
      email: "hello@saffronsea.travel",
      website: "www.saffronsea.travel",
      authorizedSignatory: OWNER_NAME,
      signatoryDesignation: "Founder & Travel Director",
      invoicePrefix: "SS",
      defaultTaxScheme: "GST_5_NO_ITC",
      defaultTaxableBasis: "FULL_AMOUNT",
      defaultSacCode: "998555",
      defaultPlaceOfSupplyState: STATE,
      defaultPlaceOfSupplyStateCode: STATE_CODE,
      bankName: "HDFC Bank — Lavelle Road",
      bankAccountNumber: "50200071234567",
      bankIfscCode: "HDFC0000123",
      bankAccountHolder: LEGAL_NAME,
      invoiceTerms:
        "Payment due within 7 days of invoice. 50% advance confirms the booking; balance due 21 days before departure. Cancellations within 14 days of travel are non-refundable. GST @5% under the tour-operator scheme (no ITC).",
      invoiceNotes: "Thank you for travelling with Saffron & Sea.",
      // Premium proposal palette + brand voice (Ocean & Brass).
      proposalTheme: "classic",
      proposalAccentColor: "#C9A24B",
      proposalSurfaceColor: "#0E2A33",
      proposalTintColor: "#F4F2EC",
      proposalCoverStyle: "photo",
      proposalShowAtAGlance: true,
      proposalShowInclusions: true,
      proposalShowTerms: true,
      proposalTagline: "Bespoke journeys, beautifully run",
      proposalShowContactStrip: true,
      proposalShowRegisteredFooter: true,
      proposalSignatureNote:
        "It would be our privilege to craft this journey for you. Reply on WhatsApp and we'll hold your dates today.",
      proposalRepeatLogo: true,
      eInvoiceEnabled: false,
      eWayBillEnabled: false,
    },
  });
  console.log("→ Agency identity + proposal branding set");

  // === 4. Wipe this agency's prior demo data (keep account stable) =========
  await prisma.whatsappMessage.deleteMany({ where: { agencyId } });
  await prisma.invoice.deleteMany({ where: { agencyId } }); // restrict on booking → before trips
  await prisma.trip.deleteMany({ where: { agencyId } });    // cascades quotes/bookings/ops/assignments
  await prisma.contact.deleteMany({ where: { agencyId } }); // cascades travelers/activities/tasks
  await prisma.vendor.deleteMany({ where: { agencyId } });  // cascades vendor payments
  await prisma.invoiceCounter.deleteMany({ where: { agencyId } });
  await prisma.whatsappTemplate.deleteMany({ where: { agencyId } });
  console.log("→ Cleared prior demo data for this agency");

  // === 5. Vendors ==========================================================
  const V = {};
  const vendorSpecs = [
    { k: "tugu", name: "Tugu Bali", type: "HOTEL", city: "Canggu", country: "Indonesia", phone: "+62 361 731701", whatsapp: "6281237440011", email: "reservations@tuguhotels.com", isPreferred: true, paymentTerms: "30% on booking, 70% before check-in", gstNumber: null, notes: "Boutique heritage resort. 24–48h confirmation." },
    { k: "soneva", name: "Soneva Fushi Reservations", type: "HOTEL", city: "Baa Atoll", country: "Maldives", phone: "+960 660 0304", email: "reserve@soneva.com", isPreferred: true, paymentTerms: "50% advance, balance 30 days prior", notes: "Overwater villas, seaplane transfers, all-inclusive." },
    { k: "oberoi", name: "The Oberoi Udaivilas", type: "HOTEL", city: "Udaipur", state: "Rajasthan", country: "India", phone: "+91 294 243 3300", email: "reservations.udaivilas@oberoihotels.com", gstNumber: "08AAACE1234R1ZP", isPreferred: true, paymentTerms: "Full prepayment", notes: "Lake Pichola palace hotel. Premier lake-view rooms." },
    { k: "swissdmc", name: "Alpine Edge DMC", type: "DMC", city: "Interlaken", country: "Switzerland", phone: "+41 33 555 1212", whatsapp: "41795551212", email: "ops@alpineedge.example", isPreferred: true, paymentTerms: "Net 15", notes: "Swiss Travel Pass, Jungfraujoch, Glacier Express." },
    { k: "saigon", name: "Indochine Voyages", type: "DMC", city: "Hanoi", country: "Vietnam", phone: "+84 24 3555 7700", email: "book@indochinevoyages.example", paymentTerms: "40% advance", notes: "Halong cruise, Hoi An, private guides." },
    { k: "desert", name: "Desert Rose Transport", type: "TRANSPORT", city: "Dubai", country: "UAE", phone: "+971 4 555 8080", whatsapp: "971555558080", email: "fleet@desertrose.example", paymentTerms: "On invoice", notes: "Luxury fleet + desert safari transfers." },
    { k: "suresh", name: "Suresh Nair — Chauffeur", type: "DRIVER", city: "Kochi", state: "Kerala", country: "India", phone: "+91 98470 11111", whatsapp: "919847011111", isPreferred: true, paymentTerms: "On completion", notes: "12 yrs experience, English-speaking, Innova Crysta." },
    { k: "tenzin", name: "Tenzin Himalayan Guides", type: "GUIDE", city: "Thimphu", country: "Bhutan", phone: "+975 17 11 2233", whatsapp: "97517112233", email: "tenzin@himalayanguides.example", isPreferred: true, paymentTerms: "Prepaid", notes: "Licensed cultural + trekking guides." },
    { k: "bkk", name: "Siam Day Experiences", type: "ACTIVITY", city: "Bangkok", country: "Thailand", phone: "+66 2 555 4400", email: "hello@siamdays.example", paymentTerms: "Prepaid", notes: "Phi Phi, floating markets, temple tours." },
    { k: "spice", name: "Spice Coast Cruises", type: "HOTEL", city: "Alleppey", state: "Kerala", country: "India", phone: "+91 477 224 1133", whatsapp: "919847012345", email: "bookings@spicecoast.example", paymentTerms: "100% on confirmation", notes: "Heritage houseboats. Confirms within 4h on WhatsApp." },
  ];
  for (const v of vendorSpecs) {
    const { k, ...rest } = v;
    V[k] = await prisma.vendor.create({ data: { agencyId, isActive: true, ...rest } });
  }
  console.log(`→ Created ${vendorSpecs.length} vendors`);

  // === 6. Itinerary content builders =======================================
  const UNS = "https://images.unsplash.com/";
  const cover = {
    Bali: `${UNS}photo-1537996194471-e657df975ab4?w=1600&q=80`,
    Maldives: `${UNS}photo-1514282401047-d79a71a590e8?w=1600&q=80`,
    Rajasthan: `${UNS}photo-1599661046289-e31897846e41?w=1600&q=80`,
    Switzerland: `${UNS}photo-1530122037265-a5f1f91d3b99?w=1600&q=80`,
    Vietnam: `${UNS}photo-1528127269322-539801943592?w=1600&q=80`,
    Dubai: `${UNS}photo-1512453979798-5ea266f8880c?w=1600&q=80`,
    Kerala: `${UNS}photo-1602216056096-3b40cc0c9944?w=1600&q=80`,
    Bhutan: `${UNS}photo-1553856622-d1b352e9a211?w=1600&q=80`,
  };
  const day = (title, city, hotel, summary, activities = [], meals = { breakfast: true }, roomType = null) => ({
    title, city, hotel, roomType, summary, activities, meals,
  });

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
        "Five barefoot nights in an overwater villa at Soneva Fushi — seaplane arrivals over turquoise lagoons, dawn dolphin cruises, and dinners under a canopy of stars.",
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
        day("Sunrise & back to Hanoi · fly to Da Nang", "Hoi An", "Four Seasons The Nam Hai", "Tai chi at sunrise over the bay, then disembark and fly south to the beaches near Hoi An, checking into a villa by the sea.", ["Sunrise tai chi", "Flight to Da Nang", "Beach villa check-in"], { breakfast: true, lunch: true }, "Ocean-View Villa"),
        day("The lanterns of Hoi An", "Hoi An", "Four Seasons The Nam Hai", "An afternoon and evening in the UNESCO old town — tailors, the Japanese covered bridge, and the river aglow with thousands of silk lanterns after dark.", ["Hoi An old town & Japanese bridge", "Lantern-lit riverfront", "Sampan boat ride"], { breakfast: true }),
        day("A free beach day", "Hoi An", "Four Seasons The Nam Hai", "A day to do nothing in particular — the beach, the pool, a cooking class, or a cycle through the rice paddies.", [], { breakfast: true }),
        day("My Son Sanctuary", "Hoi An", "Four Seasons The Nam Hai", "A guided morning at the ancient Cham temples of My Son, set in a jungle valley, then a relaxed afternoon back at the resort.", ["My Son Sanctuary tour"], { breakfast: true }),
        day("Hoi An at leisure", "Hoi An", "Four Seasons The Nam Hai", "A final open day for last tailoring fittings and a quiet farewell dinner by the water.", ["Free day", "Farewell dinner"], { breakfast: true, dinner: true }),
        day("Departure", "Da Nang", null, "Private transfer to Da Nang airport for your onward journey.", ["Private airport transfer"], { breakfast: true }),
      ],
    },
    Dubai: {
      summary:
        "Five dazzling days in Dubai — the world's tallest tower, a private desert safari, the gold and spice souks, and a day at the waterparks for the family.",
      coverImageUrl: cover.Dubai,
      inclusions: ["4 nights 5★ hotel with breakfast", "Burj Khalifa 'At the Top' tickets", "Private desert safari with dinner", "Dubai city tour with guide", "All private transfers"],
      exclusions: ["Flights", "UAE visa", "Lunches", "Theme-park tickets unless specified"],
      days: [
        day("Arrival in Dubai", "Dubai", "Atlantis The Palm", "Arrive and transfer to your resort on the Palm. The evening is for the beach and the glittering skyline across the water.", ["Private transfer", "Beach evening"], { breakfast: true }, "Ocean Deluxe Room"),
        day("Old Dubai & the souks", "Dubai", "Atlantis The Palm", "A guided morning through old Dubai — an abra across the creek, the gold and spice souks, and the Al Fahidi heritage quarter.", ["Abra creek crossing", "Gold & spice souks", "Al Fahidi quarter"], { breakfast: true }),
        day("Burj Khalifa & the fountains", "Dubai", "Atlantis The Palm", "Ascend the Burj Khalifa for the city at your feet, explore Dubai Mall, and end at the dancing fountains after dark.", ["Burj Khalifa At the Top", "Dubai Mall", "Dubai Fountain show"], { breakfast: true }),
        day("Private desert safari", "Dubai", "Atlantis The Palm", "An afternoon dune drive into the desert, with camels at golden hour and a candle-lit dinner under the stars at a private camp.", ["Dune drive & camels", "Desert camp dinner"], { breakfast: true, dinner: true }),
        day("Departure", "Dubai", null, "A relaxed morning before your private transfer to the airport.", ["Private airport transfer"], { breakfast: true }),
      ],
    },
    Kerala: {
      summary:
        "Eight gentle days through Kerala — Munnar's tea hills, a Periyar spice trail, a night aboard a private houseboat, and the calm of Marari beach.",
      coverImageUrl: cover.Kerala,
      inclusions: ["7 nights (hotels + 1 night houseboat) with breakfast", "Private car with chauffeur", "Full-board houseboat", "Spice-plantation walk", "Kathakali performance"],
      exclusions: ["Flights", "Lunches & dinners on land", "Ayurveda treatments", "Gratuities"],
      days: [
        day("Arrive in Kochi", "Kochi", "Brunton Boatyard", "Arrive in historic Fort Kochi — Chinese fishing nets, colonial lanes, and a sea-facing heritage hotel. Evening Kathakali performance.", ["Fort Kochi walk", "Chinese fishing nets", "Kathakali performance"], { breakfast: true }),
        day("Up to the tea hills of Munnar", "Munnar", "Tea trails — Windermere", "A scenic climb into the Western Ghats, the road lined with waterfalls and endless tea gardens.", ["Drive to Munnar", "Tea-garden viewpoints"], { breakfast: true }),
        day("Tea estates & misty trails", "Munnar", "Tea trails — Windermere", "A morning at a working tea estate and factory, then a gentle walk through the hills with valley views.", ["Tea estate & factory tour", "Hill walk"], { breakfast: true }),
        day("Periyar & the spice trail", "Thekkady", "Spice Village", "On to Thekkady and the Periyar reserve — a spice-plantation walk and an optional boat safari on the lake.", ["Drive to Thekkady", "Spice-plantation walk", "Periyar lake (optional)"], { breakfast: true }),
        day("Down to the backwaters", "Alleppey", "Spice Coast Cruises (houseboat)", "Descend to Alleppey and board a private houseboat to drift through the palm-fringed backwaters, all meals aboard.", ["Board private houseboat", "Backwater cruising"], { breakfast: true, lunch: true, dinner: true }, "AC Houseboat"),
        day("Marari beach", "Mararikulam", "Marari Beach Resort", "Disembark and unwind at a tranquil beach resort — hammocks, ayurveda, and the Arabian Sea.", ["Transfer to Marari", "Beach at leisure"], { breakfast: true }),
        day("A free day by the sea", "Mararikulam", "Marari Beach Resort", "An open day for ayurveda, the pool, or simply the beach.", [], { breakfast: true }),
        day("Departure from Kochi", "Kochi", null, "A coastal drive back to Kochi for your departure.", ["Drive to Kochi airport"], { breakfast: true }),
      ],
    },
    Bhutan: {
      summary:
        "Six days in the Land of the Thunder Dragon — Thimphu's dzongs, the Punakha valley, and the cliff-side Tiger's Nest monastery.",
      coverImageUrl: cover.Bhutan,
      inclusions: ["5 nights in 4★ hotels", "Licensed guide & private vehicle", "All monument fees & permits", "Sustainable Development Fee", "All meals"],
      exclusions: ["Flights to Paro", "Travel insurance", "Personal expenses", "Tips"],
      days: [
        day("Fly into Paro · drive to Thimphu", "Thimphu", "Le Méridien Thimphu", "One of the world's most dramatic landings at Paro, then a scenic drive to the capital, Thimphu.", ["Scenic transfer to Thimphu", "Tashichho Dzong"], { breakfast: true, lunch: true, dinner: true }),
        day("Thimphu sights", "Thimphu", "Le Méridien Thimphu", "The giant Buddha Dordenma, a paper-making workshop, and the weekend market.", ["Buddha Dordenma", "Folk Heritage Museum", "Local market"], { breakfast: true, lunch: true, dinner: true }),
        day("Over the Dochula pass to Punakha", "Punakha", "Six Senses Punakha", "Cross the prayer-flag-draped Dochula pass to the warm Punakha valley and its majestic riverside dzong.", ["Dochula pass", "Punakha Dzong", "Suspension bridge walk"], { breakfast: true, lunch: true, dinner: true }),
        day("Punakha valley", "Punakha", "Six Senses Punakha", "A gentle valley walk to Chimi Lhakhang through terraced fields.", ["Chimi Lhakhang walk", "Valley at leisure"], { breakfast: true, lunch: true, dinner: true }),
        day("Tiger's Nest — Taktsang", "Paro", "Zhiwa Ling Heritage", "The pilgrimage of a lifetime — a hike to the Tiger's Nest monastery clinging to a cliff 900m above the valley.", ["Tiger's Nest (Taktsang) hike", "Paro town evening"], { breakfast: true, lunch: true, dinner: true }),
        day("Departure from Paro", "Paro", null, "A farewell breakfast before your flight out of Paro.", ["Transfer to Paro airport"], { breakfast: true }),
      ],
    },
  };

  // === 7. Helper to create a contact (+ primary traveller) =================
  let created = { contacts: 0, trips: 0, quotes: 0, proposals: 0, bookings: 0, invoices: 0, assignments: 0, vouchers: 0, tasks: 0, vpayments: 0, wa: 0, activities: 0 };
  const fySeq = new Map(); // fiscalYear -> last sequence

  function nextInvoiceNumber(date) {
    const fy = fyOf(date);
    const seq = (fySeq.get(fy) ?? 0) + 1;
    fySeq.set(fy, seq);
    return { fy, seq, number: `SS/${fy}/${String(seq).padStart(4, "0")}` };
  }

  async function makeContact(spec) {
    const ownerId = agents[spec.owner].id;
    const c = await prisma.contact.create({
      data: {
        agencyId,
        ownerId,
        name: spec.name,
        phone: spec.phone,
        email: spec.email,
        source: spec.source,
        status: spec.status,
        destination: spec.destination,
        adults: spec.adults,
        children: spec.children ?? undefined,
        budget: spec.budget,
        travelStartDate: spec.startInDays != null ? daysFromNow(spec.startInDays) : undefined,
        travelEndDate: spec.startInDays != null ? daysFromNow(spec.startInDays + (spec.days ?? 6)) : undefined,
        nextFollowUpAt: spec.followUp != null ? daysFromNow(spec.followUp) : undefined,
        anniversary: spec.anniversary ?? undefined,
        lostReason: spec.lostReason ?? undefined,
        convertedAt: spec.status === "WON" ? spec.bookedAt : undefined,
        preferences: { style: spec.travelType ?? spec.destination, dietary: spec.dietary ?? null, hotels: spec.hotelType ?? "Boutique / luxury" },
        notes: spec.notes,
        gstin: spec.gstin ?? undefined,
        billingName: spec.billingName ?? undefined,
        billingAddress: spec.billingAddress ?? undefined,
        billingCity: spec.billingCity ?? undefined,
        billingState: spec.billingState ?? undefined,
        billingStateCode: spec.billingStateCode ?? undefined,
        billingPincode: spec.billingPincode ?? undefined,
        createdAt: spec.createdAt ?? daysAgo(20),
        travelers: {
          create: [
            {
              fullName: spec.name.replace(/ (Family|Group|Corporate|& Co\.|Co\.)$/i, "").split(/ & | and /)[0].trim(),
              relationship: "SELF",
              isPrimary: true,
              nationality: "Indian",
              dateOfBirth: yearsAgo(34),
              passportNumber: spec.passport ?? undefined,
              passportExpiry: spec.passport ? daysFromNow(900) : undefined,
              passportIssueCountry: spec.passport ? "India" : undefined,
              dietary: spec.dietary ?? undefined,
              phone: spec.phone,
              email: spec.email,
            },
            ...(spec.spouse
              ? [{ fullName: spec.spouse, relationship: "SPOUSE", nationality: "Indian", dateOfBirth: yearsAgo(32), passportNumber: spec.passport ? "Z" + Math.floor(1e6 + Math.random() * 8e6) : undefined, passportExpiry: spec.passport ? daysFromNow(820) : undefined, passportIssueCountry: spec.passport ? "India" : undefined }]
              : []),
          ],
        },
      },
    });
    created.contacts++;
    return { contact: c, ownerId };
  }

  async function makeTripWithItinerary(contact, ownerId, spec) {
    const trip = await prisma.trip.create({
      data: {
        agencyId,
        ownerId,
        contactId: contact.id,
        destination: spec.destination,
        days: spec.days,
        travelers: spec.adults + (spec.children?.length ?? 0),
        startDate: spec.startInDays != null ? daysFromNow(spec.startInDays) : undefined,
        budget: spec.budget,
        travelType: spec.travelType ?? "Luxury",
        pace: spec.pace ?? "Relaxed",
        hotelType: spec.hotelType ?? "Boutique",
        interests: spec.interests ?? ["sightseeing", "food", "leisure"],
        notes: spec.tripNotes ?? null,
        status: spec.tripStatus,
        createdAt: spec.createdAt ?? daysAgo(20),
      },
    });
    created.trips++;
    const content = itineraries[spec.destination];
    if (content) {
      await prisma.itinerary.create({
        data: { tripId: trip.id, version: 1, label: `${spec.destination} — v1`, content, isActive: true, createdAt: spec.createdAt ?? daysAgo(20) },
      });
    }
    return trip;
  }

  async function makeQuote(trip, spec) {
    const items = spec.items.map((it, i) => ({ category: it[0], label: it[1], cost: it[2], position: i }));
    const { totalCost, sellingPrice, profit } = price(items, spec.markupPct ?? 18, spec.discountPct ?? 0);
    const isProposal = spec.quoteStatus === "SENT" || spec.quoteStatus === "ACCEPTED";
    const quote = await prisma.quote.create({
      data: {
        tripId: trip.id,
        version: 1,
        label: "Initial proposal",
        status: spec.quoteStatus,
        markupPct: spec.markupPct ?? 18,
        discountPct: spec.discountPct ?? 0,
        totalCost,
        sellingPrice,
        profit,
        shareToken: isProposal ? tok("q") : null,
        internalNotes: spec.internalNotes ?? "Markup floor 12%. Rates confirmed with vendors.",
        createdAt: spec.createdAt ?? daysAgo(20),
        items: { create: items },
      },
    });
    created.quotes++;
    if (isProposal) created.proposals++;
    return { quote, totalCost, sellingPrice, profit };
  }

  // === 8. The data — leads, live proposals, won deals ======================
  const KA = { billingState: "Karnataka", billingStateCode: "29", billingCity: "Bengaluru", billingPincode: "560001" };
  const MH = { billingState: "Maharashtra", billingStateCode: "27", billingCity: "Mumbai", billingPincode: "400050" };

  // --- 8a. Top-of-funnel leads (no quote / planning) -----------------------
  const leads = [
    { name: "Meera Krishnan", phone: "+91 98860 11009", email: "meera.k@example.in", source: "WEBSITE", status: "NEW", destination: "Singapore", adults: 3, children: [7, 9], budget: 290000, owner: 1, followUp: 1, createdAt: daysAgo(2), notes: "Universal Studios + Sentosa over school holidays. Sent intro on WhatsApp." },
    { name: "Tara Menon", phone: "+91 98861 11017", email: "tara.menon@example.in", source: "INSTAGRAM", status: "NEW", destination: "Japan", adults: 2, budget: 520000, owner: 2, followUp: 1, createdAt: daysAgo(3), notes: "Cherry-blossom season, flexible dates. Found us on an Instagram reel." },
    { name: "Sneha Reddy", phone: "+91 98862 11006", email: "sneha.reddy@example.in", source: "INSTAGRAM", status: "CONTACTED", destination: "Dubai", adults: 2, children: [5], budget: 230000, owner: 1, followUp: 2, createdAt: daysAgo(6), notes: "First international trip with a toddler. Wants desert safari + waterparks." },
    { name: "Gupta Family", phone: "+91 98863 11008", email: "rajeev.gupta@example.in", source: "REFERRAL", status: "REQUIREMENT_UNDERSTOOD", destination: "Rajasthan", adults: 4, children: [10], budget: 260000, owner: 0, followUp: 3, createdAt: daysAgo(9), notes: "Heritage palaces — Udaipur + Jodhpur. Referred by the Iyers.", tripStatus: "PLANNING", days: 7 },
    { name: "Sandeep Rao", phone: "+91 98864 11014", email: "sandeep.rao@example.in", source: "GOOGLE", status: "CONTACTED", destination: "Kerala", adults: 5, budget: 240000, owner: 2, followUp: 4, createdAt: daysAgo(5), notes: "Multi-gen family trip. Wants houseboat + Munnar." },
    { name: "Aditya & Nupur", spouse: "Nupur", phone: "+91 98865 11021", email: "aditya.nupur@example.in", source: "INSTAGRAM", status: "REQUIREMENT_UNDERSTOOD", destination: "Vietnam", adults: 2, budget: 300000, owner: 1, followUp: 2, createdAt: daysAgo(8), notes: "Honeymoon. Loves the Halong cruise idea.", tripStatus: "PLANNING", days: 9 },
    { name: "Kapoor Group", phone: "+91 98866 11022", email: "vikas.kapoor@example.in", source: "REFERRAL", status: "CONTACTED", destination: "Bhutan", adults: 6, budget: 540000, owner: 0, followUp: 5, createdAt: daysAgo(7), notes: "Group of friends, cultural + Tiger's Nest hike." },
    { name: "Lakshmi Iyer", phone: "+91 98867 11023", email: "lakshmi.iyer@example.in", source: "WHATSAPP", status: "NEW", destination: "Maldives", adults: 2, budget: 450000, owner: 2, followUp: 1, createdAt: daysAgo(1), notes: "Anniversary trip enquiry over WhatsApp. Wants overwater villa." },
  ];

  // --- 8b. Live proposals (quote SENT, shareable) --------------------------
  const proposals = [
    { name: "Priya & Aakash Nair", spouse: "Aakash Nair", phone: "+91 98870 11003", email: "priya.nair@example.in", source: "WEBSITE", status: "QUOTED", destination: "Maldives", adults: 2, budget: 460000, owner: 0, followUp: 2, createdAt: daysAgo(4), passport: "M1234567", anniversary: yearsAgo(4), travelType: "Honeymoon", days: 5, pace: "Relaxed", hotelType: "Resort", interests: ["beaches", "snorkelling", "spa"], startInDays: 48, tripStatus: "QUOTED", notes: "Anniversary, overwater villa, all-inclusive. Comparing us with one OTA.", quoteStatus: "SENT", markupPct: 20,
      items: [["Hotel", "Soneva Fushi — 4 nights overwater villa w/ pool (AI)", 312000], ["Flights", "BLR–MLE return (business class, 2 pax)", 86000], ["Transport", "Return seaplane transfers", 24000], ["Activities", "Sunset dolphin cruise + house-reef guiding", 12000]] },
    { name: "Karan Malhotra", phone: "+91 98871 11004", email: "karan.m@example.in", source: "WHATSAPP", status: "FOLLOW_UP", destination: "Switzerland", adults: 2, budget: 560000, owner: 1, followUp: 3, createdAt: daysAgo(11), passport: "K7654321", travelType: "Honeymoon", days: 8, pace: "Moderate", hotelType: "4-star", interests: ["mountains", "rail", "scenery"], startInDays: 70, tripStatus: "QUOTED", notes: "Wants Jungfraujoch + Glacier Express. Asked us to hold pending leave approval.", quoteStatus: "SENT", markupPct: 16,
      items: [["Hotel", "7 nights 4★ alpine hotels (BB)", 322000], ["Transport", "Swiss Travel Pass 1st class + Jungfraujoch + Glacier Express", 118000], ["Flights", "BLR–ZRH return (2 pax)", 96000], ["Activities", "Mt Pilatus golden round-trip + Gornergrat", 18000]] },
    { name: "Fatima & Imran Sheikh", spouse: "Imran Sheikh", phone: "+91 98872 11011", email: "fatima.imran@example.in", source: "INSTAGRAM", status: "QUOTED", destination: "Vietnam", adults: 2, budget: 340000, owner: 2, followUp: 2, createdAt: daysAgo(6), passport: "F9988776", travelType: "Couple", days: 9, pace: "Moderate", hotelType: "Boutique", interests: ["culture", "food", "beaches"], startInDays: 55, tripStatus: "QUOTED", notes: "Loved Hoi An lanterns + Halong cruise. Quote sent, opened twice.", quoteStatus: "SENT", markupPct: 19,
      items: [["Hotel", "8 nights boutique + 1 night Halong cruise", 196000], ["Flights", "BLR–HAN return + internal HAN–DAD (2 pax)", 78000], ["Transport", "Private guides & transfers", 26000], ["Activities", "Street-food walk, My Son, sampan", 14000]] },
    { name: "Harish Patel", phone: "+91 98873 11018", email: "harish.patel@example.in", source: "GOOGLE", status: "FOLLOW_UP", destination: "Dubai", adults: 2, children: [6, 11], budget: 380000, owner: 0, followUp: 4, createdAt: daysAgo(13), travelType: "Family", days: 5, pace: "Moderate", hotelType: "5-star", interests: ["family", "theme parks", "city"], startInDays: 62, tripStatus: "QUOTED", notes: "Family of four. Comparing Atlantis vs Jumeirah. Leaning Atlantis.", quoteStatus: "SENT", markupPct: 17, ...MH, billingName: "Harish Patel",
      items: [["Hotel", "Atlantis The Palm — 4 nights (BB)", 210000], ["Flights", "BOM–DXB return (4 pax)", 96000], ["Transport", "Private transfers + desert safari", 22000], ["Activities", "Burj Khalifa + Aquaventure passes", 28000]] },
    { name: "Joshi Family", phone: "+91 98874 11016", email: "manish.joshi@example.in", source: "REFERRAL", status: "QUOTED", destination: "Switzerland", adults: 2, children: [14, 16], budget: 720000, owner: 1, followUp: 3, createdAt: daysAgo(9), travelType: "Family", days: 8, pace: "Moderate", hotelType: "4-star", interests: ["mountains", "rail"], startInDays: 95, tripStatus: "QUOTED", notes: "Multi-city Europe with teens. Switzerland leg quoted first.", quoteStatus: "SENT", markupPct: 15,
      items: [["Hotel", "7 nights family rooms 4★ (BB)", 388000], ["Transport", "Swiss Travel Pass + Jungfraujoch + Glacier Express", 196000], ["Flights", "BLR–ZRH return (4 pax)", 188000]] },
  ];

  // --- 8c. Won deals (booking + invoice + ops), spread across months -------
  const won = [
    { name: "Aanya & Rohan Sharma", spouse: "Rohan Sharma", phone: "+91 98880 11001", email: "aanya.sharma@example.in", source: "INSTAGRAM", owner: 0, passport: "A2345671", anniversary: yearsAgo(1), destination: "Bali", adults: 2, budget: 250000, travelType: "Honeymoon", days: 7, pace: "Relaxed", hotelType: "Boutique", interests: ["beaches", "spa", "culture"], ...KA, billingName: "Aanya Sharma", monthsAgo: 0, startInDays: 9, tripStatus: "READY_TO_TRAVEL", paidFrac: 0.5, markupPct: 19,
      items: [["Hotel", "The Legian + Tugu Bali — 6 nights (BB)", 132000], ["Transport", "Private car w/ driver + airport transfers", 26000], ["Activities", "Uluwatu kecak, Mt Batur, waterfall breakfast", 22000]],
      ops: { assigns: [
        { v: "tugu", cat: "HOTEL", title: "4 nights — Walter Spies Pavilion (BB)", qty: 4, cost: 88000, sell: 112000, st: "CONFIRMED", conf: "TUGU-44120", voucher: true, pay: { amt: 26400, mode: "BANK" } },
        { v: "suresh", cat: "TRANSFER", title: "Airport transfers + 4 days at-disposal", qty: 4, cost: 26000, sell: 33000, st: "REQUESTED" },
      ], tasks: [
        { t: "Collect passport copies & visa-on-arrival forms", type: "DOCUMENT_COLLECTION", pr: "HIGH", st: "PENDING", due: -1 },
        { t: "Send pre-trip info pack on WhatsApp", type: "OTHER", pr: "MEDIUM", st: "IN_PROGRESS", due: 2 },
      ] } },
    { name: "Deshpande Family", phone: "+91 98881 11012", email: "anil.deshpande@example.in", source: "REFERRAL", owner: 2, destination: "Bhutan", adults: 3, budget: 230000, travelType: "Cultural", days: 6, pace: "Moderate", hotelType: "4-star", interests: ["culture", "nature", "hiking"], ...MH, billingName: "Anil Deshpande", monthsAgo: 0, startInDays: 4, tripStatus: "VENDOR_CONFIRMATION_PENDING", paidFrac: 1, markupPct: 18,
      items: [["Hotel", "5 nights 4★ (FB)", 132000], ["Activities", "Guide, permits, SDF, monuments", 64000], ["Transport", "Private vehicle throughout", 18000]],
      ops: { assigns: [
        { v: "tenzin", cat: "GUIDE", title: "Licensed guide — Thimphu/Punakha/Paro (6 days)", qty: 6, cost: 64000, sell: 84000, st: "PENDING" },
      ], tasks: [
        { t: "Chase Tenzin Himalayan Guides for confirmation", type: "INTERNAL", pr: "URGENT", st: "PENDING", due: 0 },
        { t: "Issue Bhutan SDF permits", type: "DOCUMENT_COLLECTION", pr: "HIGH", st: "PENDING", due: 1 },
      ] } },
    { name: "The Iyer Group", phone: "+91 98882 11005", email: "iyer.travels@example.in", source: "REFERRAL", owner: 1, destination: "Kerala", adults: 6, budget: 360000, travelType: "Group", days: 8, pace: "Relaxed", hotelType: "Heritage", interests: ["backwaters", "tea", "ayurveda"], ...KA, billingName: "S. Iyer", monthsAgo: 0, startInDays: -2, tripStatus: "IN_PROGRESS", paidFrac: 1, markupPct: 17,
      items: [["Hotel", "7 nights hotels + houseboat (BB/FB)", 248000], ["Transport", "8-day at-disposal tempo traveller", 44000], ["Activities", "Spice trail, tea factory, Kathakali", 18000]],
      ops: { assigns: [
        { v: "spice", cat: "HOTEL", title: "1 night — Heritage AC houseboat (FB)", qty: 1, cost: 38000, sell: 49000, st: "CONFIRMED", conf: "SCC-77182", voucher: true, pay: { amt: 38000, mode: "UPI" } },
        { v: "suresh", cat: "TRANSFER", title: "8-day at-disposal tempo traveller", qty: 8, cost: 44000, sell: 56000, st: "CONFIRMED", conf: "SN-9921", voucher: true, pay: { amt: 44000, mode: "UPI" } },
      ], tasks: [
        { t: "Confirm houseboat check-in time with Spice Coast", type: "HOTEL_CONFIRMATION", pr: "MEDIUM", st: "COMPLETED", due: -3 },
        { t: "Share driver details with group lead", type: "DRIVER_ASSIGNMENT", pr: "LOW", st: "COMPLETED", due: -4 },
      ] } },
    { name: "Naina & Sahil Kapoor", spouse: "Sahil Kapoor", phone: "+91 98883 11019", email: "naina.sahil@example.in", source: "INSTAGRAM", owner: 0, passport: "N5566778", anniversary: yearsAgo(2), destination: "Maldives", adults: 2, budget: 430000, travelType: "Honeymoon", days: 5, pace: "Relaxed", hotelType: "Resort", interests: ["beaches", "spa"], ...KA, billingName: "Naina Kapoor", monthsAgo: 1, startInDays: 22, tripStatus: "BOOKED", paidFrac: 0.5, markupPct: 20,
      items: [["Hotel", "Soneva Fushi — 4 nights overwater villa (AI)", 312000], ["Flights", "BLR–MLE return (2 pax)", 78000], ["Transport", "Return seaplane transfers", 24000]],
      ops: { assigns: [
        { v: "soneva", cat: "HOTEL", title: "4 nights — Overwater Villa w/ pool (AI)", qty: 4, cost: 312000, sell: 392000, st: "CONFIRMED", conf: "SON-22910", voucher: true, pay: { amt: 156000, mode: "BANK" } },
      ], tasks: [
        { t: "Collect honeymoon certificate for resort perks", type: "DOCUMENT_COLLECTION", pr: "MEDIUM", st: "PENDING", due: 5 },
      ] } },
    { name: "Mehta Family", phone: "+91 98884 11002", email: "vivek.mehta@example.in", source: "REFERRAL", owner: 2, destination: "Dubai", adults: 2, children: [8, 12], budget: 320000, travelType: "Family", days: 5, pace: "Moderate", hotelType: "5-star", interests: ["family", "city", "theme parks"], ...MH, billingName: "Vivek Mehta", monthsAgo: 2, startInDays: -25, tripStatus: "COMPLETED", paidFrac: 1, markupPct: 17,
      items: [["Hotel", "Atlantis The Palm — 4 nights (BB)", 198000], ["Flights", "BOM–DXB return (4 pax)", 92000], ["Activities", "Burj Khalifa + desert safari + Aquaventure", 34000]],
      ops: { assigns: [
        { v: "desert", cat: "TRANSFER", title: "Private transfers + desert safari", cost: 38000, sell: 49000, st: "COMPLETED", conf: "DR-7781", voucher: true, pay: { amt: 38000, mode: "CARD" } },
      ], tasks: [] } },
    { name: "Arjun & Devika", spouse: "Devika", phone: "+91 98885 11007", email: "arjun.devika@example.in", source: "GOOGLE", owner: 1, anniversary: yearsAgo(1), destination: "Bali", adults: 2, budget: 220000, travelType: "Honeymoon", days: 7, pace: "Relaxed", hotelType: "Boutique", interests: ["beaches", "culture"], ...KA, billingName: "Arjun R", monthsAgo: 3, startInDays: -55, tripStatus: "COMPLETED", paidFrac: 1, markupPct: 19,
      items: [["Hotel", "6 nights boutique villas (BB)", 128000], ["Transport", "Private driver + transfers", 24000], ["Activities", "Uluwatu, Ubud, rice terraces", 20000]],
      ops: { assigns: [{ v: "tugu", cat: "HOTEL", title: "3 nights — Rejang Suite (BB)", qty: 3, cost: 66000, sell: 84000, st: "COMPLETED", conf: "TUGU-39001", voucher: true, pay: { amt: 66000, mode: "BANK" } }], tasks: [] } },
    { name: "Ananya & Karthik Bose", spouse: "Karthik Bose", phone: "+91 98886 11015", email: "ananya.bose@example.in", source: "INSTAGRAM", owner: 0, anniversary: yearsAgo(5), destination: "Vietnam", adults: 2, budget: 300000, travelType: "Couple", days: 9, pace: "Moderate", hotelType: "Boutique", interests: ["culture", "food"], ...KA, billingName: "Ananya Bose", monthsAgo: 4, startInDays: -80, tripStatus: "COMPLETED", paidFrac: 1, markupPct: 18,
      items: [["Hotel", "8 nights boutique + Halong cruise", 188000], ["Flights", "BLR–HAN return (2 pax)", 72000], ["Activities", "Guides, street food, My Son", 26000]],
      ops: { assigns: [{ v: "saigon", cat: "GUIDE", title: "Private guides — Hanoi/Hoi An (5 days)", qty: 5, cost: 52000, sell: 68000, st: "COMPLETED", conf: "IV-5521", voucher: true, pay: { amt: 52000, mode: "BANK" } }], tasks: [] } },
    { name: "Rajwade Family", phone: "+91 98887 11024", email: "girish.rajwade@example.in", source: "REFERRAL", owner: 2, destination: "Rajasthan", adults: 4, budget: 280000, travelType: "Heritage", days: 7, pace: "Moderate", hotelType: "Palace", interests: ["heritage", "culture"], ...MH, billingName: "Girish Rajwade", monthsAgo: 5, startInDays: -110, tripStatus: "COMPLETED", paidFrac: 1, markupPct: 18,
      items: [["Hotel", "6 nights palace hotels (BB)", 246000], ["Transport", "Private SUV + chauffeur", 38000], ["Activities", "Guides + monuments + boat ride", 22000]],
      ops: { assigns: [{ v: "oberoi", cat: "HOTEL", title: "3 nights — Premier Lake-View (BB)", qty: 3, cost: 168000, sell: 210000, st: "COMPLETED", conf: "OUV-88120", voucher: true, pay: { amt: 168000, mode: "BANK" } }], tasks: [] } },
    { name: "Verma Corporate", phone: "+91 98888 11020", email: "ashok.verma@example.in", source: "REFERRAL", owner: 0, destination: "Thailand", adults: 8, budget: 900000, travelType: "Incentive", days: 6, pace: "Moderate", hotelType: "5-star", interests: ["islands", "city", "team"], ...KA, gstin: "29AABCV5566K1Z9", billingName: "Verma Industries Pvt Ltd", monthsAgo: 6, startInDays: -140, tripStatus: "COMPLETED", paidFrac: 1, markupPct: 15,
      items: [["Hotel", "5 nights Bangkok + Phuket 5★", 520000], ["Flights", "BLR–BKK return (8 pax)", 248000], ["Activities", "Phi Phi islands + team dinner", 64000]],
      ops: { assigns: [{ v: "bkk", cat: "ACTIVITY", title: "Phi Phi island hopping + James Bond island (8 pax)", qty: 8, cost: 64000, sell: 82000, st: "COMPLETED", conf: "SIAM-5521", voucher: true, pay: { amt: 64000, mode: "BANK" } }], tasks: [] } },
    { name: "Pillai Family", phone: "+91 98889 11025", email: "ramesh.pillai@example.in", source: "WEBSITE", owner: 1, destination: "Kerala", adults: 2, budget: 175000, travelType: "Leisure", days: 6, pace: "Relaxed", hotelType: "Heritage", interests: ["backwaters", "ayurveda"], ...KA, billingName: "Ramesh Pillai", monthsAgo: 8, startInDays: -210, tripStatus: "COMPLETED", paidFrac: 1, markupPct: 18,
      items: [["Hotel", "5 nights + 1 houseboat (BB/FB)", 118000], ["Transport", "Private car w/ driver", 28000], ["Activities", "Tea factory, spice trail", 12000]],
      ops: { assigns: [{ v: "suresh", cat: "TRANSFER", title: "6-day at-disposal Innova Crysta", qty: 6, cost: 28000, sell: 36000, st: "COMPLETED", conf: "SN-7740", voucher: true, pay: { amt: 28000, mode: "UPI" } }], tasks: [] } },
  ];

  // --- 8d. Lost leads ------------------------------------------------------
  const lost = [
    { name: "Vikram Singh", phone: "+91 98890 11010", email: "vikram.singh@example.in", source: "WHATSAPP", status: "LOST", destination: "Vietnam", adults: 2, budget: 140000, owner: 2, createdAt: daysAgo(40), lostReason: "Went with a cheaper online package.", notes: "Price-sensitive. Re-target next season." },
    { name: "Reddy Family", phone: "+91 98891 11026", email: "mohan.reddy@example.in", source: "GOOGLE", status: "LOST", destination: "Dubai", adults: 4, budget: 300000, owner: 0, createdAt: daysAgo(55), lostReason: "Dates didn't work out this year.", notes: "Keen for next summer — warm lead." },
  ];

  // === 9. Create leads & lost (contacts only, some with a planning trip) ===
  for (const spec of [...leads, ...lost]) {
    const { contact, ownerId } = await makeContact(spec);
    if (spec.tripStatus) await makeTripWithItinerary(contact, ownerId, spec);
    if (spec.source === "WHATSAPP" || spec.status === "NEW") {
      await prisma.whatsappMessage.create({
        data: {
          agencyId, contactId: contact.id, sentByUserId: null,
          kind: "TEXT", direction: "INBOUND", status: "READ",
          phone: (spec.phone || "").replace(/[^0-9]/g, ""),
          message: `Hi, I saw your ${spec.destination} trips — could you share a quote for ${spec.adults} adults${spec.children ? " + " + spec.children.length + " kids" : ""}?`,
          createdAt: spec.createdAt ?? daysAgo(2),
          sentAt: spec.createdAt ?? daysAgo(2),
        },
      });
      created.wa++;
    }
    await prisma.activity.create({
      data: { contactId: contact.id, actorId: ownerId, type: "NOTE", title: `New ${spec.source.toLowerCase()} enquiry`, body: spec.notes, createdAt: spec.createdAt ?? daysAgo(2) },
    });
    created.activities++;
  }
  console.log(`→ Created ${leads.length} active leads + ${lost.length} lost`);

  // === 10. Create live proposals (contact + trip + itinerary + SENT quote) =
  const appBase = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.saffronsea.travel";
  for (const spec of proposals) {
    const { contact, ownerId } = await makeContact(spec);
    const trip = await makeTripWithItinerary(contact, ownerId, spec);
    const { quote, sellingPrice } = await makeQuote(trip, spec);
    const phone = (spec.phone || "").replace(/[^0-9]/g, "");
    await prisma.whatsappMessage.create({
      data: { agencyId, contactId: contact.id, tripId: trip.id, sentByUserId: ownerId, kind: "TEMPLATE", direction: "OUTBOUND", status: "READ", templateName: "proposal_sent", phone, message: `Hi ${contact.name.split(" ")[0]}, your ${spec.destination} proposal is ready ✨ Tap to view: ${appBase}/share/${quote.shareToken}`, metadata: { total: sellingPrice }, createdAt: spec.createdAt, sentAt: spec.createdAt, deliveredAt: spec.createdAt, readAt: new Date((spec.createdAt?.getTime() ?? Date.now()) + 3600000) },
    });
    created.wa++;
    await prisma.activity.createMany({
      data: [
        { contactId: contact.id, tripId: trip.id, actorId: ownerId, type: "QUOTE_CREATED", title: `Quote built — ${spec.destination}`, body: `₹${sellingPrice.toLocaleString("en-IN")} · v1`, createdAt: spec.createdAt },
        { contactId: contact.id, tripId: trip.id, actorId: ownerId, type: "QUOTE_SENT_WHATSAPP", title: "Proposal sent on WhatsApp", body: `${spec.destination} · ${spec.days} days`, createdAt: spec.createdAt },
      ],
    });
    created.activities += 2;
  }
  console.log(`→ Created ${proposals.length} live proposals (shareable)`);

  // === 11. Won deals (trip + itin + accepted quote + booking + invoice + ops) ===
  for (const spec of won) {
    spec.bookedAt = monthsAgo(spec.monthsAgo);
    spec.createdAt = new Date(spec.bookedAt.getTime() - 12 * DAY); // enquiry ~12d before booking
    spec.status = "WON";
    spec.quoteStatus = "ACCEPTED";
    const { contact, ownerId } = await makeContact(spec);
    const trip = await makeTripWithItinerary(contact, ownerId, spec);
    const { quote, sellingPrice } = await makeQuote(trip, spec);

    const paid = Math.round(sellingPrice * spec.paidFrac);
    const booking = await prisma.booking.create({
      data: {
        tripId: trip.id, quoteId: quote.id,
        status: spec.tripStatus === "COMPLETED" ? "COMPLETED" : spec.tripStatus === "IN_PROGRESS" ? "IN_PROGRESS" : "CONFIRMED",
        totalAmount: sellingPrice, paidAmount: paid,
        createdAt: spec.bookedAt, updatedAt: spec.bookedAt,
      },
    });
    created.bookings++;

    const advance = Math.round(sellingPrice * 0.5);
    await prisma.payment.create({ data: { bookingId: booking.id, type: "ADVANCE", amount: Math.min(advance, paid), method: "Razorpay", reference: `pay_${tok("R").slice(2, 16)}`, paidAt: spec.bookedAt } });
    if (paid > advance) {
      await prisma.payment.create({ data: { bookingId: booking.id, type: "FINAL", amount: paid - advance, method: "Bank transfer", reference: `NEFT-${Math.floor(1e7 + Math.random() * 8e7)}`, paidAt: new Date(spec.bookedAt.getTime() + 9 * DAY) } });
    }

    const invDate = new Date(spec.bookedAt.getTime() + 2 * DAY);
    const { fy, seq, number } = nextInvoiceNumber(invDate);
    const subtotal = sellingPrice;
    const taxTotal = Math.round(subtotal * 0.05);
    const intra = (spec.billingStateCode ?? "29") === STATE_CODE;
    const cgst = intra ? Math.round(taxTotal / 2) : 0;
    const sgst = intra ? taxTotal - cgst : 0;
    const igst = intra ? 0 : taxTotal;
    const grand = subtotal + taxTotal;
    const inv = await prisma.invoice.create({
      data: {
        agencyId, createdById: ownerId, bookingId: booking.id,
        invoiceNumber: number, invoiceFy: fy, invoiceSequence: seq,
        status: "ISSUED", invoiceDate: invDate, issuedAt: invDate,
        taxScheme: "GST_5_NO_ITC", taxRatePct: 5, taxableBasis: "FULL_AMOUNT",
        placeOfSupplyState: spec.billingState ?? STATE, placeOfSupplyStateCode: spec.billingStateCode ?? STATE_CODE,
        supplierSnapshot: { legalName: LEGAL_NAME, gstin: GSTIN, address: "No. 14, Lavelle Road, Bengaluru, Karnataka 560001", stateCode: STATE_CODE },
        recipientSnapshot: { name: spec.billingName ?? contact.name, gstin: spec.gstin ?? null, address: `${spec.billingCity ?? "Bengaluru"}, ${spec.billingState ?? STATE}`, stateCode: spec.billingStateCode ?? STATE_CODE },
        subtotal, cgstAmount: cgst, sgstAmount: sgst, igstAmount: igst, taxTotal, roundOff: 0, grandTotal: grand,
        amountInWords: rupeesInWords(grand), shareToken: tok("inv"),
        createdAt: invDate, updatedAt: invDate,
        items: { create: [{ position: 0, description: `Tour package — ${spec.destination} (${spec.days}D/${spec.days - 1}N, ${spec.adults + (spec.children?.length ?? 0)} pax)`, sacCode: "998555", quantity: 1, unitPrice: subtotal, taxableValue: subtotal, taxRatePct: 5, cgstAmount: cgst, sgstAmount: sgst, igstAmount: igst }] },
      },
    });
    created.invoices++;

    for (const a of spec.ops?.assigns ?? []) {
      const assignment = await prisma.vendorAssignment.create({
        data: {
          tripId: trip.id, bookingId: booking.id, vendorId: V[a.v].id,
          category: a.cat, title: a.title,
          startDate: trip.startDate ?? undefined,
          endDate: trip.startDate ? new Date(trip.startDate.getTime() + spec.days * DAY) : undefined,
          quantity: a.qty ?? undefined, totalCost: a.cost, sellingPrice: a.sell,
          status: a.st, confirmationNumber: a.conf ?? undefined, voucherSent: !!a.voucher,
          createdAt: spec.bookedAt,
        },
      });
      created.assignments++;

      if (a.voucher) {
        await prisma.voucher.create({
          data: {
            assignmentId: assignment.id, voucherNumber: `VCH-${created.vouchers + 1}-${number.split("/")[2]}`,
            shareToken: tok("v"), title: a.title,
            content: { vendor: V[a.v].name, confirmation: a.conf, trip: spec.destination, guest: contact.name, dates: trip.startDate ? trip.startDate.toLocaleDateString("en-IN") : "" },
            generatedAt: spec.bookedAt, sentAt: new Date(spec.bookedAt.getTime() + DAY),
          },
        });
        created.vouchers++;
      }

      if (a.pay) {
        await prisma.vendorPayment.create({
          data: { vendorId: V[a.v].id, tripId: trip.id, bookingId: booking.id, amount: a.pay.amt, paymentDate: new Date(spec.bookedAt.getTime() + 3 * DAY), mode: a.pay.mode, reference: a.conf ?? null, notes: "Advance to vendor" },
        });
        created.vpayments++;
      }
    }
    for (const tk of spec.ops?.tasks ?? []) {
      await prisma.operationTask.create({
        data: { tripId: trip.id, bookingId: booking.id, title: tk.t, type: tk.type, priority: tk.pr, status: tk.st, dueDate: daysFromNow(tk.due), completedAt: tk.st === "COMPLETED" ? daysAgo(Math.abs(tk.due)) : null },
      });
      created.tasks++;
    }

    await prisma.activity.createMany({
      data: [
        { contactId: contact.id, tripId: trip.id, actorId: ownerId, type: "QUOTE_ACCEPTED", title: "Proposal accepted", body: `${spec.destination} · ₹${sellingPrice.toLocaleString("en-IN")}`, createdAt: spec.bookedAt },
        { contactId: contact.id, tripId: trip.id, actorId: ownerId, type: "BOOKING_CREATED", title: "Booking confirmed", body: `${spec.days}-day ${spec.travelType} trip`, createdAt: spec.bookedAt },
        { contactId: contact.id, tripId: trip.id, actorId: ownerId, type: "PAYMENT_RECORDED", title: `Payment received — ₹${paid.toLocaleString("en-IN")}`, body: spec.paidFrac >= 1 ? "Paid in full" : "Advance received", createdAt: spec.bookedAt },
        { contactId: contact.id, invoiceId: inv.id, actorId: ownerId, type: "INVOICE_SENT_WHATSAPP", title: `Invoice ${number} issued`, body: `₹${grand.toLocaleString("en-IN")} incl. GST`, createdAt: invDate },
      ],
    });
    created.activities += 4;
  }
  console.log(`→ Created ${won.length} won bookings with invoices & operations`);

  // === 12. WhatsApp templates so that screen is populated ==================
  const templates = [
    { name: "Proposal sent", templateId: "proposal_sent", category: "PROPOSAL", body: "Hi {{name}}, your {{destination}} proposal is ready ✨ Tap to view: {{link}}" },
    { name: "Payment reminder", templateId: "payment_reminder", category: "PAYMENT_REMINDER", body: "Hi {{name}}, a gentle reminder that the balance of {{amount}} for your {{destination}} trip is due on {{date}}." },
    { name: "Trip reminder (T-3)", templateId: "trip_reminder_t3", category: "TRIP_REMINDER", body: "Hi {{name}}, your {{destination}} adventure begins in 3 days! Here's your final info pack: {{link}}" },
  ];
  for (const t of templates) {
    await prisma.whatsappTemplate.create({
      data: { agencyId, createdById: owner.id, name: t.name, templateId: t.templateId, category: t.category, language: "en", variables: [{ key: "name", label: "Customer name", example: "Priya" }, { key: "destination", label: "Destination", example: "Maldives" }, { key: "link", label: "Link", example: "https://…" }], bodyPreview: t.body },
    });
  }
  console.log(`→ Created ${templates.length} WhatsApp templates`);

  // === 13. InvoiceCounters reflect the issued sequences ====================
  for (const [fy, last] of fySeq.entries()) {
    await prisma.invoiceCounter.create({ data: { agencyId, fiscalYear: fy, prefix: "SS", lastSequence: last } });
  }

  // === Summary =============================================================
  console.log("\n  ✓ Video-demo account ready\n");
  console.log(`    Agency      : ${AGENCY_NAME} (${LEGAL_NAME})`);
  console.log(`    Login       : ${OWNER_EMAIL}  /  ${OWNER_PASSWORD}`);
  console.log(`    Plan        : PRO (Reports + automations unlocked)`);
  console.log(`    Team        : ${OWNER_NAME} (Owner), Rohan Verma, Ishita Menon`);
  console.log(`    Contacts    : ${created.contacts}  |  Trips: ${created.trips}  |  Itineraries on ${Object.keys(itineraries).length} destinations`);
  console.log(`    Proposals   : ${created.proposals} live (shareable)  |  Quotes: ${created.quotes}`);
  console.log(`    Bookings    : ${created.bookings}  |  Invoices: ${created.invoices} (GST)`);
  console.log(`    Operations  : ${created.assignments} vendor assignments, ${created.vouchers} vouchers, ${created.tasks} tasks, ${created.vpayments} vendor payments`);
  console.log(`    WhatsApp    : ${created.wa} messages, ${templates.length} templates`);
  console.log(`    Activities  : ${created.activities}\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
