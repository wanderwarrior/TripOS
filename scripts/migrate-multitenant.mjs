#!/usr/bin/env node
/**
 * One-shot migration: single-tenant (per-user) → multi-tenant (per-agency).
 *
 * What it does, in order:
 *   1. Adds new enums (MembershipRole, InviteStatus).
 *   2. Creates new tables (Agency, Membership, Invite).
 *   3. Adds new columns to existing tables (agencyId, ownerId/createdById,
 *      User auth fields). All nullable initially.
 *   4. Creates one default Agency, makes the demo user its OWNER.
 *   5. Backfills agencyId on every tenant row.
 *   6. Drops the obsolete userId columns + old unique constraints.
 *   7. Adds NOT NULL constraints + new uniques + foreign keys.
 *   8. Seeds the demo user with a default password so dev login works.
 *
 * Idempotent — safe to re-run. After this finishes, `prisma db push` is a
 * no-op (the DB matches schema). The dev login becomes:
 *     email:    demo@tripcraft.app
 *     password: tripcraft
 *
 * Run with:  node scripts/migrate-multitenant.mjs
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@tripcraft.app";
const DEMO_PASSWORD = "tripcraft";
const DEFAULT_AGENCY_NAME = "My Agency";

function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "agency-" + randomBytes(3).toString("hex");
}

async function exec(sql) {
  // $executeRawUnsafe runs raw SQL with no parameter binding. Safe here
  // because every value is hard-coded or sourced from migration metadata.
  await prisma.$executeRawUnsafe(sql);
}

async function columnExists(table, column) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name=$2`,
    table,
    column
  );
  return rows.length > 0;
}

async function tableExists(table) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1`,
    table
  );
  return rows.length > 0;
}

async function constraintExists(table, name) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 FROM information_schema.table_constraints WHERE table_schema='public' AND table_name=$1 AND constraint_name=$2`,
    table,
    name
  );
  return rows.length > 0;
}

async function enumExists(name) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 FROM pg_type WHERE typname=$1`,
    name
  );
  return rows.length > 0;
}

async function step(name, fn) {
  process.stdout.write(`  → ${name}… `);
  try {
    await fn();
    console.log("ok");
  } catch (err) {
    console.log("FAIL");
    throw err;
  }
}

async function main() {
  console.log("[migrate-multitenant] starting\n");

  // ---------------------------------------------------------------------
  // 1. Enums
  // ---------------------------------------------------------------------
  await step("create enum MembershipRole", async () => {
    if (!(await enumExists("MembershipRole"))) {
      await exec(`CREATE TYPE "MembershipRole" AS ENUM ('OWNER', 'STAFF', 'VIEWER')`);
    }
  });
  await step("create enum InviteStatus", async () => {
    if (!(await enumExists("InviteStatus"))) {
      await exec(
        `CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED')`
      );
    }
  });

  // ---------------------------------------------------------------------
  // 2. New tables
  // ---------------------------------------------------------------------
  await step("create table Agency", async () => {
    await exec(`
      CREATE TABLE IF NOT EXISTS "Agency" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await exec(`CREATE INDEX IF NOT EXISTS "Agency_slug_idx" ON "Agency"("slug")`);
  });

  await step("create table Membership", async () => {
    await exec(`
      CREATE TABLE IF NOT EXISTS "Membership" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "agencyId" TEXT NOT NULL,
        "role" "MembershipRole" NOT NULL DEFAULT 'STAFF',
        "suspendedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Membership_userId_agencyId_key" UNIQUE ("userId", "agencyId")
      )
    `);
    await exec(
      `CREATE INDEX IF NOT EXISTS "Membership_agencyId_role_idx" ON "Membership"("agencyId", "role")`
    );
    if (!(await constraintExists("Membership", "Membership_userId_fkey"))) {
      await exec(
        `ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`
      );
    }
    if (!(await constraintExists("Membership", "Membership_agencyId_fkey"))) {
      await exec(
        `ALTER TABLE "Membership" ADD CONSTRAINT "Membership_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE`
      );
    }
  });

  await step("create table Invite", async () => {
    await exec(`
      CREATE TABLE IF NOT EXISTS "Invite" (
        "id" TEXT PRIMARY KEY,
        "agencyId" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "role" "MembershipRole" NOT NULL DEFAULT 'STAFF',
        "token" TEXT NOT NULL UNIQUE,
        "invitedById" TEXT NOT NULL,
        "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "acceptedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Invite_agencyId_email_key" UNIQUE ("agencyId", "email")
      )
    `);
    await exec(`CREATE INDEX IF NOT EXISTS "Invite_token_idx" ON "Invite"("token")`);
    await exec(
      `CREATE INDEX IF NOT EXISTS "Invite_agencyId_status_idx" ON "Invite"("agencyId", "status")`
    );
    if (!(await constraintExists("Invite", "Invite_agencyId_fkey"))) {
      await exec(
        `ALTER TABLE "Invite" ADD CONSTRAINT "Invite_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE`
      );
    }
    if (!(await constraintExists("Invite", "Invite_invitedById_fkey"))) {
      await exec(
        `ALTER TABLE "Invite" ADD CONSTRAINT "Invite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`
      );
    }
  });

  // ---------------------------------------------------------------------
  // 3. Add auth fields to User
  // ---------------------------------------------------------------------
  await step("add User auth columns", async () => {
    if (!(await columnExists("User", "hashedPassword"))) {
      await exec(`ALTER TABLE "User" ADD COLUMN "hashedPassword" TEXT`);
    }
    if (!(await columnExists("User", "emailVerified"))) {
      await exec(`ALTER TABLE "User" ADD COLUMN "emailVerified" TIMESTAMP(3)`);
    }
    if (!(await columnExists("User", "image"))) {
      await exec(`ALTER TABLE "User" ADD COLUMN "image" TEXT`);
    }
    if (!(await columnExists("User", "updatedAt"))) {
      await exec(
        `ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`
      );
    }
  });

  // ---------------------------------------------------------------------
  // 4. Default agency + owner membership for demo user
  // ---------------------------------------------------------------------
  const demoUser = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!demoUser) {
    throw new Error(
      `No user with email ${DEMO_EMAIL} found. Old single-user data assumed; aborting.`
    );
  }

  let defaultAgency = await prisma.agency.findFirst({
    where: { memberships: { some: { userId: demoUser.id, role: "OWNER" } } },
  });
  if (!defaultAgency) {
    await step("create default Agency + Owner membership", async () => {
      defaultAgency = await prisma.agency.create({
        data: {
          name: DEFAULT_AGENCY_NAME,
          slug: slugify(DEFAULT_AGENCY_NAME) + "-" + randomBytes(2).toString("hex"),
        },
      });
      await prisma.membership.create({
        data: {
          userId: demoUser.id,
          agencyId: defaultAgency.id,
          role: "OWNER",
        },
      });
    });
  } else {
    console.log("  → default Agency already present (skip create)");
  }
  const defaultAgencyId = defaultAgency.id;

  // ---------------------------------------------------------------------
  // 5. Add agencyId / ownerId / createdById columns (nullable)
  // ---------------------------------------------------------------------
  const tablesToAddAgencyId = [
    "Lead",
    "Trip",
    "Invoice",
    "InvoiceCounter",
    "AgencySettings",
    "Vendor",
    "WhatsappMessage",
    "WhatsappTemplate",
    "WhatsappAutomationRule",
  ];
  await step("add agencyId columns", async () => {
    for (const t of tablesToAddAgencyId) {
      if (!(await columnExists(t, "agencyId"))) {
        await exec(`ALTER TABLE "${t}" ADD COLUMN "agencyId" TEXT`);
      }
    }
  });

  await step("add owner/creator columns", async () => {
    if (!(await columnExists("Lead", "ownerId"))) {
      await exec(`ALTER TABLE "Lead" ADD COLUMN "ownerId" TEXT`);
    }
    if (!(await columnExists("Trip", "ownerId"))) {
      await exec(`ALTER TABLE "Trip" ADD COLUMN "ownerId" TEXT`);
    }
    if (!(await columnExists("Invoice", "createdById"))) {
      await exec(`ALTER TABLE "Invoice" ADD COLUMN "createdById" TEXT`);
    }
    if (!(await columnExists("WhatsappMessage", "sentByUserId"))) {
      await exec(`ALTER TABLE "WhatsappMessage" ADD COLUMN "sentByUserId" TEXT`);
    }
    if (!(await columnExists("WhatsappTemplate", "createdById"))) {
      await exec(`ALTER TABLE "WhatsappTemplate" ADD COLUMN "createdById" TEXT`);
    }
  });

  // ---------------------------------------------------------------------
  // 6. Backfill — set agencyId on every existing row, owner/creator from
  //    the old userId column. UPDATE statements are safe to re-run.
  // ---------------------------------------------------------------------
  await step("backfill agencyId across all tables", async () => {
    for (const t of tablesToAddAgencyId) {
      await prisma.$executeRawUnsafe(
        `UPDATE "${t}" SET "agencyId" = $1 WHERE "agencyId" IS NULL`,
        defaultAgencyId
      );
    }
  });

  await step("backfill owner/creator attribution from old userId", async () => {
    // Each ALTER…UPDATE uses the userId column if it still exists.
    if (await columnExists("Lead", "userId")) {
      await prisma.$executeRawUnsafe(
        `UPDATE "Lead" SET "ownerId" = "userId" WHERE "ownerId" IS NULL`
      );
    }
    if (await columnExists("Trip", "userId")) {
      await prisma.$executeRawUnsafe(
        `UPDATE "Trip" SET "ownerId" = "userId" WHERE "ownerId" IS NULL`
      );
    }
    if (await columnExists("Invoice", "userId")) {
      await prisma.$executeRawUnsafe(
        `UPDATE "Invoice" SET "createdById" = "userId" WHERE "createdById" IS NULL`
      );
    }
    if (await columnExists("WhatsappMessage", "userId")) {
      await prisma.$executeRawUnsafe(
        `UPDATE "WhatsappMessage" SET "sentByUserId" = "userId" WHERE "sentByUserId" IS NULL AND "direction" = 'OUTBOUND'`
      );
    }
    if (await columnExists("WhatsappTemplate", "userId")) {
      await prisma.$executeRawUnsafe(
        `UPDATE "WhatsappTemplate" SET "createdById" = "userId" WHERE "createdById" IS NULL`
      );
    }
  });

  // ---------------------------------------------------------------------
  // 7. Drop old unique constraints (Prisma names them <Table>_<fields>_key)
  // ---------------------------------------------------------------------
  await step("drop old userId-based unique constraints", async () => {
    const drops = [
      ["InvoiceCounter", "InvoiceCounter_userId_fiscalYear_key"],
      ["Invoice", "Invoice_userId_invoiceFy_invoiceSequence_key"],
      ["AgencySettings", "AgencySettings_userId_key"],
      ["WhatsappMessage", "WhatsappMessage_userId_idempotencyKey_key"],
      ["WhatsappTemplate", "WhatsappTemplate_userId_templateId_language_key"],
      ["WhatsappAutomationRule", "WhatsappAutomationRule_userId_trigger_key"],
    ];
    for (const [t, c] of drops) {
      if (await constraintExists(t, c)) {
        await exec(`ALTER TABLE "${t}" DROP CONSTRAINT "${c}"`);
      }
    }
  });

  // ---------------------------------------------------------------------
  // 8. Drop old FK constraints referencing User on tenant tables
  // ---------------------------------------------------------------------
  await step("drop old userId FK constraints", async () => {
    const drops = [
      ["Lead", "Lead_userId_fkey"],
      ["Trip", "Trip_userId_fkey"],
      ["Invoice", "Invoice_userId_fkey"],
      ["InvoiceCounter", "InvoiceCounter_userId_fkey"],
      ["AgencySettings", "AgencySettings_userId_fkey"],
      ["WhatsappMessage", "WhatsappMessage_userId_fkey"],
      ["WhatsappTemplate", "WhatsappTemplate_userId_fkey"],
      ["WhatsappAutomationRule", "WhatsappAutomationRule_userId_fkey"],
    ];
    for (const [t, c] of drops) {
      if (await constraintExists(t, c)) {
        await exec(`ALTER TABLE "${t}" DROP CONSTRAINT "${c}"`);
      }
    }
  });

  // ---------------------------------------------------------------------
  // 9. Drop old userId columns
  // ---------------------------------------------------------------------
  await step("drop old userId columns", async () => {
    const cols = [
      "Lead",
      "Trip",
      "Invoice",
      "InvoiceCounter",
      "AgencySettings",
      "WhatsappMessage",
      "WhatsappTemplate",
      "WhatsappAutomationRule",
    ];
    for (const t of cols) {
      if (await columnExists(t, "userId")) {
        await exec(`ALTER TABLE "${t}" DROP COLUMN "userId"`);
      }
    }
  });

  // ---------------------------------------------------------------------
  // 10. Set NOT NULL on agencyId
  // ---------------------------------------------------------------------
  await step("set agencyId NOT NULL", async () => {
    for (const t of tablesToAddAgencyId) {
      await exec(`ALTER TABLE "${t}" ALTER COLUMN "agencyId" SET NOT NULL`);
    }
  });

  // ---------------------------------------------------------------------
  // 11. Add FKs + new uniques
  // ---------------------------------------------------------------------
  await step("add agencyId FKs", async () => {
    const fks = [
      ["Lead", "Lead_agencyId_fkey", "agencyId", "Agency", "id", "CASCADE"],
      ["Trip", "Trip_agencyId_fkey", "agencyId", "Agency", "id", "CASCADE"],
      ["Invoice", "Invoice_agencyId_fkey", "agencyId", "Agency", "id", "CASCADE"],
      ["InvoiceCounter", "InvoiceCounter_agencyId_fkey", "agencyId", "Agency", "id", "CASCADE"],
      ["AgencySettings", "AgencySettings_agencyId_fkey", "agencyId", "Agency", "id", "CASCADE"],
      ["Vendor", "Vendor_agencyId_fkey", "agencyId", "Agency", "id", "CASCADE"],
      ["WhatsappMessage", "WhatsappMessage_agencyId_fkey", "agencyId", "Agency", "id", "CASCADE"],
      ["WhatsappTemplate", "WhatsappTemplate_agencyId_fkey", "agencyId", "Agency", "id", "CASCADE"],
      ["WhatsappAutomationRule", "WhatsappAutomationRule_agencyId_fkey", "agencyId", "Agency", "id", "CASCADE"],
    ];
    for (const [t, c, col, refT, refCol, action] of fks) {
      if (!(await constraintExists(t, c))) {
        await exec(
          `ALTER TABLE "${t}" ADD CONSTRAINT "${c}" FOREIGN KEY ("${col}") REFERENCES "${refT}"("${refCol}") ON DELETE ${action} ON UPDATE CASCADE`
        );
      }
    }
  });

  await step("add owner/creator FKs", async () => {
    const fks = [
      ["Lead", "Lead_ownerId_fkey", "ownerId", "User", "id", "SET NULL"],
      ["Trip", "Trip_ownerId_fkey", "ownerId", "User", "id", "SET NULL"],
      ["Invoice", "Invoice_createdById_fkey", "createdById", "User", "id", "SET NULL"],
      ["WhatsappMessage", "WhatsappMessage_sentByUserId_fkey", "sentByUserId", "User", "id", "SET NULL"],
      ["WhatsappTemplate", "WhatsappTemplate_createdById_fkey", "createdById", "User", "id", "SET NULL"],
    ];
    for (const [t, c, col, refT, refCol, action] of fks) {
      if (!(await constraintExists(t, c))) {
        await exec(
          `ALTER TABLE "${t}" ADD CONSTRAINT "${c}" FOREIGN KEY ("${col}") REFERENCES "${refT}"("${refCol}") ON DELETE ${action} ON UPDATE CASCADE`
        );
      }
    }
  });

  await step("add new unique constraints", async () => {
    const uniques = [
      ["AgencySettings", "AgencySettings_agencyId_key", `("agencyId")`],
      ["InvoiceCounter", "InvoiceCounter_agencyId_fiscalYear_key", `("agencyId","fiscalYear")`],
      ["Invoice", "Invoice_agencyId_invoiceFy_invoiceSequence_key", `("agencyId","invoiceFy","invoiceSequence")`],
      ["WhatsappMessage", "WhatsappMessage_agencyId_idempotencyKey_key", `("agencyId","idempotencyKey")`],
      ["WhatsappTemplate", "WhatsappTemplate_agencyId_templateId_language_key", `("agencyId","templateId","language")`],
      ["WhatsappAutomationRule", "WhatsappAutomationRule_agencyId_trigger_key", `("agencyId","trigger")`],
    ];
    for (const [t, c, cols] of uniques) {
      if (!(await constraintExists(t, c))) {
        await exec(`ALTER TABLE "${t}" ADD CONSTRAINT "${c}" UNIQUE ${cols}`);
      }
    }
  });

  // ---------------------------------------------------------------------
  // 12. Seed demo user password so dev login works immediately
  // ---------------------------------------------------------------------
  await step(`set demo user password (login as ${DEMO_EMAIL} / ${DEMO_PASSWORD})`, async () => {
    const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
    await prisma.user.update({
      where: { id: demoUser.id },
      data: {
        hashedPassword: hash,
        emailVerified: new Date(),
        name: demoUser.name || "Demo",
      },
    });
  });

  console.log("\n[migrate-multitenant] done ✓");
  console.log(`\n  Default agency: ${defaultAgency.name} (${defaultAgency.id})`);
  console.log(`  Login:           ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log("\n  Next: run `npx prisma db push` to apply any remaining index changes.\n");
}

main()
  .catch((err) => {
    console.error("\n[migrate-multitenant] FAILED:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
