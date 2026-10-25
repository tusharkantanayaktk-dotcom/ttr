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
      className="max-w-6xl mx-auto mb-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5"
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
              p-2.5 sm:p-3 cursor-pointer select-none
              flex flex-col justify-between min-h-[66px] sm:min-h-[70px]
              ${isSelected
                ? "border-[var(--accent)] bg-[var(--accent)]/[0.08] ring-1 ring-[var(--accent)] shadow-[0_0_15px_rgba(139,92,246,0.18)]"
                : "border-[var(--border)] bg-[var(--card)]/50 hover:border-[var(--accent)]/50 hover:bg-[var(--card)]/80"
              }
            `}
          >
            {/* Ambient Curvy Waves SVG in background */}
            <svg
              className="absolute -right-2 -bottom-2 w-20 h-20 pointer-events-none transition-opacity duration-300 text-[var(--accent)]"
              style={{ opacity: isSelected ? 0.16 : 0.04 }}
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 85 C 35 85, 45 45, 70 45 C 95 45, 95 15, 120 15"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M0 100 C 25 100, 35 60, 60 60 C 85 60, 90 25, 115 25"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />
            </svg>

            {/* Top-Right Curvy Notch Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-xl bg-emerald-500/15 border-b border-l border-emerald-500/30 text-emerald-500 dark:text-emerald-400 text-[8px] sm:text-[8.5px] font-black tracking-tight uppercase flex items-center gap-0.5 leading-none shadow-xs">
                <svg className="w-1.5 h-1.5 fill-current shrink-0" viewBox="0 0 12 12">
                  <path d="M6 0.5L7.3 4.2L11.2 4.6L8.3 7.2L9.2 11L6 9.1L2.8 11L3.7 7.2L0.8 4.6L4.7 4.2L6 0.5Z" />
                </svg>
                <span>{discount}% OFF</span>
              </div>
            )}

            {/* Header: Name */}
            <div className={`relative z-10 flex flex-col gap-0.5 ${discount > 0 ? "pr-14" : "pr-5"}`}>
              <div className="flex items-center justify-between gap-1.5">
                <p className={`font-bold text-[11px] sm:text-xs tracking-tight leading-tight truncate transition-colors duration-200 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--foreground)]'}`}>
                  {item.itemName}
                </p>
              </div>
            </div>

            {/* Footer: Price */}
            <div className="relative z-10 mt-1 flex items-baseline gap-1.5">
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
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-xs"
              >
                <FiCheck size={9} strokeWidth={4} />
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
