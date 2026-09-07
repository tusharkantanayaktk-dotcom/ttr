"use client";

import { FiShield, FiZap, FiLock, FiHeadphones } from "react-icons/fi";

const FEATURES = [
  {
    icon: FiShield,
    title: "100% Official",
    desc: "Direct top-ups through authorized official channels."
  },
  {
    icon: FiZap,
    title: "Instant Delivery",
    desc: "Automatic fulfillment in seconds after payment."
  },
  {
    icon: FiLock,
    title: "Safe & Secure",
    desc: "Encrypted payment gateways with zero risk."
  },
  {
    icon: FiHeadphones,
    title: "24/7 Support",
    desc: "Dedicated support team available anytime."
  }
];

export default function TronicsWho() {
  return (
    <section className="py-4 sm:py-6 px-4 bg-[var(--background)] relative overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-5 sm:mb-6">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <div className="h-px w-6 bg-gradient-to-r from-transparent to-[var(--accent)]" />
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.25em] text-[var(--accent)]">About Us</span>
            <div className="h-px w-6 bg-gradient-to-l from-transparent to-[var(--accent)]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-[var(--foreground)] leading-tight mb-2">
            Why Choose <span className="text-[var(--accent)]">Tronics?</span>
          </h2>
          <p className="text-xs text-[var(--muted)] font-normal max-w-xl mx-auto leading-relaxed px-2">
            Your trusted destination for fast, verified, and secure gaming top-ups with instant delivery.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="p-3.5 sm:p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] group hover:border-[var(--accent)]/40 transition-colors overflow-hidden relative"
            >
              <div className="relative z-10">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mb-2.5 group-hover:bg-[var(--accent)] group-hover:text-black transition-colors">
                  <feature.icon size={16} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-tight text-[var(--foreground)] mb-1 group-hover:text-[var(--accent)] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-[var(--muted)] font-normal leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
