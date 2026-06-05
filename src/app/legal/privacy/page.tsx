import { LegalDoc } from "@/components/marketing/legal-doc";

export const dynamic = "force-dynamic";
export const metadata = { title: "Privacy Policy · tripOS" };

export default function PrivacyPage() {
  return (
    <LegalDoc title="Privacy Policy" updated="May 2026">
      <p>
        This Privacy Policy explains how tripOS collects, uses, and protects
        information when you use the Service. We act as a processor for the
        customer data your agency stores, and as a controller for your account
        and billing information.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li>
          <strong>Account data</strong> — your name, email, agency details, and
          hashed password.
        </li>
        <li>
          <strong>Agency content</strong> — contacts, travellers (including
          passport and travel details you enter), trips, quotes, invoices,
          messages, and payment records.
        </li>
        <li>
          <strong>Usage &amp; technical data</strong> — log data needed to
          operate and secure the Service.
        </li>
        <li>
          <strong>Billing data</strong> — handled by our payment processor;
          we do not store full card numbers.
        </li>
      </ul>

      <h2>2. How we use information</h2>
      <ul>
        <li>to provide, maintain, and improve the Service;</li>
        <li>to process subscriptions and send service communications;</li>
        <li>to generate AI itineraries (briefs are sent to our AI provider);</li>
        <li>to deliver messages you send via WhatsApp;</li>
        <li>to detect, prevent, and address security issues.</li>
      </ul>

      <h2>3. Sharing &amp; sub-processors</h2>
      <p>
        We share data only with sub-processors needed to run the Service —
        including our hosting provider, database, AI provider, Razorpay
        (payments), and Meta (WhatsApp). We do not sell your data.
      </p>

      <h2>4. Data security</h2>
      <p>
        Data is isolated per agency. Access is permission-controlled, traffic is
        encrypted in transit, and passwords are stored hashed. No system is
        perfectly secure, but we take reasonable measures to protect your data.
      </p>

      <h2>5. Retention &amp; your rights</h2>
      <p>
        We retain data for as long as your account is active. You may request
        export or deletion of your agency&apos;s data, subject to legal
        retention requirements (e.g. tax invoices). Your customers&apos; rights
        requests should be directed to your agency, for whom you are the
        controller.
      </p>

      <h2>6. International &amp; legal basis</h2>
      <p>
        We process data in line with applicable Indian data-protection law
        (including the DPDP Act) and other laws relevant to your use.
      </p>

      <h2>7. Contact</h2>
      <p>
        Privacy questions or requests? Email{" "}
        <a href="mailto:privacy@tripcraft.app">privacy@tripcraft.app</a>.
      </p>
    </LegalDoc>
  );
}
