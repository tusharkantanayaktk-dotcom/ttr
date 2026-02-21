"use client";

import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import {
  FiLayout,
  FiCode,
  FiServer,
  FiArrowRight
} from "react-icons/fi";

const SERVICES = [
  {
    icon: FiLayout,
    title: "Web Design",
    description: "Modern, high-conversion interfaces designed for impact.",
  },
  {
    icon: FiCode,
    title: "Development",
    description: "Scalable full-stack applications built with precision.",
  },
  {
    icon: FiServer,
    title: "Operations",
    description: "Performance-optimized server and cloud management.",
  },
];

export default function HomeServices() {
  return (
    <section className="py-24 px-6 bg-[var(--background)]">
      <div className="max-w-5xl mx-auto">

        {/* --- HEADER --- */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="h-px w-8 bg-[var(--accent)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent)]">Solutions</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-semibold text-[var(--foreground)] tracking-tight"
          >
            Our Services
          </motion.h2>
        </div>

        {/* --- GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {SERVICES.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i + 0.2 }}
              className="group cursor-default"
            >
              <div className="text-[var(--accent)] mb-6 transition-transform duration-500 group-hover:scale-110">
                <service.icon size={32} strokeWidth={1.5} />
              </div>

              <h3 className="text-xl font-medium text-[var(--foreground)] mb-3 tracking-tight group-hover:text-[var(--accent)] transition-colors">
                {service.title}
              </h3>

              <p className="text-[var(--muted)] text-sm leading-relaxed mb-6 opacity-70">
                {service.description}
              </p>

              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-all duration-300">
                Details <FiArrowRight />
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- CTA --- */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-24 pt-12 border-t border-[var(--border)] group"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h4 className="text-2xl font-medium mb-2">Ready to start?</h4>
              <p className="text-[var(--muted)] text-sm">Let&apos;s build something exceptional together.</p>
            </div>

            <motion.a
              href="https://wa.me/919178521537"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-10 py-5 rounded-full bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--accent)] hover:text-white transition-all duration-500 shadow-2xl font-bold uppercase tracking-widest text-xs"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaWhatsapp className="text-xl" />
              <span>Sync with us</span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
