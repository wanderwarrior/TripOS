import { LegalDoc } from "@/components/marketing/legal-doc";

export const dynamic = "force-dynamic";
export const metadata = { title: "Terms of Service · tripOS" };

export default function TermsPage() {
  return (
    <LegalDoc title="Terms of Service" updated="May 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use
        of tripOS (the &quot;Service&quot;), operated by tripOS. By
        creating an account or using the Service, you agree to these Terms.
      </p>

      <h2>1. Accounts &amp; agencies</h2>
      <p>
        You must provide accurate information when registering an agency
        account. You are responsible for safeguarding your login credentials
        and for all activity under your account and that of team members you
        invite. The agency owner is responsible for managing team access and
        billing.
      </p>

      <h2>2. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the Service for unlawful purposes or to send spam;</li>
        <li>
          upload content that infringes the rights of others or violates
          applicable law;
        </li>
        <li>
          attempt to disrupt, reverse-engineer, or gain unauthorised access to
          the Service or other agencies&apos; data;
        </li>
        <li>
          use the messaging features in breach of WhatsApp / Meta policies or
          telecom regulations.
        </li>
      </ul>

      <h2>3. Customer data</h2>
      <p>
        You retain ownership of the data you and your team enter (contacts,
        travellers, trips, financial records). You are responsible for having a
        lawful basis to store and process the personal data of your customers,
        including passport and payment details, and for complying with
        applicable data-protection law. Our handling of data is described in our{" "}
        <a href="/legal/privacy">Privacy Policy</a>.
      </p>

      <h2>4. Subscriptions &amp; billing</h2>
      <p>
        Paid plans are billed in advance on a recurring basis. Trials convert to
        the selected plan unless cancelled. Fees are exclusive of applicable
        taxes (including GST), which will be added where required. Refunds, where
        applicable, are governed by our{" "}
        <a href="/legal/refund">Refund Policy</a>.
      </p>

      <h2>5. Third-party services</h2>
      <p>
        The Service integrates third-party providers (e.g. WhatsApp Cloud API,
        Razorpay, AI providers). Your use of those features is also subject to
        the respective providers&apos; terms. We are not responsible for outages
        or changes in third-party services.
      </p>

      <h2>6. Availability &amp; changes</h2>
      <p>
        We strive for high availability but do not guarantee uninterrupted
        service. We may modify or discontinue features with reasonable notice.
        We may update these Terms; continued use after changes constitutes
        acceptance.
      </p>

      <h2>7. Termination</h2>
      <p>
        You may cancel at any time from your billing settings. We may suspend or
        terminate accounts that violate these Terms. On termination you may
        export your data for a reasonable period before deletion.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the extent permitted by law, the Service is provided &quot;as is&quot;
        and our aggregate liability is limited to the fees you paid in the twelve
        months preceding the claim. We are not liable for indirect or
        consequential losses.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about these Terms? Email{" "}
        <a href="mailto:legal@tripcraft.app">legal@tripcraft.app</a>.
      </p>
    </LegalDoc>
  );
}
