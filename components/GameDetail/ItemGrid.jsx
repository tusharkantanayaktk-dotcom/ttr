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
              rounded-2xl border transition-all duration-500
              flex items-center gap-3 min-h-[82px] p-3 cursor-pointer
              ${isSelected
                ? "border-[var(--accent)] bg-[var(--accent)]/[0.08] shadow-lg shadow-[var(--accent)]/5"
                : "border-[var(--border)] bg-white/[0.02] hover:border-[var(--accent)]/30 hover:bg-white/[0.04]"
              }
            `}
          >
            {/* Selection Checkmark */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute top-1.5 right-1.5 z-20 w-4.5 h-4.5 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20"
              >
                <FiCheck size={11} strokeWidth={4} />
              </motion.div>
            )}

            {/* Game Icon */}
            <div className={`
              relative w-10 h-10 rounded-xl overflow-hidden shrink-0 transition-all duration-500
              ${isSelected ? "ring-1 ring-[var(--accent)]/50 scale-105" : "grayscale opacity-50 group-hover:opacity-80 group-hover:grayscale-0"}
            `}>
              <Image
                src={gameLogo}
                alt="game"
                fill
                sizes="40px"
                className="object-cover"
                loading="lazy"
              />
            </div>

            {/* Header: Name & Price */}
            <div className="relative z-10 flex flex-col flex-1 h-full justify-between overflow-hidden">
              <div className="flex flex-col">
                <p className={`font-black text-[11px] uppercase tracking-tight transition-colors duration-300 truncate ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}>
                  {item.itemName}
                </p>
                {discount > 0 && (
                  <span className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter opacity-80">
                    SAVE {discount}%
                  </span>
                )}
              </div>

              <div className="mt-1 flex items-baseline gap-1">
                <span className={`text-[9px] font-bold ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--muted)]'} opacity-50`}>₹</span>
                <p className={`text-base font-black tracking-tighter transition-all duration-300 ${isSelected ? 'text-[var(--foreground)] scale-105 origin-left' : 'text-[var(--muted)]'}`}>
                  {item.sellingPrice}
                </p>
              </div>
            </div>

            {/* Selection Background Glow */}
            {isSelected && (
              <motion.div
                layoutId="active-card-glow"
                className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent pointer-events-none"
              />
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
