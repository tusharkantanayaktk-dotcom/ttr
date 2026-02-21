"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const storyData = [
  {
    id: 2,
    title: "MLBB India",
    image: "https://res.cloudinary.com/dk0sslz1q/image/upload/v1768500739/kapkap_20260115220221554_sys_inhh1f.jpg",
    link: "/games/mobile-legends988",
    color: "from-blue-400 to-indigo-600",
    isLive: true
  },
  {
    id: 3,
    title: "BGMI UC",
    image: "https://res.cloudinary.com/dk0sslz1q/image/upload/v1768502877/WhatsApp_Image_2026-01-16_at_00.15.15_sbkqaz.jpg",
    link: "/games/pubg-mobile138",
    color: "from-orange-400 to-red-600",
    isLive: true
  },
  {
    id: 4,
    title: "Double Pack",
    image: "https://res.cloudinary.com/dk0sslz1q/image/upload/v1768500738/kapkap_20260115220013809_sys_zicwwk.jpg",
    link: "/games/mlbb-double332",
    color: "from-purple-400 to-rose-600",
    isLive: false
  },
  {
    id: 5,
    title: "Member",
    image: "https://res.cloudinary.com/dk0sslz1q/image/upload/v1767096434/rs_klee62.png",
    link: "/games/membership/silver-membership",
    color: "from-emerald-400 to-teal-600",
    isLive: false
  },
];

export default function StorySlider() {
  const containerRef = useRef(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 30 }
    }
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto mt-2 md:mt-4 px-4 overflow-hidden">
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex gap-6 md:gap-10 overflow-x-auto py-6
        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden touch-pan-x snap-x"
      >
        {storyData.map((item) => (
          <motion.div key={item.id} variants={itemVariants} className="flex-shrink-0 snap-start">
            <Link
              href={item.link}
              className="group flex flex-col items-center gap-3 cursor-pointer"
            >
              {/* COMPACT AVATAR */}
              <div className="relative">
                {/* ACTIVE RING */}
                <div className={`
                  absolute -inset-1.5 rounded-full border border-white/5 bg-gradient-to-tr ${item.color} 
                  opacity-30 group-hover:opacity-100 transition-opacity duration-500 scale-90 group-hover:scale-110 
                  blur-md group-hover:blur-lg
                `} />

                <div className={`
                  relative w-16 h-16 md:w-20 md:h-20 rounded-full 
                  p-[3px] bg-gradient-to-tr ${item.color} 
                  shadow-xl transition-transform duration-500 
                  group-active:scale-90
                `}>
                  <div className="w-full h-full rounded-full border-[2.5px] border-[var(--background)] overflow-hidden relative">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="100px"
                      className="object-cover transition-transform duration-700 group-hover:scale-115 grayscale group-hover:grayscale-0"
                    />
                    {/* GLASS SHINE */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* LIVE INDICATOR */}
                {item.isLive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20">
                    <div className="flex items-center gap-1 bg-white text-black text-[9px] font-black px-2 py-0.5 rounded-full shadow-2xl border border-black/5 uppercase tracking-tighter italic">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                      </span>
                      Trending
                    </div>
                  </div>
                )}
              </div>

              {/* TITLE */}
              <span className="text-[10px] md:text-[11px] font-black text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors duration-300 uppercase tracking-widest text-center">
                {item.title}
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
