import { LegalDoc } from "@/components/marketing/legal-doc";

export const dynamic = "force-dynamic";
export const metadata = { title: "Refund Policy · tripOS" };

export default function RefundPage() {
  return (
    <LegalDoc title="Refund &amp; Cancellation Policy" updated="May 2026">
      <p>
        This policy covers your tripOS subscription. It does not cover
        payments your agency collects from its own customers — those are
        governed by your agency&apos;s own terms.
      </p>

      <h2>1. Free trial</h2>
      <p>
        New agencies start on a free trial with no charge and no card required.
        You will only be billed if you choose a paid plan.
      </p>

      <h2>2. Cancellation</h2>
      <p>
        You can cancel anytime from your billing settings. Cancellation stops
        future renewals; your plan remains active until the end of the current
        billing period, after which the account moves to limited access.
      </p>

      <h2>3. Refunds</h2>
      <ul>
        <li>
          Monthly plans are non-refundable for the current period once charged.
        </li>
        <li>
          Annual plans may be eligible for a pro-rata refund of unused full
          months if cancelled within the first 30 days — at our discretion.
        </li>
        <li>
          If you were charged in error or experienced a material service
          failure, contact us and we&apos;ll make it right.
        </li>
      </ul>

      <h2>4. How to request</h2>
      <p>
        Email <a href="mailto:billing@tripcraft.app">billing@tripcraft.app</a>{" "}
        from your registered address with your agency name. Approved refunds are
        returned to the original payment method, typically within 5–7 business
        days.
      </p>
    </LegalDoc>
  );
}
