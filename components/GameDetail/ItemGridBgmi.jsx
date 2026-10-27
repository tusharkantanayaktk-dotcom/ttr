"use client";

import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";

export default function ItemGridBgmi({
  items,
  activeItem,
  setActiveItem,
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.02 }
        }
      }}
      className="max-w-6xl mx-auto mb-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5"
    >
      {items.map((item) => {
        const isSelected = activeItem?.itemSlug === item.itemSlug;
        const discount = item.dummyPrice
          ? Math.round(((item.dummyPrice - item.sellingPrice) / item.dummyPrice) * 100)
          : 0;

        return (
          <motion.div
            key={item.itemSlug}
            variants={{
              hidden: { opacity: 0, y: 8, scale: 0.98 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveItem(item);
            }}
            className={`
              relative overflow-hidden group
              rounded-xl border transition-all duration-200
              p-2 sm:p-2.5 cursor-pointer select-none
              flex flex-col justify-between min-h-[68px] sm:min-h-[72px]
              ${isSelected
                ? "border-[var(--accent)] bg-[var(--accent)]/[0.08] ring-1 ring-[var(--accent)] shadow-[0_0_15px_rgba(139,92,246,0.18)]"
                : "border-[var(--border)] bg-[var(--card)]/50 hover:border-[var(--accent)]/50 hover:bg-[var(--card)]/80"
              }
            `}
          >
            {/* Rich Faceted Diamond Gemstone & Sparkles SVG Watermark */}
            <svg
              className="absolute -right-1 -bottom-1 w-20 h-20 sm:w-22 sm:h-22 pointer-events-none transition-all duration-300 text-[var(--accent)]"
              style={{ opacity: isSelected ? 0.22 : 0.055 }}
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id={`bgmi-gem-grad-${item.itemSlug}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              <polygon points="50,15 82,36 68,82 32,82 18,36" stroke={`url(#bgmi-gem-grad-${item.itemSlug})`} strokeWidth="1.5" strokeLinejoin="round" />
              <polygon points="50,15 68,82 32,82" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" strokeOpacity="0.7" />
              <line x1="18" y1="36" x2="82" y2="36" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
              <line x1="50" y1="15" x2="35" y2="36" stroke="currentColor" strokeWidth="1" strokeOpacity="0.8" />
              <line x1="50" y1="15" x2="65" y2="36" stroke="currentColor" strokeWidth="1" strokeOpacity="0.8" />
              <line x1="35" y1="36" x2="32" y2="82" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5" />
              <line x1="65" y1="36" x2="68" y2="82" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5" />
              <path d="M22 18 Q22 25 15 25 Q22 25 22 32 Q22 25 29 25 Q22 25 22 18Z" fill="currentColor" opacity="0.8" />
              <path d="M84 70 Q84 74 80 74 Q84 74 84 78 Q84 74 88 74 Q84 74 84 70Z" fill="currentColor" opacity="0.6" />
            </svg>

            {/* Top-Right Curvy Notch Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg bg-emerald-500/15 border-b border-l border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[8px] sm:text-[8.5px] font-black tracking-tight uppercase flex items-center gap-1 leading-none shadow-xs">
                <svg className="w-2 h-2 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h7v8l10-12h-7l3-8z" />
                </svg>
                <span>{discount}% OFF</span>
              </div>
            )}

            {/* Header: Name */}
            <div className={`relative z-10 flex flex-col gap-0.5 ${discount > 0 ? "pr-11 sm:pr-12" : "pr-4"}`}>
              <div className="flex items-center justify-between gap-1.5">
                <p className={`font-bold text-[10.5px] sm:text-[11.5px] tracking-tight line-clamp-2 leading-[1.2] transition-colors duration-200 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--foreground)]'}`}>
                  {item.itemName}
                </p>
              </div>
            </div>

            {/* Footer: Price */}
            <div className="relative z-10 mt-0.5 flex items-baseline gap-1.5">
              <span className="text-xs sm:text-sm font-black text-[var(--foreground)] tracking-tight">
                ₹{item.sellingPrice}
              </span>

              {item.dummyPrice && (
                <span className="text-[9.5px] sm:text-[10px] line-through text-[var(--muted)] font-medium">
                  ₹{item.dummyPrice}
                </span>
              )}
            </div>

            {/* Selected Checkmark in bottom-right */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                className="absolute bottom-2 right-2 w-4.5 h-4.5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-md shadow-[var(--accent)]/30 ring-2 ring-[var(--card)]"
              >
                <FiCheck size={10} strokeWidth={3.5} />
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
