"use client";

import { FaInstagram, FaTwitter, FaDiscord, FaEnvelope, FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import { useSupportConfig } from "@/lib/useSupportConfig";

export default function ContactPage() {
  const supportConfig = useSupportConfig();

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-6 py-15">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12">
        {/* 📨 Left - Contact Info */}
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl font-bold text-[var(--accent)] mb-4">
            Contact Us
          </h1>
          <p className="text-[var(--muted)] leading-relaxed text-base sm:text-lg">
            Have a question or need help with an order?
            Reach out to us by email, phone, or social media. We're here to help!
          </p>

          {/* ✉️ Email Highlight Box */}
          <div className="p-6 border border-[var(--border)] rounded-2xl bg-[var(--card)]">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
              Email us at:
            </p>
            <a
              href={`mailto:${supportConfig.email}`}
              className="text-xl font-semibold text-[var(--accent)] hover:underline break-all"
            >
              {supportConfig.email}
            </a>
          </div>

          {/* 📞 Phone & WhatsApp Box */}
          <div className="p-6 border border-[var(--border)] rounded-2xl bg-[var(--card)]">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
              Call or WhatsApp us at:
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={supportConfig.phoneTel}
                className="text-xl font-semibold text-[var(--accent)] hover:underline"
              >
                {supportConfig.phone}
              </a>
              <a
                href={supportConfig.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
              >
                <FaWhatsapp size={14} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* 🌐 Social Links */}
          <div className="flex flex-wrap gap-4 mt-6">
            <a
              href={supportConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Support"
              className="p-3 rounded-full bg-[var(--card)] border border-[var(--border)] hover:bg-emerald-500 hover:text-white transition-all"
            >
              <FaWhatsapp size={22} />
            </a>
            <a
              href={supportConfig.phoneTel}
              aria-label="Phone Support"
              className="p-3 rounded-full bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white transition-all"
            >
              <FaPhoneAlt size={20} />
            </a>
            <a
              href={supportConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-3 rounded-full bg-[var(--card)] border border-[var(--border)] hover:bg-pink-600 hover:text-white transition-all"
            >
              <FaInstagram size={22} />
            </a>
            <a
              href={supportConfig.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="p-3 rounded-full bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white transition-all"
            >
              <FaTwitter size={22} />
            </a>
            <a
              href={supportConfig.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
              className="p-3 rounded-full bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white transition-all"
            >
              <FaDiscord size={22} />
            </a>
            <a
              href={`mailto:${supportConfig.email}`}
              aria-label="Email Support"
              className="p-3 rounded-full bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white transition-all"
            >
              <FaEnvelope size={22} />
            </a>
          </div>
        </div>

        {/* 🗺️ Right - Map */}
        <div className="flex-1 h-[400px] rounded-2xl overflow-hidden border border-[var(--border)]">
          <iframe
            title="Zyronix Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d367144.18514800455!2d77.3507349913945!3d28.63530884925121!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d032d37b1b7e9%3A0xf95cb0af544e3a5d!2sIndia!5e0!3m2!1sen!2sin!4v1697641137830!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
          ></iframe>
        </div>
      </div>

      {/* ✅ Footer Message */}
      <div className="mt-16 text-center text-[var(--muted)] text-sm">
        <p>We usually reply within 24 hours.</p>
      </div>
    </main>
  );
}
