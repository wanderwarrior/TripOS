export type LineItemCategory = "Hotel" | "Transport" | "Activities" | "Flights" | "Other";

export type PricingItem = {
  id: string;
  category: LineItemCategory;
  label: string;
  cost: number;
};

export type PricingState = {
  items: PricingItem[];
  markupPct: number;
  discountPct?: number;
};

export type PricingSummary = {
  totalCost: number;
  markupAmount: number;
  discountAmount: number;
  sellingPrice: number;
  profit: number;
};

export function computePricing(state: PricingState): PricingSummary {
  const totalCost = state.items.reduce(
    (sum, i) => sum + (Number(i.cost) || 0),
    0
  );
  const markupPct = Number(state.markupPct) || 0;
  const discountPct = Number(state.discountPct) || 0;
  const markupAmount = Math.round(totalCost * (markupPct / 100));
  const gross = totalCost + markupAmount;
  const discountAmount = Math.round(gross * (discountPct / 100));
  const sellingPrice = gross - discountAmount;
  const profit = sellingPrice - totalCost;
  return { totalCost, markupAmount, discountAmount, sellingPrice, profit };
}
