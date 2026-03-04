"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import logo from "@/public/logo.png";
import Loader from "@/components/Loader/Loader";

export default function GameBannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/game-banners");
        const json = await res.json();
        if (!active) return;
        setBanners(json?.data || []);
      } catch {
        if (active) setBanners([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => (active = false);
  }, []);

  /* ================= AUTOPLAY ================= */
  useEffect(() => {
    if (banners.length <= 1 || isHovered) return;
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(id);
  }, [banners.length, isHovered]);

  const goNext = useCallback(() => setCurrent((prev) => (prev + 1) % banners.length), [banners.length]);
  const goPrev = useCallback(() => setCurrent((prev) => (prev - 1 + banners.length) % banners.length), [banners.length]);

  // Helper to get 3 visible indices
  const visibleIndices = useMemo(() => {
    if (!banners.length) return [];
    const prev = (current - 1 + banners.length) % banners.length;
    const next = (current + 1) % banners.length;
    return [prev, current, next];
  }, [current, banners.length]);

  if (loading) return <Loader />;
  if (!banners.length) return null;

  return (
    <div
      className="relative w-full max-w-[1600px] mx-auto px-0 md:px-12 mt-6 md:mt-16 select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* BACKGROUND GLOW EFFECT */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150%] max-w-4xl bg-[var(--accent)]/10 blur-[80px] md:blur-[120px] rounded-full pointer-events-none opacity-50" />

      <div className="relative h-[220px] sm:h-[300px] md:h-[500px] flex items-center justify-center overflow-hidden md:overflow-visible">
        <AnimatePresence initial={false}>
          {banners.map((banner, index) => {
            const diff = (index - current + banners.length) % banners.length;
            let position = "hidden";

            if (diff === 0) position = "center";
            else if (diff === 1 || (banners.length === 2 && diff === 1)) position = "right";
            else if (diff === banners.length - 1) position = "left";

            if (position === "hidden" && banners.length > 3) return null;

            const variants = {
              center: {
                x: "0%",
                scale: 1,
                zIndex: 30,
                opacity: 1,
                filter: "blur(0px)",
              },
              left: {
                x: "-88%",
                scale: 0.85,
                zIndex: 20,
                opacity: 0.3,
                filter: "blur(2px)",
              },
              right: {
                x: "88%",
                scale: 0.85,
                zIndex: 20,
                opacity: 0.3,
                filter: "blur(2px)",
              },
              hidden: {
                x: diff > banners.length / 2 ? "-150%" : "150%",
                scale: 0.5,
                zIndex: 10,
                opacity: 0,
                filter: "blur(10px)",
              }
            };

            // Custom offsets for desktop to maintain that "3-card" look
            const deskVariants = {
              left: { x: "-75%", scale: 0.8, opacity: 0.4, filter: "blur(4px)" },
              right: { x: "75%", scale: 0.8, opacity: 0.4, filter: "blur(4px)" }
            };

            return (
              <motion.div
                key={banner._id || index}
                initial={variants.hidden}
                animate={{
                  ...variants[position],
                  ...(typeof window !== 'undefined' && window.innerWidth >= 768 && deskVariants[position] ? deskVariants[position] : {})
                }}
                exit={variants.hidden}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  opacity: { duration: 0.3 }
                }}
                drag={position === "center" ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -100) goNext();
                  if (info.offset.x > 100) goPrev();
                }}
                onClick={(e) => {
                  if (position !== "center") {
                    e.preventDefault();
                    setCurrent(index);
                  }
                }}
                className={`absolute w-[85%] md:w-[70%] h-full rounded-[1.5rem] md:rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl bg-[var(--card)] touch-none transition-shadow duration-300
                  ${position === 'center' ? 'z-30 cursor-pointer' : 'z-20 cursor-pointer hover:shadow-cyan-500/10'}
                `}
              >
                <Link
                  href={banner.bannerLink || "/"}
                  className={`block w-full h-full relative ${position !== 'center' ? 'pointer-events-none' : ''}`}
                  onClick={(e) => {
                    // Prevent navigation if we are just switching slides
                    if (position !== 'center') e.preventDefault();
                  }}
                >
                  <Image
                    src={banner.bannerImage || logo}
                    alt={banner.bannerTitle || "Game banner"}
                    fill
                    priority={index === current}
                    className="object-cover transition-transform duration-[8s]"
                  />

                  {/* GRADIENT OVERLAY */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 ${position === 'center' ? 'opacity-100' : 'opacity-60'}`} />

                  {/* CONTENT BOX */}
                  {position === 'center' && (
                    <div className="absolute inset-0 flex items-end p-5 md:p-16">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="space-y-2 md:space-y-6 max-w-full md:max-w-2xl"
                      >
                        {banner.bannerTitle && (
                          <h2 className="text-lg sm:text-2xl md:text-5xl font-black text-white tracking-tight leading-tight uppercase drop-shadow-xl line-clamp-2">
                            {banner.bannerTitle}
                          </h2>
                        )}
                        <div className="flex items-center gap-3 text-[var(--accent)] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] text-[10px] md:text-sm">
                          <span className="h-0.5 w-6 md:w-12 bg-[var(--accent)]" />
                          <span className="whitespace-nowrap">Explore Now</span>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* BORDER GLOW (Active Only) */}
                  {position === 'center' && (
                    <div className="absolute inset-0 border border-[var(--accent)]/20 rounded-[1.5rem] md:rounded-[4rem] pointer-events-none" />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* REFINED NAVIGATION (Hidden on Mobile) */}
      <div className="hidden md:block">
        {banners.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center z-[50] opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--accent)] hover:scale-110 shadow-2xl"
            >
              <FiChevronLeft size={32} />
            </button>
            <button
              onClick={goNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center z-[50] opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--accent)] hover:scale-110 shadow-2xl"
            >
              <FiChevronRight size={32} />
            </button>
          </>
        )}
      </div>

      {/* MOBILE-OPTIMIZED PAGINATION */}
      {banners.length > 1 && (
        <div className="flex justify-center items-center gap-2 md:gap-4 mt-8 md:mt-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="py-2 px-1 focus:outline-none"
            >
              <div className={`h-1 md:h-1.5 rounded-full transition-all duration-700 relative overflow-hidden ${current === i
                ? "w-8 md:w-12 bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]"
                : "w-2 md:w-3 bg-white/20"
                }`}>
                {current === i && (
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-white/30"
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
