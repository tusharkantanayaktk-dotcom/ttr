"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FiZap, FiClock, FiChevronRight } from "react-icons/fi";
import { useEffect, useState } from "react";

const FlashSaleImage = ({ src, name }) => {
    const [err, setErr] = useState(false);
    const letter = name?.charAt(0).toUpperCase() || "?";

    return (
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-1.5 bg-black/40 flex items-center justify-center">
            {!err ? (
                <Image
                    src={src}
                    alt={name}
                    fill
                    sizes="(max-width: 640px) 45vw, 20vw"
                    onError={() => setErr(true)}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--card)] to-[var(--background)] flex items-center justify-center">
                    <span className="text-3xl font-black text-amber-500 opacity-30 uppercase">{letter}</span>
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>
    );
};

export default function FlashSale() {
    const [config, setConfig] = useState(null);
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/flash-sale")
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setConfig(data.data);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load flash sale:", err);
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!config || !config.enabled || !config.endTime) return;

        const end = new Date(config.endTime).getTime();

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const difference = end - now;

            if (difference <= 0) {
                return { hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                hours: Math.floor((difference / (1000 * 60 * 60))),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000)
            };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [config]);

    if (isLoading) return null;
    if (!config || !config.enabled) return null;
    
    const now = new Date().getTime();
    const end = new Date(config.endTime).getTime();
    if (end - now <= 0) return null;

    const flashSaleData = config.items || [];
    if (flashSaleData.length === 0) return null;

    return (
        <section className="relative py-2 px-4 overflow-hidden border-b border-[var(--border)] opacity-95">
            {/* BACKGROUND ACCENTS */}


            <div className="max-w-7xl mx-auto relative">
                {/* COMPACT HEADER */}
                <div className="flex flex-row items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-amber-500 flex items-center justify-center text-black shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                            <FiZap size={12} fill="currentColor" />
                        </div>
                        <h2 className="text-lg font-black italic uppercase tracking-tighter text-[var(--foreground)] leading-none">
                            Flash <span className="text-amber-500">Sale</span>
                        </h2>
                        <div className="hidden xs:block w-px h-3 bg-[var(--border)] mx-1" />
                        <p className="hidden md:block text-[8px] font-bold text-[var(--foreground)]/40 uppercase tracking-[0.2em]">Limited time</p>
                    </div>

                    {/* STREAMLINED COUNTDOWN */}
                    <div className="flex items-center gap-2 px-2 py-1 bg-[var(--card)]/50 border border-[var(--border)] rounded-lg">
                        <div className="flex items-center gap-1">
                            <FiClock className="text-amber-500" size={10} />
                            <span className="hidden xs:block text-[8px] font-black uppercase tracking-widest text-amber-500">Ends In</span>
                        </div>

                        <div className="flex items-center gap-1.5 font-bold text-xs tabular-nums text-[var(--foreground)]">
                            <span className="min-w-[1rem] text-center">{String(timeLeft.hours).padStart(2, '0')}</span>
                            <span className="opacity-20 text-[10px]">:</span>
                            <span className="min-w-[1rem] text-center">{String(timeLeft.minutes).padStart(2, '0')}</span>
                            <span className="opacity-20 text-[10px]">:</span>
                            <span className="min-w-[1rem] text-center text-amber-500">{String(timeLeft.seconds).padStart(2, '0')}</span>
                        </div>
                    </div>
                </div>

                {/* COMPACT SCROLLABLE ROW / GRID */}
                <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 md:grid md:grid-cols-4 lg:grid-cols-6 md:pb-0">
                    {flashSaleData.map((item, index) => (
                        <div
                            key={`${item.id}-${index}`}
                            className="shrink-0 w-[140px] xs:w-[160px] md:w-full"
                        >
                            <Link
                                href={`/games/${item.slug}`}
                                className="group relative block bg-[var(--card)]/50 hover:bg-[var(--card)] backdrop-blur-xl border border-[var(--border)] hover:border-amber-500/30 rounded-2xl p-1.5 transition-all duration-300"
                            >
                                {/* Badge Overlay */}
                                <div className="absolute top-3 left-3 z-20">
                                    <span className="text-[7px] font-black italic uppercase tracking-widest px-1.5 py-0.5 rounded-sm bg-amber-500 text-black shadow-lg">
                                        {item.badge}
                                    </span>
                                </div>

                                {/* IMAGE CONTAINER */}
                                <FlashSaleImage src={item.image} name={item.name} />

                                {/* INFO CONTENT */}
                                <div className="space-y-0.5 px-0.5">
                                    <h3 className="text-[11px] font-black italic uppercase tracking-tighter text-[var(--foreground)] group-hover:text-amber-500 transition-colors">
                                        {item.name}
                                    </h3>

                                    <div className="flex items-center justify-between gap-1 pt-0.5">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-sm font-black italic text-[var(--foreground)] tracking-tighter">
                                                {item.price}
                                            </span>
                                            <span className="text-[9px] font-bold text-[var(--foreground)]/30 line-through">
                                                {item.originalPrice}
                                            </span>
                                        </div>

                                        <div className="w-5 h-5 rounded-md bg-[var(--foreground)]/5 group-hover:bg-amber-500 flex items-center justify-center transition-all">
                                            <FiChevronRight size={10} className="text-[var(--foreground)]/40 group-hover:text-black" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
