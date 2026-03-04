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
        image: "/game-assets/weekly-pass.jpeg",
        price: "₹147",
        originalPrice: "₹175",
        slug: "mobile-legends988?type=weekly-pass",
        badge: "Hot Deal"
    },
    {
        id: 5,
        name: "Weekly Bundle",
        game: "MLBB",
        image: "/game-assets/12.jpg",
        price: "₹79",
        originalPrice: "₹100",
        slug: "weeklymonthly-bundle931",
        badge: "Best Value"
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
        <section className="relative py-4 px-4 overflow-hidden border-b border-white/5">
            {/* PREMIUM BACKGROUND ACCENTS */}
            <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-amber-500/5 blur-[120px] pointer-events-none rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-amber-500/[0.03] blur-[100px] pointer-events-none rounded-full" />

            <div className="max-w-7xl mx-auto relative">
                {/* ENHANCED HEADER - COMPACT VERSION */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                            <FiZap size={14} fill="currentColor" />
                        </div>
                        <h2 className="text-xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                            Flash <span className="text-amber-500">Sale</span>
                        </h2>
                        <div className="hidden sm:block w-px h-4 bg-foreground/10 mx-1" />
                        <p className="hidden sm:block text-[9px] font-bold text-muted uppercase tracking-[0.2em] opacity-40">Limited time</p>
                    </div>

                    {/* ULTRA COMPACT COUNTDOWN HUD */}
                    <div className="flex items-center gap-3 bg-foreground/[0.02] backdrop-blur-xl border border-foreground/5 px-2.5 py-1.5 rounded-xl self-start sm:self-auto">
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/10">
                            <FiClock className="text-amber-500 animate-pulse" size={10} />
                            <span className="text-[8px] font-black uppercase tracking-widest text-amber-500">Ends In</span>
                        </div>

                        <div className="flex items-center gap-2 font-black text-sm md:text-base tabular-nums text-foreground">
                            <div className="flex flex-col items-center min-w-[1.2rem]">
                                <span className="leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                                <span className="text-[6px] opacity-30 mt-0.5 uppercase">H</span>
                            </div>
                            <span className="opacity-10 translate-y-[-2px] text-[10px]">:</span>
                            <div className="flex flex-col items-center min-w-[1.2rem]">
                                <span className="leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                                <span className="text-[6px] opacity-30 mt-0.5 uppercase">M</span>
                            </div>
                            <span className="opacity-10 translate-y-[-2px] text-[10px]">:</span>
                            <div className="flex flex-col items-center min-w-[1.2rem] text-amber-500">
                                <span className="leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
                                <span className="text-[6px] opacity-30 mt-0.5 uppercase">S</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ENHANCED GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                    {flashSaleData.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Link
                                href={`/games/${item.slug}`}
                                className="group relative block bg-foreground/[0.02] hover:bg-foreground/[0.04] backdrop-blur-xl border border-foreground/[0.05] hover:border-amber-500/20 rounded-[1.5rem] p-2 transition-all duration-500 shadow-2xl"
                            >
                                {/* Badge Overlay */}
                                <div className="absolute top-4 left-4 z-20">
                                    <span className="text-[8px] font-black italic uppercase tracking-widest px-2 py-1 rounded-md bg-amber-500 text-black shadow-xl scale-90 group-hover:scale-100 transition-transform">
                                        {item.badge}
                                    </span>
                                </div>

                                {/* IMAGE CONTAINER */}
                                <div className="relative aspect-square rounded-[1rem] overflow-hidden mb-2 bg-black/40 border border-white/5">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                    {/* QUick Buy Trigger (Desktop) */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                                        <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                                            <FiZap size={20} fill="currentColor" />
                                        </div>
                                    </div>
                                </div>

                                {/* INFO CONTENT */}
                                <div className="space-y-1 px-1">
                                    <div className="flex items-center gap-1.5 font-black italic uppercase tracking-widest text-muted text-[8px]">
                                        <span className="w-1 h-1 rounded-full bg-amber-500" />
                                        {item.game}
                                    </div>

                                    <h3 className="text-xs font-black italic uppercase tracking-tighter text-foreground truncate group-hover:text-amber-500 transition-colors">
                                        {item.name}
                                    </h3>

                                    <div className="flex items-end justify-between gap-1 pt-1">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-bold text-muted line-through opacity-50 mb-[-1px]">
                                                {item.originalPrice}
                                            </span>
                                            <span className="text-base font-black italic text-foreground tracking-tighter">
                                                {item.price}
                                            </span>
                                        </div>

                                        <div className="w-6 h-6 rounded-lg bg-foreground/[0.05] group-hover:bg-amber-500 flex items-center justify-center transition-all">
                                            <FiChevronRight size={12} className="text-muted group-hover:text-black transition-colors" />
                                        </div>
                                    </div>
                                </div>

                                {/* GLOW EFFECT (ACTIVE) */}
                                <div className="absolute inset-0 rounded-[1.5rem] bg-amber-500/0 group-hover:bg-amber-500/[0.02] pointer-events-none transition-colors" />
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
      `}</style>
        </section>
    );
}
