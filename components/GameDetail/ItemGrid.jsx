"use client";

import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import Image from "next/image";

export default function ItemGrid({
  items,
  gameLogo,
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
      className="max-w-6xl mx-auto mb-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5"
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
              hidden: { opacity: 0, y: 12, scale: 0.98 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveItem(item)}
            className={`
              relative overflow-hidden group
              rounded-2xl border transition-all duration-200
              p-3 sm:p-3.5 cursor-pointer select-none
              flex items-center gap-2.5 sm:gap-3.5
              ${isSelected
                ? "border-[var(--accent)] bg-[var(--accent)]/[0.07] ring-1 ring-[var(--accent)] shadow-[0_4px_20px_rgba(255,46,99,0.12)]"
                : "border-[var(--border)] bg-[var(--card)]/50 hover:border-[var(--accent)]/40 hover:bg-[var(--card)]/90"
              }
            `}
          >
            {/* Top-Right Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[8.5px] sm:text-[9px] font-black tracking-tight uppercase leading-none">
                SAVE {discount}%
              </div>
            )}

            {/* Game / Item Icon */}
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0 flex items-center justify-center">
              <Image
                src={item.itemImageId?.image || gameLogo}
                alt={item.itemName}
                fill
                sizes="48px"
                className={`object-contain transition-transform duration-200 ${
                  isSelected ? "scale-105 drop-shadow-sm" : "opacity-90 group-hover:scale-105 group-hover:opacity-100"
                }`}
                loading="lazy"
              />
            </div>

            {/* Content: Name & Price */}
            <div className="flex-1 min-w-0 flex flex-col justify-center pr-0.5">
              <p className={`text-xs sm:text-sm font-bold tracking-tight truncate transition-colors ${
                isSelected ? "text-[var(--accent)]" : "text-[var(--foreground)]"
              }`}>
                {item.itemName}
              </p>

              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-sm sm:text-base font-black text-[var(--foreground)] tracking-tight">
                  ₹{item.sellingPrice}
                </span>

                {item.dummyPrice && (
                  <span className="text-[10px] sm:text-xs line-through text-[var(--muted)] font-semibold">
                    ₹{item.dummyPrice}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
