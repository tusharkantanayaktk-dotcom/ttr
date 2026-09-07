"use client";

import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import Image from "next/image";

export default function ItemGrid({
  items,
  gameLogo,
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
          transition: { staggerChildren: 0.02 }
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
              rounded-2xl border transition-all duration-300
              flex items-center gap-3.5 min-h-[76px] p-3 cursor-pointer select-none
              ${isSelected
                ? "border-[var(--accent)] bg-[var(--accent)]/[0.08]"
                : "border-[var(--border)] bg-[var(--card)]/40 hover:border-[var(--accent)]/40 hover:bg-[var(--card)]/70"
              }
            `}
          >
            {/* Selection Checkmark */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute top-2 right-2 z-20 w-4 h-4 bg-[var(--accent)] text-black rounded-full flex items-center justify-center font-bold"
              >
                <FiCheck size={10} strokeWidth={3.5} />
              </motion.div>
            )}

            {/* Game Icon - Frameless & Crisp */}
            <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
              <Image
                src={item.itemImageId?.image || gameLogo}
                alt={item.itemName}
                fill
                sizes="44px"
                className={`object-contain transition-transform duration-300 ${isSelected ? 'scale-110 drop-shadow-sm' : 'opacity-85 group-hover:opacity-100 group-hover:scale-105'}`}
                loading="lazy"
              />
            </div>

            {/* Content: Name, Discount & Price */}
            <div className="relative z-10 flex flex-col flex-1 min-w-0 justify-center">
              <div className="flex items-center justify-between gap-1 pr-3">
                <p className={`font-extrabold text-[12px] tracking-tight leading-snug transition-colors duration-200 truncate ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--foreground)] group-hover:text-[var(--foreground)]'}`}>
                  {item.itemName}
                </p>
              </div>

              {discount > 0 && (
                <div className="mt-0.5">
                  <span className="text-[9px] font-black text-emerald-400 tracking-tight uppercase">
                    SAVE {discount}%
                  </span>
                </div>
              )}

              <div className="mt-1 flex items-baseline gap-0.5">
                <span className={`text-[10px] font-bold ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}>₹</span>
                <p className={`text-base font-black tracking-tight transition-all duration-200 ${isSelected ? 'text-[var(--foreground)]' : 'text-[var(--foreground)]/90'}`}>
                  {item.sellingPrice}
                </p>
              </div>
            </div>

            {/* Left Accent Bar for selected */}
            {isSelected && (
              <div className="absolute left-0 top-2 bottom-2 w-1 bg-[var(--accent)] rounded-r-full" />
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
