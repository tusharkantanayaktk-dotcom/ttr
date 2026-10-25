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
      className="max-w-6xl mx-auto mb-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3"
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
              hidden: { opacity: 0, y: 10, scale: 0.98 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
            whileHover={{ y: -2.5, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveItem(item);
            }}
            className={`
              relative overflow-hidden group
              rounded-2xl sm:rounded-[1.25rem] border transition-all duration-200
              p-2.5 sm:p-3 cursor-pointer select-none
              flex flex-col justify-between min-h-[68px] sm:min-h-[74px]
              ${isSelected
                ? "border-[var(--accent)] bg-gradient-to-br from-[var(--accent)]/[0.14] via-[var(--card)]/90 to-[var(--accent)]/[0.04] ring-1 ring-[var(--accent)] shadow-[0_4px_22px_rgba(139,92,246,0.18)]"
                : "border-[var(--border)] bg-[var(--card)]/50 hover:border-[var(--accent)]/50 hover:bg-[var(--card)]/80 hover:shadow-xs"
              }
            `}
          >
            {/* Ambient Curvy Waves SVG in background */}
            <svg
              className="absolute -right-3 -bottom-3 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none transition-all duration-300 text-[var(--accent)]"
              style={{
                opacity: isSelected ? 0.22 : 0.06,
                transform: isSelected ? "scale(1.1) rotate(-6deg)" : "scale(1)",
              }}
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 90 C 35 90, 40 50, 65 50 C 90 50, 92 18, 115 18"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M5 105 C 30 105, 35 65, 65 65 C 95 65, 97 32, 125 32"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="4 4"
              />
              <circle cx="82" cy="22" r="12" fill="currentColor" opacity="0.3" />
            </svg>

            {/* Top Curvy Arc Highlight */}
            <svg
              className="absolute top-0 left-0 right-0 h-1.5 w-full pointer-events-none"
              viewBox="0 0 100 6"
              preserveAspectRatio="none"
              fill="none"
            >
              {isSelected && (
                <path
                  d="M0 0 C 30 4, 70 4, 100 0"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                  opacity="0.7"
                />
              )}
            </svg>

            {/* Header: Name & Discount */}
            <div className="relative z-10 flex flex-col gap-0.5">
              <div className="flex items-center justify-between gap-1.5">
                <p className={`font-bold text-[11px] sm:text-xs tracking-tight leading-tight truncate transition-colors duration-200 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--foreground)]'}`}>
                  {item.itemName}
                </p>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="shrink-0 w-3.5 h-3.5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-xs"
                  >
                    <FiCheck size={9} strokeWidth={4} />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Footer: Price & Discount badge */}
            <div className="relative z-10 mt-1 sm:mt-1.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-[var(--foreground)] tracking-tight">
                ₹{item.sellingPrice}
              </span>

              {item.dummyPrice && (
                <span className="text-[9.5px] sm:text-[10.5px] line-through text-[var(--muted)] font-medium">
                  ₹{item.dummyPrice}
                </span>
              )}

              {discount > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[7.5px] sm:text-[8.5px] font-black tracking-tight uppercase leading-none shadow-2xs">
                  <svg className="w-1.5 h-1.5 fill-current shrink-0" viewBox="0 0 12 12">
                    <path d="M6 0.5L7.3 4.2L11.2 4.6L8.3 7.2L9.2 11L6 9.1L2.8 11L3.7 7.2L0.8 4.6L4.7 4.2L6 0.5Z" />
                  </svg>
                  SAVE {discount}%
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
