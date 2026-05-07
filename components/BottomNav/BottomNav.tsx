"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiHome,
    FiGrid,
    FiGlobe,
    FiShoppingBag,
    FiAward
} from "react-icons/fi";
import { useState, useEffect } from "react";

const navItems = [
    { name: "Region", href: "/region", icon: FiGlobe },
    { name: "Games", href: "/games", icon: FiGrid },
    { name: "Home", href: "/", icon: FiHome, isCenter: true },
    { name: "Rank", href: "/leaderboard", icon: FiAward },
    { name: "Orders", href: "/dashboard/order", icon: FiShoppingBag },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden"
        >
            {/* Slim Profile Glass Bar */}
            <div className="relative w-full bg-[var(--card)]/90 backdrop-blur-3xl border-t border-[var(--border)] pb-safe-offset-1 shadow-[0_-10px_35px_rgba(0,0,0,0.1)]">
                <nav className="flex items-center justify-between px-1 h-11 relative">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                        const Icon = item.icon;

                        if (item.isCenter) {
                            return (
                                <div key={item.name} className="relative flex-1 flex justify-center -translate-y-4">
                                    <Link href={item.href} className="group outline-none">
                                        <div className="relative">
                                            {/* Pulse effect for center button */}
                                            {isActive && (
                                                <div
                                                    className="absolute inset-0 bg-[var(--accent)] rounded-full blur-xl opacity-30 scale-150"
                                                />
                                            )}

                                            <div className={`
                                                w-11 h-11 rounded-full flex items-center justify-center relative z-10 transition-all duration-500
                                                ${isActive
                                                    ? "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] shadow-[0_8px_20px_rgba(var(--accent),0.6)] scale-110"
                                                    : "bg-[var(--background)] border border-[var(--border)] shadow-md group-hover:bg-[var(--card)]"
                                                }
                                            `}>
                                                <Icon className={`text-lg transition-all duration-300 ${isActive ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "text-[var(--foreground)]/40 group-hover:text-[var(--accent)]"}`} />
                                            </div>

                                            {/* Minimal Active Bar below center */}
                                            {isActive && (
                                                <div
                                                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[var(--accent)] rounded-full shadow-[0_0_12px_var(--accent)]"
                                                />
                                            )}
                                        </div>
                                    </Link>
                                </div>
                            );
                        }

                        return (
                            <div key={item.name} className="flex-1 flex flex-col items-center justify-center min-w-0">
                                <Link
                                    href={item.href}
                                    className="flex flex-col items-center group outline-none w-full"
                                >
                                    <NavItemContent isActive={isActive} Icon={Icon} name={item.name} />
                                </Link>
                            </div>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}

function NavItemContent({ isActive, Icon, name }: { isActive: boolean; Icon: any; name: string }) {
    return (
        <div className="flex flex-col items-center relative py-1">
            <div className="relative flex items-center justify-center h-5">
                <Icon
                    className={`text-xl transition-all duration-300 ${isActive
                        ? "text-[var(--accent)] drop-shadow-[0_0_8px_var(--accent)]"
                        : "text-[var(--foreground)]/70 group-hover:text-[var(--foreground)]"
                        }`}
                />
            </div>

            <span
                className={`text-[8px] font-black uppercase tracking-tight transition-all duration-500 whitespace-nowrap overflow-hidden text-ellipsis px-0.5 mt-1 ${isActive
                    ? "text-[var(--accent)] opacity-100"
                    : "text-[var(--foreground)]/70 group-hover:text-[var(--foreground)]"
                    }`}
            >
                {name}
            </span>

            {/* Premium Glow Bar for side items */}
            {isActive && (
                <div
                    className="absolute -bottom-1 w-5 h-0.5 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent rounded-full shadow-[0_0_10px_var(--accent)] animate-pulse"
                />
            )}
        </div>
    );
}
