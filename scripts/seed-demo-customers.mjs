// Demo CRM seed — 20 customers split between two agents (Ravi & Yogesh),
// a roster of vendors, and trips with vendor assignments so the operations
// and vendor screens look alive. Built for showing the app to a prospect.
//
// Idempotent + self-cleaning: every row it creates is tagged [DEMO-CRM] in
// notes, and the script wipes its own tagged data (for this agency) before
// re-seeding. Safe to run repeatedly.
//
//   node --env-file=.env scripts/seed-demo-customers.mjs
//
// Targets the agency owned by demo@tripcraft.app.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TAG = "[DEMO-CRM]";
const DEMO_EMAIL = "demo@tripcraft.app";

const today = new Date();
today.setHours(0, 0, 0, 0);
const day = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(today.getTime() - n * day);
const daysFromNow = (n) => new Date(today.getTime() + n * day);
const years = (n) => new Date(today.getFullYear() - n, today.getMonth(), today.getDate());

async function main() {
  // ---- 1. Resolve the demo agency (owned by demo@tripcraft.app) -----------
  const demoUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    include: { memberships: true },
  });
  if (!demoUser) throw new Error(`No user ${DEMO_EMAIL} — sign up that account first.`);
  const owner = demoUser.memberships.find((m) => m.role === "OWNER") ?? demoUser.memberships[0];
  if (!owner) throw new Error(`${DEMO_EMAIL} has no agency membership.`);
  const agencyId = owner.agencyId;
  const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
  console.log(`→ Seeding into agency "${agency.name}" (${agencyId})`);

  // ---- 2. Two agents: Ravi & Yogesh (STAFF members of the agency) ---------
  async function ensureAgent(email, name) {
    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: { email, name, emailVerified: new Date() },
    });
    await prisma.membership.upsert({
      where: { userId_agencyId: { userId: user.id, agencyId } },
      update: { role: "STAFF", suspendedAt: null },
      create: { userId: user.id, agencyId, role: "STAFF" },
    });
    return user;
  }
  const ravi = await ensureAgent("ravi@demo.tripos.app", "Ravi Kapoor");
  const yogesh = await ensureAgent("yogesh@demo.tripos.app", "Yogesh Sharma");
  console.log(`→ Agents ready: Ravi Kapoor, Yogesh Sharma`);

  // ---- 3. Wipe previously-seeded [DEMO-CRM] rows for this agency -----------
  // Trips first (assignments/activities/payments cascade), then contacts, vendors.
  await prisma.trip.deleteMany({ where: { agencyId, notes: { contains: TAG } } });
  await prisma.contact.deleteMany({ where: { agencyId, notes: { contains: TAG } } });
  await prisma.vendor.deleteMany({ where: { agencyId, notes: { contains: TAG } } });
  console.log("→ Cleared prior [DEMO-CRM] data");

  // ---- 4. Vendors ---------------------------------------------------------
  const vendorSpecs = [
    { key: "tugu", name: "Tugu Bali", type: "HOTEL", city: "Canggu", country: "Indonesia", phone: "+62 361 731701", email: "reservations@tuguhotels.com", isPreferred: true, paymentTerms: "30% on booking, 70% before check-in", notes: "Boutique heritage resort. 24–48h confirmation." },
    { key: "atmos", name: "Atmosphere Kanifushi", type: "HOTEL", city: "Lhaviyani Atoll", country: "Maldives", phone: "+960 662 0066", email: "reserve@atmosphere-kanifushi.com", isPreferred: true, paymentTerms: "50% advance", notes: "All-inclusive Platinum Plan. Seaplane transfers." },
    { key: "spice", name: "Spice Coast Cruises", type: "HOTEL", city: "Alleppey", state: "Kerala", country: "India", phone: "+91 477 224 1133", whatsapp: "919847012345", email: "bookings@spicecoast.example", paymentTerms: "100% on confirmation", notes: "Heritage houseboats. Confirms within 4h on WhatsApp." },
    { key: "swiss", name: "Swiss Alpine DMC", type: "DMC", city: "Interlaken", country: "Switzerland", phone: "+41 33 555 1212", email: "ops@swissalpinedmc.example", isPreferred: true, paymentTerms: "Net 15", notes: "Rail passes, Jungfraujoch, guided day tours." },
    { key: "desert", name: "Desert Rose Transport", type: "TRANSPORT", city: "Dubai", country: "UAE", phone: "+971 4 555 8080", whatsapp: "971555558080", email: "fleet@desertrose.example", paymentTerms: "On invoice", notes: "Luxury fleet + desert safari transfers." },
    { key: "suresh", name: "Suresh Nair — Driver", type: "DRIVER", city: "Kochi", state: "Kerala", country: "India", phone: "+91 98470 11111", whatsapp: "919847011111", isPreferred: true, notes: "12 yrs experience, English-speaking, Innova Crysta." },
    { key: "bkk", name: "Bangkok Day Tours", type: "ACTIVITY", city: "Bangkok", country: "Thailand", phone: "+66 2 555 4400", email: "hello@bkkdaytours.example", paymentTerms: "Prepaid", notes: "Floating markets, temples, island hopping." },
    { key: "tenzin", name: "Tenzin Himalayan Guides", type: "GUIDE", city: "Thimphu", country: "Bhutan", phone: "+975 17 11 2233", whatsapp: "9751711 2233", email: "tenzin@himalayanguides.example", isPreferred: true, notes: "Licensed cultural + trekking guides (Bhutan/Ladakh)." },
  ];
  const vendors = {};
  for (const v of vendorSpecs) {
    const { key, notes, ...rest } = v;
    vendors[key] = await prisma.vendor.create({
      data: { agencyId, ...rest, isActive: true, notes: `${TAG} ${notes ?? ""}`.trim() },
    });
  }
  console.log(`→ Created ${vendorSpecs.length} vendors`);

  // ---- 5. Twenty customers, alternating owners (Ravi / Yogesh) ------------
  // status spread across the pipeline; WON rows are converted customers.
  const C = [
    { name: "Aanya & Rohan Sharma", phone: "+91 98100 11001", email: "aanya.sharma@example.in", source: "INSTAGRAM", status: "WON", destination: "Bali", adults: 2, budget: 250000, rel: "SPOUSE", anniversary: years(3), notes: "Honeymoon — boutique villas with private pools." },
    { name: "Mehta Family", phone: "+91 98200 11002", email: "vivek.mehta@example.in", source: "REFERRAL", status: "WON", destination: "Kerala", adults: 2, children: [8, 12], budget: 180000, rel: "SELF", notes: "Family of four, slow-paced backwaters + ayurveda." },
    { name: "Priya Nair", phone: "+91 98300 11003", email: "priya.nair@example.in", source: "WEBSITE", status: "QUOTED", destination: "Maldives", adults: 2, budget: 420000, rel: "SELF", followUp: 2, notes: "Anniversary trip, overwater villa, all-inclusive." },
    { name: "Karan Malhotra", phone: "+91 98400 11004", email: "karan.m@example.in", source: "WHATSAPP", status: "FOLLOW_UP", destination: "Switzerland", adults: 2, budget: 520000, rel: "SELF", followUp: 4, notes: "Wants Jungfraujoch + Glacier Express. Comparing quotes." },
    { name: "The Iyer Group", phone: "+91 98500 11005", email: "iyer.travels@example.in", source: "REFERRAL", status: "WON", destination: "Thailand", adults: 6, budget: 360000, rel: "SELF", notes: "Group of friends, Bangkok + Phuket, nightlife + islands." },
    { name: "Sneha Reddy", phone: "+91 98600 11006", email: "sneha.reddy@example.in", source: "INSTAGRAM", status: "CONTACTED", destination: "Dubai", adults: 2, children: [5], budget: 200000, rel: "SELF", followUp: 1, notes: "First international trip with toddler. Desert safari." },
    { name: "Arjun & Devika", phone: "+91 98700 11007", email: "arjun.devika@example.in", source: "GOOGLE", status: "WON", destination: "Andaman", adults: 2, budget: 160000, rel: "SPOUSE", anniversary: years(1), notes: "Scuba + Radhanagar beach. Booked." },
    { name: "Gupta Family", phone: "+91 98800 11008", email: "rajeev.gupta@example.in", source: "REFERRAL", status: "REQUIREMENT_UNDERSTOOD", destination: "Rajasthan", adults: 4, children: [10], budget: 220000, rel: "SELF", followUp: 3, notes: "Heritage palaces, Udaipur + Jaipur + Jodhpur." },
    { name: "Meera Krishnan", phone: "+91 98900 11009", email: "meera.k@example.in", source: "WEBSITE", status: "NEW", destination: "Singapore", adults: 3, children: [7, 9], budget: 280000, rel: "SELF", followUp: 1, notes: "Universal Studios + Sentosa. School holidays." },
    { name: "Vikram Singh", phone: "+91 99000 11010", email: "vikram.singh@example.in", source: "WHATSAPP", status: "LOST", destination: "Vietnam", adults: 2, budget: 140000, rel: "SELF", lostReason: "Went with a cheaper online package.", notes: "Price-sensitive. Re-target next season." },
    { name: "Fatima & Imran", phone: "+91 99100 11011", email: "fatima.imran@example.in", source: "INSTAGRAM", status: "QUOTED", destination: "Turkey", adults: 2, budget: 340000, rel: "SPOUSE", followUp: 2, notes: "Cappadocia balloon ride + Istanbul. Quote sent." },
    { name: "Deshpande Family", phone: "+91 99200 11012", email: "anil.deshpande@example.in", source: "REFERRAL", status: "WON", destination: "Bhutan", adults: 3, budget: 210000, rel: "SELF", notes: "Cultural tour with elderly parents. Confirmed." },
    { name: "Riya Kapoor", phone: "+91 99300 11013", email: "riya.kapoor@example.in", source: "GOOGLE", status: "CONTACTED", destination: "Goa", adults: 4, budget: 90000, rel: "SELF", followUp: 2, notes: "Long weekend, beachside resort, friends trip." },
    { name: "Sandeep Rao", phone: "+91 99400 11014", email: "sandeep.rao@example.in", source: "WEBSITE", status: "FOLLOW_UP", destination: "Ladakh", adults: 5, budget: 250000, rel: "SELF", followUp: 5, notes: "Biking expedition. Needs acclimatisation plan." },
    { name: "Ananya Bose", phone: "+91 99500 11015", email: "ananya.bose@example.in", source: "INSTAGRAM", status: "WON", destination: "Sri Lanka", adults: 2, budget: 175000, rel: "SPOUSE", anniversary: years(5), notes: "Tea country + south coast. Booked." },
    { name: "Joshi Family", phone: "+91 99600 11016", email: "manish.joshi@example.in", source: "REFERRAL", status: "REQUIREMENT_UNDERSTOOD", destination: "Europe", adults: 2, children: [14, 16], budget: 680000, rel: "SELF", followUp: 4, notes: "3-country Europe — France, Switzerland, Italy." },
    { name: "Tara Menon", phone: "+91 99700 11017", email: "tara.menon@example.in", source: "WHATSAPP", status: "NEW", destination: "Japan", adults: 2, budget: 460000, rel: "SELF", followUp: 1, notes: "Cherry blossom season. Flexible on dates." },
    { name: "Harish Patel", phone: "+91 99800 11018", email: "harish.patel@example.in", source: "GOOGLE", status: "QUOTED", destination: "Mauritius", adults: 2, children: [6, 11], budget: 390000, rel: "SELF", followUp: 3, notes: "Family beach holiday. Comparing two resorts." },
    { name: "Naina & Sahil", phone: "+91 99900 11019", email: "naina.sahil@example.in", source: "INSTAGRAM", status: "WON", destination: "Kashmir", adults: 2, budget: 130000, rel: "SPOUSE", anniversary: years(2), notes: "Shikara + Gulmarg. Honeymoon, booked." },
    { name: "Verma Group", phone: "+91 90000 11020", email: "ashok.verma@example.in", source: "REFERRAL", status: "CONTACTED", destination: "Australia", adults: 8, budget: 1200000, rel: "SELF", followUp: 6, notes: "Corporate incentive trip, Sydney + Gold Coast." },
  ];

  const contacts = [];
  for (let i = 0; i < C.length; i++) {
    const c = C[i];
    const agent = i % 2 === 0 ? ravi : yogesh;
    const isWon = c.status === "WON";
    const created = await prisma.contact.create({
      data: {
        agencyId,
        ownerId: agent.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        source: c.source,
        status: c.status,
        destination: c.destination,
        adults: c.adults,
        children: c.children ?? undefined,
        budget: c.budget,
        travelStartDate: isWon ? daysFromNow(20 + i) : daysFromNow(40 + i),
        travelEndDate: isWon ? daysFromNow(26 + i) : daysFromNow(47 + i),
        nextFollowUpAt: c.followUp ? daysFromNow(c.followUp) : undefined,
        anniversary: c.anniversary ?? undefined,
        convertedAt: isWon ? daysAgo(10 + i) : undefined,
        lostReason: c.lostReason ?? undefined,
        preferences: { style: c.destination, dietary: i % 3 === 0 ? "Vegetarian" : null },
        notes: `${TAG} ${c.notes}`,
        travelers: {
          create: [
            {
              fullName: c.name.replace(/ (Family|Group)$/, "").split(" & ")[0],
              relationship: "SELF",
              isPrimary: true,
              nationality: "Indian",
              phone: c.phone,
              email: c.email,
            },
          ],
        },
      },
    });
    contacts.push({ ...created, owner: agent, spec: c });
  }
  const raviCount = contacts.filter((c) => c.ownerId === ravi.id).length;
  console.log(`→ Created ${contacts.length} customers (Ravi: ${raviCount}, Yogesh: ${contacts.length - raviCount})`);

  // ---- 6. Trips + vendor assignments for the converted (WON) customers ----
  // Maps a destination to the vendors that service it.
  const tripPlans = [
    { dest: "Bali", days: 6, type: "Honeymoon", status: "BOOKED", assigns: [
      { v: "tugu", cat: "HOTEL", title: "5 nights — Walter Spies Pavilion (BB)", qty: 5, cost: 80000, sell: 105000, st: "CONFIRMED", conf: "TUGU-44120" },
      { v: "suresh", cat: "TRANSFER", title: "Airport transfers + 3 days at-disposal", cost: 14000, sell: 18000, st: "REQUESTED" },
    ]},
    { dest: "Kerala", days: 8, type: "Family", status: "IN_PROGRESS", assigns: [
      { v: "spice", cat: "HOTEL", title: "2 nights — Heritage 1BHK Houseboat (FB)", qty: 2, cost: 60000, sell: 78000, st: "CONFIRMED", conf: "SCC-77182", pay: 0 },
      { v: "suresh", cat: "TRANSFER", title: "8-day at-disposal Innova Crysta", qty: 8, cost: 32000, sell: 42000, st: "CONFIRMED", conf: "SN-9921", pay: 32000 },
    ]},
    { dest: "Thailand", days: 7, type: "Group", status: "BOOKED", assigns: [
      { v: "bkk", cat: "ACTIVITY", title: "Phi Phi island hopping + James Bond island", qty: 6, cost: 48000, sell: 66000, st: "CONFIRMED", conf: "BKK-5521" },
    ]},
    { dest: "Andaman", days: 5, type: "Honeymoon", status: "READY_TO_TRAVEL", assigns: [
      { v: "suresh", cat: "TRANSFER", title: "Port Blair transfers", cost: 9000, sell: 12000, st: "CONFIRMED", conf: "AND-2231" },
    ]},
    { dest: "Bhutan", days: 6, type: "Cultural", status: "VENDOR_CONFIRMATION_PENDING", assigns: [
      { v: "tenzin", cat: "GUIDE", title: "Licensed guide — Paro/Thimphu/Punakha", qty: 6, cost: 30000, sell: 42000, st: "PENDING" },
    ]},
    { dest: "Sri Lanka", days: 7, type: "Honeymoon", status: "BOOKED", assigns: [
      { v: "tenzin", cat: "GUIDE", title: "Cultural triangle guide (4 days)", qty: 4, cost: 22000, sell: 30000, st: "REQUESTED" },
    ]},
    { dest: "Kashmir", days: 5, type: "Honeymoon", status: "COMPLETED", assigns: [
      { v: "suresh", cat: "TRANSFER", title: "Srinagar–Gulmarg–Pahalgam circuit", cost: 16000, sell: 22000, st: "COMPLETED", conf: "KSH-8890", pay: 16000 },
    ]},
  ];

  let tripCount = 0, assignCount = 0;
  for (const plan of tripPlans) {
    const contact = contacts.find((c) => c.spec.destination === plan.dest && c.spec.status === "WON");
    if (!contact) continue;
    const trip = await prisma.trip.create({
      data: {
        agencyId,
        ownerId: contact.owner.id,
        contactId: contact.id,
        destination: plan.dest,
        days: plan.days,
        travelers: contact.spec.adults + (contact.spec.children?.length ?? 0),
        startDate: contact.travelStartDate,
        budget: contact.spec.budget,
        travelType: plan.type,
        pace: "Relaxed",
        hotelType: "Boutique",
        interests: ["sightseeing", "food", "leisure"],
        status: plan.status,
        notes: `${TAG} ${plan.dest} trip for ${contact.name}`,
      },
    });
    tripCount++;

    for (const a of plan.assigns) {
      const assignment = await prisma.vendorAssignment.create({
        data: {
          tripId: trip.id,
          vendorId: vendors[a.v].id,
          category: a.cat,
          title: a.title,
          startDate: trip.startDate,
          endDate: trip.startDate ? new Date(trip.startDate.getTime() + plan.days * day) : undefined,
          quantity: a.qty ?? undefined,
          totalCost: a.cost,
          sellingPrice: a.sell,
          status: a.st,
          confirmationNumber: a.conf ?? undefined,
          notes: TAG,
        },
      });
      assignCount++;

      // Optional vendor payment, when the plan specifies one.
      if (typeof a.pay === "number" && a.pay > 0) {
        await prisma.vendorPayment.create({
          data: {
            vendorId: vendors[a.v].id,
            tripId: trip.id,
            amount: a.pay,
            paymentDate: daysAgo(5),
            mode: "UPI",
            reference: `${TAG} ${a.conf ?? a.v}`,
            notes: `${TAG} advance`,
          },
        });
      }

      // Activity entry for confirmed vendors.
      if (a.st === "CONFIRMED" || a.st === "COMPLETED") {
        await prisma.activity.create({
          data: {
            contactId: contact.id,
            tripId: trip.id,
            vendorId: vendors[a.v].id,
            actorId: contact.owner.id,
            type: "VENDOR_CONFIRMED",
            title: `Confirmed ${vendors[a.v].name}`,
            body: `${TAG} ${a.title}${a.conf ? ` · ${a.conf}` : ""}`,
          },
        });
      }
    }
  }
  console.log(`→ Created ${tripCount} trips with ${assignCount} vendor assignments`);

  // ---- Summary ------------------------------------------------------------
  console.log("\n  ✓ Demo seed complete\n");
  console.log(`    Agency      : ${agency.name}`);
  console.log(`    Agents      : Ravi Kapoor & Yogesh Sharma (10 customers each)`);
  console.log(`    Customers   : 20 (mix of new leads, quoted, follow-ups, won, lost)`);
  console.log(`    Vendors     : ${vendorSpecs.length}, assigned across ${tripCount} trips`);
  console.log(`    Login as    : ${DEMO_EMAIL}\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
