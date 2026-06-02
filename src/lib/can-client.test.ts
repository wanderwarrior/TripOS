import { describe, it, expect } from "vitest";
import { can } from "./can-client";

// Guards the role/permission matrix. This is the regression net for the bug
// where a VIEWER could cancel an invoice — invoice:cancel must stay
// owner/staff-only. Keep in sync with VIEWER_ACTIONS/STAFF_ACTIONS in session.ts.

describe("can() — permission matrix", () => {
  it("OWNER can do everything", () => {
    expect(can("OWNER", "invoice:cancel")).toBe(true);
    expect(can("OWNER", "team:remove")).toBe(true);
    expect(can("OWNER", "agency:settings")).toBe(true);
  });

  it("STAFF can run the day-to-day but not owner-only admin", () => {
    expect(can("STAFF", "invoice:create")).toBe(true);
    expect(can("STAFF", "invoice:cancel")).toBe(true);
    expect(can("STAFF", "booking:cancel")).toBe(true);
    // owner-only administration
    expect(can("STAFF", "team:remove")).toBe(false);
    expect(can("STAFF", "agency:settings")).toBe(false);
  });

  it("VIEWER is read-only — and CANNOT cancel/issue invoices", () => {
    expect(can("VIEWER", "invoice:read")).toBe(true);
    expect(can("VIEWER", "trip:read")).toBe(true);
    // the bug we fixed: viewers must never mutate invoices
    expect(can("VIEWER", "invoice:cancel")).toBe(false);
    expect(can("VIEWER", "invoice:issue")).toBe(false);
    expect(can("VIEWER", "invoice:create")).toBe(false);
    expect(can("VIEWER", "payment:create")).toBe(false);
    expect(can("VIEWER", "quote:share")).toBe(false);
  });
});
