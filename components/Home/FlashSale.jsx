"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FiZap, FiClock, FiChevronRight } from "react-icons/fi";
import { useEffect, useState } from "react";

const flashSaleData = [
    {
        id: 1,
        name: "Weekly Pass",
        game: "MLBB",
        image: "https://res.cloudinary.com/dk0sslz1q/image/upload/v1770490927/d5fb0a2787575170c5fb9a4ad30b4aac.jpg_r4ci3s.jpg",
        price: "₹143",
        originalPrice: "₹175",
        slug: "mobile-legends988?type=weekly-pass",
        badge: "Hot"
    },

    {
        id: 5,
        name: "Weekly Bundle",
        game: "MLBB",
        image: "https://res.cloudinary.com/dk0sslz1q/image/upload/v1770490919/a392ca101bac1986eb941c0febd7f30b.jpg_xiixsa.jpg",
        price: "₹79",
        originalPrice: "₹100",
        slug: "weeklymonthly-bundle931",
        badge: "Value"
    },

];

export default function FlashSale() {
    const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return { hours: 23, minutes: 59, seconds: 59 };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative py-2 px-4 overflow-hidden border-b border-white/5 bg-black/10">
            {/* Background Decorative */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-amber-500/5 blur-[80px] pointer-events-none" />

            <div className="max-w-7xl mx-auto">
                {/* Compact Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0">
                            <FiZap size={12} fill="currentColor" />
                        </div>
                        <h2 className="text-base sm:text-lg font-black uppercase tracking-tighter italic text-[var(--foreground)]">
                            Flash <span className="text-amber-500">Sale</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1 rounded-xl">
                        <FiClock className="text-amber-500 animate-pulse hidden sm:block" size={10} />
                        <div className="flex items-center gap-2 font-bold text-[10px] tabular-nums text-amber-500">
                            <span className="opacity-60 text-[8px] uppercase tracking-widest text-[var(--foreground)] mr-1 hidden md:block">Ends In</span>
                            <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                            <span className="opacity-30 text-[var(--foreground)]">:</span>
                            <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                            <span className="opacity-30 text-[var(--foreground)]">:</span>
                            <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                        </div>
                    </div>
                </div>

                {/* Compact Horizontal Slider */}
                <div className="overflow-x-auto pb-4 custom-scrollbar-premium snap-x snap-mandatory">
                    <div className="flex gap-4 md:gap-6 px-1 md:justify-center min-w-max md:min-w-0">
                        {flashSaleData.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                viewport={{ once: true }}
                                className="snap-start"
                            >
                                <Link
                                    href={`/games/${item.slug}`}
                                    className="group relative block w-[130px] sm:w-[150px] md:w-[210px] bg-[var(--card)]/40 backdrop-blur-lg border border-white/5 rounded-[1rem] p-1.5 md:p-2 transition-all duration-500 hover:border-amber-500/30 hover:bg-amber-500/[0.04] shadow-lg"
                                >
                                    {/* Badge */}
                                    <div className="absolute top-2.5 left-2.5 z-20">
                                        <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 md:py-1 rounded-md bg-amber-500 text-black shadow-lg">
                                            {item.badge}
                                        </span>
                                    </div>

                                    {/* Image Container */}
                                    <div className="relative aspect-square rounded-[0.8rem] overflow-hidden mb-2 md:mb-3 ring-1 ring-white/5 bg-black/20">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 transition-opacity group-hover:opacity-60" />
                                    </div>

                                    {/* Compact Info */}
                                    <div className="space-y-0.5 md:space-y-1 px-1">
                                        <p className="text-[7px] md:text-[9px] font-bold text-amber-500/80 uppercase tracking-widest truncate">{item.game}</p>
                                        <h3 className="text-[11px] md:text-[14px] font-black uppercase tracking-tight text-[var(--foreground)] truncate group-hover:text-amber-500 transition-colors">
                                            {item.name}
                                        </h3>

                                        <div className="flex items-center justify-between pt-0.5">
                                            <span className="text-[12px] md:text-[16px] font-black italic text-[var(--foreground)]">
                                                {item.price}
                                            </span>
                                            <span className="text-[9px] md:text-[11px] font-bold text-[var(--muted)] line-through opacity-50 decoration-red-500/50">
                                                {item.originalPrice}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <style jsx global>{`
                    .custom-scrollbar-premium::-webkit-scrollbar {
                        height: 3px;
                    }
                    .custom-scrollbar-premium::-webkit-scrollbar-track {
                        background: rgba(255, 255, 255, 0.02);
                        border-radius: 10px;
                    }
                    .custom-scrollbar-premium::-webkit-scrollbar-thumb {
                        background: rgba(245, 158, 11, 0.2);
                        border-radius: 10px;
                    }
                    .custom-scrollbar-premium::-webkit-scrollbar-thumb:hover {
                        background: rgba(245, 158, 11, 0.4);
                    }
                `}</style>
            </div>
        </section>
    );
}
