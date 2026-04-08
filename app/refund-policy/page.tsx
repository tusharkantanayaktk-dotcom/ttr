"use client";

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "Meow Ji";

export default function RefundPolicy() {
    return (
        <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-6 py-10">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-[var(--accent)] mb-6">
                    Refund Policy
                </h1>

                <p className="text-[var(--muted)] mb-10">
                    Last updated: February 2026
                </p>

                <p className="mb-6 leading-relaxed">
                    At <strong>{BRAND}</strong>, we try to make top-ups simple and reliable.
                    Please read this policy before buying, so you know when refunds are possible.
                </p>

                {/* 1 */}
                <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
                    1. Digital Nature of Service
                </h2>
                <p className="mb-6 leading-relaxed">
                    Because game top-ups are digital, most sales are final.
                    Once a top-up is delivered to the Game ID you entered, it cannot be reversed and no refund will be issued.
                </p>

                {/* 2 */}
                <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
                    2. Non-Refundable Scenarios
                </h2>
                <p className="mb-6 leading-relaxed">
                    Refunds will <strong>not</strong> be provided in the following circumstances:
                    <br /><br />
                    • <strong>Incorrect Information:</strong> If you enter the wrong Game ID, Server, or Zone ID and the top-up is processed.
                    <br />
                    • <strong>Change of Mind:</strong> If you no longer want the virtual currency after the order starts.
                    <br />
                    • <strong>Account Issues:</strong> If your game account is banned, restricted, or suspended for reasons not related to our service.
                    <br />
                    • <strong>Used Services:</strong> If the virtual currency has already been added to and used in your game account.
                </p>

                {/* 3 */}
                <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
                    3. Eligible Refund Scenarios
                </h2>
                <p className="mb-6 leading-relaxed">
                    You may be eligible for a refund or credit under the following conditions:
                    <br /><br />
                    • <strong>Failed Delivery:</strong> If payment succeeds but the top-up is not delivered because of a technical issue on our side.
                    <br />
                    • <strong>Duplicate Charges:</strong> If you are charged twice for the same order.
                    <br />
                    • <strong>Service Unavailable:</strong> If the service you bought becomes unavailable after payment and before delivery.
                </p>

                {/* 4 */}
                <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
                    4. Refund Process
                </h2>
                <p className="mb-6 leading-relaxed">
                    To request a refund, please follow these steps:
                    <br /><br />
                    1. Contact our support team via the <a href="/contact" className="text-[var(--accent)] hover:underline">Contact Page</a> within 24 hours of the transaction.
                    2. Share your Order ID, Transaction ID, and a clear reason for the refund request.
                    3. Attach any relevant screenshots or proof of payment.
                    <br /><br />
                    Our team reviews refund requests manually. If approved, we send the refund to your original payment method or {BRAND} wallet credit within 5-7 business days.
                </p>

                {/* 5 */}
                <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
                    5. Chargebacks
                </h2>
                <p className="mb-6 leading-relaxed">
                    Starting a chargeback or payment dispute before contacting support may result
                    in permanent suspension of your {BRAND} account and reporting your Game ID to the
                    related game developers.
                </p>

                <p className="leading-relaxed mt-10">
                    If you have questions or need help with an order, please contact{" "}
                    <a href="/contact" className="text-[var(--accent)] hover:underline">
                        {BRAND} Support
                    </a>.
                </p>
            </div>
        </main>
    );
}
