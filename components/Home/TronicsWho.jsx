"use client";

import { motion } from "framer-motion";
import { FiTarget, FiBox, FiShield, FiHeart } from "react-icons/fi";

const FEATURES = [
  {
    icon: FiBox,
    title: "100% Legal",
    desc: "We use only official game channels for all top-ups."
  },
  {
    icon: FiTarget,
    title: "Super Fast",
    desc: "Get your game credits in seconds after you pay."
  },
  {
    icon: FiShield,
    title: "Safe Payments",
    desc: "Your payment is always 100% safe and secure."
  },
  {
    icon: FiHeart,
    title: "24/7 Support",
    desc: "We are here to help you anytime, day or night."
  }
];

export default function TronicsWho() {
  return (
    <section className="py-8 px-4 bg-[var(--background)] relative overflow-hidden">
      {/* Background Subtle Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)] opacity-[0.02] blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent)] opacity-[0.02] blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div 
           className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
             <div className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--accent)]" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent)] opacity-70">About Tronics</span>
             <div className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--accent)]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-[var(--foreground)] leading-none mb-4">
             Who is <span className="text-[var(--accent)]">Tronics?</span>
          </h2>
          <p className="text-xs md:text-sm text-[var(--muted)] font-medium max-w-2xl mx-auto leading-relaxed px-4 opacity-80">
             Tronics Store is your trusted shop for fast and safe game top-ups in India. We make it easy for you to get your game credits instantly, so you can focus on playing and winning.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {FEATURES.map((feature, i) => (
             <div
               key={i}
               className="p-5 md:p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] group hover:border-[var(--accent)]/40 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] transition-all duration-500 overflow-hidden relative"
             >
               {/* Inner Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] mb-4 group-hover:bg-[var(--accent)] group-hover:text-black transition-all duration-500">
                  <feature.icon size={18} />
                </div>
                <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-[var(--foreground)] mb-2 group-hover:text-[var(--accent)] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[10px] md:text-xs text-[var(--muted)] font-medium leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Line */}
      <div className="max-w-4xl mx-auto mt-4 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent opacity-20" />
    </section>
  );
}
