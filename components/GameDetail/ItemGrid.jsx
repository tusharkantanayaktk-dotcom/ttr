"use client";

import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";

export default function ItemGrid({
  items,
  activeItem,
  setActiveItem,
  buyPanelRef,
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.05 }
        }
      }}
      className="max-w-6xl mx-auto mb-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
    >
      {items.map((item, index) => {
        const isSelected = activeItem?.itemSlug === item.itemSlug;
        const discount = item.dummyPrice
          ? Math.round(((item.dummyPrice - item.sellingPrice) / item.dummyPrice) * 100)
          : 0;

        return (
          <motion.div
            key={item.itemSlug}
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.95 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveItem(item);
              buyPanelRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }}
            className={`
              relative overflow-hidden group
              rounded-xl border transition-all duration-300
              flex flex-col justify-between min-h-[90px] p-3.5 cursor-pointer
              ${isSelected
                ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_30px_rgba(var(--accent-rgb),0.2)] backdrop-blur-md"
                : "border-[var(--border)] bg-[var(--card)]/40 hover:border-[var(--accent)]/40 hover:bg-[var(--card)]/60 backdrop-blur-sm"
              }
            `}
          >
            {/* Glossy Shimmer Effect on Hover/Selection */}
            <div className={`absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none ${isSelected ? 'opacity-100' : 'opacity-0Group-hover:opacity-100'}`} />

            {/* Selection Indicator Glow */}
            {isSelected && (
              <motion.div
                layoutId="active-glow-main"
                className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/20 via-transparent to-[var(--accent)]/5 pointer-events-none"
              />
            )}

            {/* Header: Name & Discount */}
            <div className="relative z-10 flex flex-col gap-1">
              <div className="flex justify-between gap-2">
                <p className={`font-bold text-[11px] tracking-tight leading-tight transition-colors duration-300 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--foreground)]'}`}>
                  {item.itemName}
                </p>
                {discount > 0 && (
                  <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0 leading-none h-4 flex items-center rounded-full uppercase tracking-tighter shadow-sm">
                    {discount}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-6 bg-[var(--accent)]/30 rounded-full" />
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-[var(--accent)] text-white p-0.5 rounded-full"
                  >
                    <FiCheck size={10} strokeWidth={4} />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Footer: Price */}
            <div className="relative z-10 mt-auto pt-2">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-[10px] font-medium text-[var(--muted)]">₹</span>
                  <p className="text-lg font-black text-[var(--foreground)] tracking-tight">
                    {item.sellingPrice}
                  </p>
                </div>
              </div>
            </div>

            {/* Corner Accent Decor */}
            <div className={`absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-[var(--accent)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-3xl pointer-events-none`} />

            {/* Floating Particle Decor (Selected Only) */}
            {isSelected && (
              <div className="absolute bottom-2 right-2 flex gap-1">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                    className="w-1 h-1 bg-[var(--accent)] rounded-full blur-[1px]"
                  />
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
