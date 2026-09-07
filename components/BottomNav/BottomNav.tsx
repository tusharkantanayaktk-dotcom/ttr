"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Image from "next/image";
import logo from "@/public/logo.png";
import {
    Compass,
    Gamepad2,
    Trophy,
    ShoppingBag
} from "lucide-react";
import { useState, useEffect } from "react";

interface NavItem {
    name: string;
    href: string;
    icon?: any;
    isLogo?: boolean;
}

const navItems: NavItem[] = [
    { name: "Region", href: "/region", icon: Compass },
    { name: "Games", href: "/games", icon: Gamepad2 },
    { name: "Home", href: "/", isLogo: true },
    { name: "Rank", href: "/leaderboard", icon: Trophy },
    { name: "Orders", href: "/dashboard/order", icon: ShoppingBag },
];

export default function BottomNav() {
    const pathname = usePathname();
    const [show, setShow] = useState(true);
    
    const { scrollY } = useScroll();
    const [hiddenByScroll, setHiddenByScroll] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        const shouldHide = latest > previous && latest > 60;
        setHiddenByScroll((prev) => (prev !== shouldHide ? shouldHide : prev));
    });

    useEffect(() => {
        fetch("/api/ui-settings")
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data && data.data.showBottomNav === false) {
                    setShow(false);
                }
            })
            .catch(err => console.error("Failed to fetch UI settings", err));
    }, []);

    if (!show) return null;

    const isHiddenPage = 
        pathname.startsWith("/login") || 
        pathname.startsWith("/register") || 
        pathname.startsWith("/games/") || 
        pathname.startsWith("/payment") || 
        pathname.startsWith("/owner-panel") ||
        pathname.startsWith("/owner-panal") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/wallet");

    if (isHiddenPage) return null;

    return (
        <motion.div 
            className="fixed bottom-3 left-0 right-0 z-[100] lg:hidden flex justify-center pointer-events-none px-2"
            variants={{
                visible: { y: 0, opacity: 1 },
                hidden: { y: 150, opacity: 0 }
            }}
            initial="visible"
            animate={hiddenByScroll ? "hidden" : "visible"}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
            {/* Simple, Clean & Premium Compact Dock */}
            <div className="bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)] rounded-full px-2 py-1 pointer-events-auto">
                <nav className="flex items-center gap-1 sm:gap-2 relative h-10">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative flex items-center justify-center h-full outline-none group"
                            >
                                <motion.div 
                                    className={`relative z-10 flex items-center justify-center rounded-full transition-all duration-200 overflow-hidden ${
                                        isActive 
                                            ? "bg-[var(--accent)] text-white h-9 px-3 gap-2" 
                                            : "text-[var(--muted)] hover:text-[var(--foreground)] h-9 w-9 hover:bg-[var(--accent)]/10"
                                    }`}
                                    layout
                                >
                                    {item.isLogo ? (
                                        <Image
                                            src={logo}
                                            alt="Home"
                                            width={26}
                                            height={26}
                                            className={`w-[26px] h-[26px] object-contain shrink-0 transition-transform ${
                                                isActive ? "brightness-110 scale-105" : "opacity-90 group-hover:opacity-100 group-hover:scale-105"
                                            }`}
                                        />
                                    ) : (
                                        Icon && (
                                            <Icon 
                                                className={`shrink-0 transition-colors duration-200 ${
                                                    isActive 
                                                        ? "text-white" 
                                                        : "text-[var(--muted)] group-hover:text-[var(--accent)]"
                                                }`}
                                                size={22}
                                                strokeWidth={1.8}
                                            />
                                        )
                                    )}
                                    
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div 
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: "auto", opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden flex items-center justify-center"
                                            >
                                                <span className="text-[12px] font-semibold text-white whitespace-nowrap">
                                                    {item.name}
                                                </span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </motion.div>
    );
}
