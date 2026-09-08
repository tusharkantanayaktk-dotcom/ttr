"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const storyData = [
  {
    id: 1,
    title: "MLBB Small",
    image: "/game-assets/mlbb-small.jpg",
    link: "/games/mobile-legends-philippines888",
    color: "from-amber-400 via-pink-500 to-rose-500",
  },
  {
    id: 2,
    title: "MLBB India",
    image: "/game-assets/11.jpg",
    link: "/games/mobile-legends114",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
  },
  {
    id: 3,
    title: "PUBG Mobile",
    image: "/game-assets/bgmi-logo.webp",
    link: "/games/pubg-mobile138",
    color: "from-orange-400 via-red-500 to-rose-600",
  },
  {
    id: 4,
    title: "Bundles",
    image: "/game-assets/bundle-weekly.jpg",
    link: "/games/weeklymonthly-bundle646",
    color: "from-fuchsia-400 via-purple-500 to-violet-600",
  },
  {
    id: 5,
    title: "VIP",
    image: "/membership/silver-m.png",
    link: "/games/silver-membership",
    color: "from-emerald-400 via-teal-500 to-green-600",
  },
];

export default function StorySlider() {
  const containerRef = useRef(null);
  const [show, setShow] = useState(true);

  useEffect(() => {
    fetch("/api/ui-settings")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.showStorySlider === false) {
          setShow(false);
        }
      })
      .catch(err => console.error("Failed to fetch UI settings", err));
  }, []);

  if (!show) return null;

  return (
    <section className="relative w-full overflow-hidden py-1 sm:py-2">
      <div className="relative max-w-7xl mx-auto px-4">
        <div
          ref={containerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto py-1 px-1
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden 
          touch-pan-x snap-x scroll-smooth"
        >
          {storyData.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 snap-start"
            >
              <Link
                href={item.link}
                className="group flex flex-col items-center gap-1.5 cursor-pointer max-w-[72px] sm:max-w-[80px]"
              >
                {/* RING ASSEMBLY */}
                <div className="relative">
                  <div className={`
                    relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px]
                    bg-[#1a1a1a] border border-white/10 transition-transform duration-300
                    group-hover:scale-105 group-active:scale-95
                  `}>
                    <div className={`
                      absolute inset-0 rounded-full bg-gradient-to-tr ${item.color} 
                      opacity-60 group-hover:opacity-100 transition-opacity
                    `} />

                    {/* Inner Image Container */}
                    <div className="relative w-full h-full rounded-full border-2 border-[var(--background)] overflow-hidden bg-black z-10">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  </div>
                </div>

                {/* TITLE */}
                <span className="text-[10px] sm:text-[11px] font-semibold text-center transition-colors text-[var(--foreground)] opacity-80 group-hover:text-[var(--accent)] group-hover:opacity-100 line-clamp-1">
                  {item.title}
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
