import { describe, it, expect } from "vitest";
import { computePricing, buildProposalPricing, type PricingItem } from "./index";

const items: PricingItem[] = [
  { id: "1", category: "Hotel", label: "Hotel", cost: 60000 },
  { id: "2", category: "Flights", label: "Flights", cost: 30000 },
  { id: "3", category: "Activities", label: "Tour", cost: 10000 },
];

describe("computePricing", () => {
  it("applies markup then discount on the grossed-up total", () => {
    const r = computePricing({ items, markupPct: 20, discountPct: 10 });
    expect(r.totalCost).toBe(100000);
    expect(r.markupAmount).toBe(20000); // 20% of cost
    // gross = 120000, 10% discount = 12000
    expect(r.discountAmount).toBe(12000);
    expect(r.sellingPrice).toBe(108000);
    expect(r.profit).toBe(8000); // selling - cost
  });

  it("handles zero markup/discount and empty items", () => {
    expect(computePricing({ items: [], markupPct: 0 })).toEqual({
      totalCost: 0,
      markupAmount: 0,
      discountAmount: 0,
      sellingPrice: 0,
      profit: 0,
    });
  });
});

describe("buildProposalPricing (customer-safe)", () => {
  it("never leaks cost/markup/profit and sums exactly to the selling price", () => {
    const p = buildProposalPricing({ items, markupPct: 20, travelers: 2 });
    const summed = p.categories.reduce((s, c) => s + c.amount, 0);
    expect(summed).toBe(p.total); // residual absorbed — no rounding drift
    expect(p.perPerson).toBe(Math.round(p.total / 2));
    // shape must not expose internal economics
    expect(p).not.toHaveProperty("profit");
    expect(p).not.toHaveProperty("totalCost");
    expect(p).not.toHaveProperty("markupAmount");
  });

  it("defaults travellers to at least 1", () => {
    const p = buildProposalPricing({ items, markupPct: 0, travelers: 0 });
    expect(p.travelers).toBe(1);
    expect(p.perPerson).toBe(p.total);
  });
});
