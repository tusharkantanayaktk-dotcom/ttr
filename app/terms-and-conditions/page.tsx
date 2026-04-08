"use client";

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "Meow Ji";

export default function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-6 py-10">
      <div className="max-w-4xl mx-auto">
        
        <h1 className="text-4xl font-bold text-[var(--accent)] mb-6">
          Terms & Conditions
        </h1>

        <p className="text-[var(--muted)] mb-10">
          Last updated: December 2025
        </p>

        <p className="mb-6 leading-relaxed">
          Welcome to <strong>{BRAND}</strong>. By accessing or using our website,
          placing an order, or using our services, you agree to these Terms &
          Conditions. If you do not agree, please do not use our
          platform.
        </p>

        {/* 1 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          1. Use of the Platform
        </h2>
        <p className="mb-6 leading-relaxed">
          You agree to use {BRAND} only for legal purposes and follow these Terms.
          <br /><br />
          You must make sure all details you enter at checkout - such as
          game ID, server/zone, and contact details — is accurate. Incorrect
          details may cause failed top-ups that cannot be reversed.
        </p>

        {/* 2 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          2. Orders & Top-Ups
        </h2>
        <p className="mb-6 leading-relaxed">
          • All top-up orders are processed automatically or with manual review.  
          <br />
          • Once an order is successfully delivered, it is considered final.  
          <br />
          • We are not responsible for loss caused by incorrect details
          (wrong game ID, server, or account).
          <br /><br />
          By placing an order, you confirm that you own the account or have
          permission to top up that account.
        </p>

        {/* 3 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          3. Payments
        </h2>
        <p className="mb-6 leading-relaxed">
          Payments are processed through trusted third-party payment gateways.
          {BRAND} does not store sensitive payment details such as card
          details or UPI credentials.
          <br /><br />
          Orders may be delayed or canceled because of payment failure,
          suspected fraud, or system issues.
        </p>

        {/* 4 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          4. Refunds & Cancellations
        </h2>
        <p className="mb-6 leading-relaxed">
          Due to the digital and instant nature of game top-ups:
          <br /><br />
          • Successfully delivered top-ups are <strong>non-refundable</strong>.  
          <br />
          • Refunds may be considered only if the order fails and the balance is
          not credited to the game account.
          <br /><br />
          Refund decisions are made by {BRAND} after review.
        </p>

        {/* 5 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          5. Prohibited Activities
        </h2>
        <p className="mb-6 leading-relaxed">
          You must not:
          <br /><br />
          • Attempt to exploit pricing, system bugs, or promotions  
          <br />
          • Use the platform for fraudulent or unauthorized transactions  
          <br />
          • Try to break platform security or automated systems  
          <br />
          • Resell services without written permission (unless explicitly allowed)
        </p>

        {/* 6 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          6. Third-Party Games & Trademarks
        </h2>
        <p className="mb-6 leading-relaxed">
          {BRAND} is an independent platform and is <strong>not affiliated with,
          endorsed by, or sponsored by</strong> any game publisher.
          <br /><br />
          All game names, logos, and trademarks belong to their owners.
        </p>

        {/* 7 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          7. Limitation of Liability
        </h2>
        <p className="mb-6 leading-relaxed">
          {BRAND} is not responsible for:
          <br /><br />
          • Loss caused by incorrect user information  
          <br />
          • Delays due to maintenance, API downtime, or external providers  
          <br />
          • Game account bans or actions taken by game publishers  
          <br />
          • Indirect damages
        </p>

        {/* 8 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          8. Changes to Terms
        </h2>
        <p className="leading-relaxed">
          {BRAND} may update these Terms & Conditions at any time.
          Changes take effect when posted on this page.
          If you continue using the platform, you accept the updated
          terms.
        </p>
      </div>
    </main>
  );
}
