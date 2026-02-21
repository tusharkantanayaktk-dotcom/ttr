"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiArrowRight } from "react-icons/fi";
import logo from "@/public/logo.png";
import Loader from "@/components/Loader/Loader";

export default function GameBannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

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
    if (banners.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(id);
  }, [banners.length]);

  const goNext = useCallback(() => setCurrent((prev) => (prev + 1) % banners.length), [banners.length]);
  const goPrev = useCallback(() => setCurrent((prev) => (prev - 1 + banners.length) % banners.length), [banners.length]);

  if (loading) return <Loader />;
  if (!banners.length) return null;

  const banner = banners[current];

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 md:px-6 mt-8 md:mt-12 select-none group">

      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3.5rem] aspect-[16/9] md:h-[480px] border border-[var(--border)]/30 shadow-2xl bg-[var(--card)]">

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Link href={banner.bannerLink || "/"} className="block w-full h-full relative">
              <Image
                src={banner.bannerImage || logo}
                alt={banner.bannerTitle || "Game banner"}
                fill
                priority
                className="object-cover transition-transform duration-[10s] group-hover:scale-110"
              />

              {/* CLEAN GRADIENT OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              {/* CLEAN CONTENT BOX */}
              <div className="absolute inset-0 flex items-end p-8 md:p-16">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="space-y-4 md:space-y-6 max-w-2xl"
                >
                  {banner.bannerTitle && (
                    <h2 className="text-2xl md:text-5xl font-black text-white tracking-tight leading-tight uppercase">
                      {banner.bannerTitle}
                    </h2>
                  )}
                </motion.div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* REFINED NAVIGATION (ONLY GONE NEXT/PREV) */}
        {banners.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 active:scale-95"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={goNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 active:scale-95"
            >
              <FiChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* MINIMALIST DOTS */}
      {banners.length > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="py-2"
              aria-label={`Go to slide ${i + 1}`}
            >
              <div className={`h-1.5 rounded-full transition-all duration-500 ${current === i ? "w-8 bg-[var(--accent)]" : "w-1.5 bg-[var(--muted)]/20 hover:bg-[var(--muted)]/40"
                }`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
