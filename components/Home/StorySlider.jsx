"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const storyData = [
  // {
  //   id: 1,
  //   title: "Value Pass",
  //   image:
  //     "https://res.cloudinary.com/dk0sslz1q/image/upload/v1768671923/WhatsApp_Image_2026-01-17_at_22.58.12_nfcotg.jpg",
  //   link: "/games/value-pass-ml948",
  //   color: "from-pink-500 to-rose-500",
  // },
  {
    id: 2,
    title: "MLBB India",
    image:
      "https://res.cloudinary.com/dk0sslz1q/image/upload/v1768500739/kapkap_20260115220221554_sys_inhh1f.jpg",
    link: "/games/mobile-legends988",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 3,
    title: "BGMI",
    image:
      "https://res.cloudinary.com/dk0sslz1q/image/upload/v1768502877/WhatsApp_Image_2026-01-16_at_00.15.15_sbkqaz.jpg",
    link: "/games/pubg-mobile138",
    color: "from-amber-400 to-orange-500",
  },
  {
    id: 4,
    title: "MLBB Double",
    image:
      "https://res.cloudinary.com/dk0sslz1q/image/upload/v1768500738/kapkap_20260115220013809_sys_zicwwk.jpg",
    link: "/games/mlbb-double332",
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: 5,
    title: "Membership",
    image:
      "https://res.cloudinary.com/dk0sslz1q/image/upload/v1767096434/rs_klee62.png",
    link: "/games/membership/silver-membership",
    color: "from-emerald-400 to-teal-500",
  },
];

export default function StorySlider() {
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll capability
  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.5, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto mt-4 px-2">
      <motion.div
        ref={containerRef}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto px-4 py-4
        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden touch-pan-x"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {storyData.map((item, i) => (
          <motion.div key={item.id} variants={itemVariants} className="flex-shrink-0 scroll-snap-align-start">
            <Link
              href={item.link}
              className="group flex flex-col items-center gap-2 cursor-pointer relative"
            >
              {/* IMAGE CONTAINER */}
              <div className="relative w-[72px] h-[72px] md:w-[84px] md:h-[84px]">

                {/* Rotating Border Ring */}
                <div
                  className={`absolute -inset-[3px] rounded-full bg-linear-to-tr ${item.color} p-[2px] opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:rotate-180`}
                >
                  <div className="w-full h-full rounded-full bg-[var(--background)]" />
                </div>

                {/* Image Circle */}
                <div className="absolute inset-0 rounded-full border-[3px] border-[var(--background)] overflow-hidden z-10">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="100px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Glass Shine Effect */}
                  <div className="absolute inset-0 bg-linear-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>

                {/* Hot Badge (Static) */}
                {i < 2 && (
                  <div className="absolute bottom-0 right-0 z-20">
                    <div className="bg-red-600 text-[8px] text-white font-bold px-1.5 py-0.5 rounded-full border-2 border-[var(--background)] shadow-sm">
                      HOT
                    </div>
                  </div>
                )}
              </div>

              {/* TITLE */}
              <span className="text-[10px] md:text-xs font-semibold text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors duration-300 text-center max-w-[80px] truncate leading-tight">
                {item.title}
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
