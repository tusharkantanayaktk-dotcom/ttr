"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import {
    Home,
    Gamepad2,
    Globe2,
    ShoppingBag,
    Trophy
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
    { name: "Region", href: "/region", icon: Globe2 },
    { name: "Games", href: "/games", icon: Gamepad2 },
    { name: "Home", href: "/", icon: Home },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Orders", href: "/dashboard/order", icon: ShoppingBag },
];

export default function BottomNav() {
    const pathname = usePathname();
    const [show, setShow] = useState(true);
    
    const { scrollY } = useScroll();
    const [hiddenByScroll, setHiddenByScroll] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 50) {
            setHiddenByScroll(true);
        } else {
            setHiddenByScroll(false);
        }
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
            className="fixed bottom-2 left-0 right-0 z-[100] lg:hidden flex justify-center pointer-events-none px-4"
            variants={{
                visible: { y: 0, opacity: 1 },
                hidden: { y: 150, opacity: 0 }
            }}
            initial="visible"
            animate={hiddenByScroll ? "hidden" : "visible"}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
            {/* Ultra Simple & Compact Premium Dock with Text */}
            <div className="w-full max-w-[300px] bg-[var(--card)]/80 backdrop-blur-3xl border border-[var(--white)]/5 rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.4)] p-1 pointer-events-auto">
                <nav className="flex items-center justify-between relative h-10">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative flex items-center justify-center h-full outline-none group"
                                style={{
                                    flex: isActive ? 1.5 : 1
                                }}
                            >
                                <motion.div 
                                    className={`relative z-10 flex items-center justify-center rounded-full transition-all duration-300 overflow-hidden ${
                                        isActive 
                                            ? "bg-[var(--accent)] text-white h-8 px-2.5 gap-1.5 shadow-[0_4px_15px_rgba(var(--accent),0.4)]" 
                                            : "bg-[var(--accent)]/10 text-[var(--accent)] h-8 w-8 hover:bg-[var(--accent)]/20"
                                    }`}
                                    layout
                                >
                                    <Icon 
                                        className={`transition-colors duration-300 ${
                                            isActive 
                                                ? "text-white text-[16px]" 
                                                : "text-[var(--accent)] text-[18px]"
                                        }`} 
                                    />
                                    
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div 
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: "auto", opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                className="overflow-hidden flex items-center justify-center"
                                            >
                                                <span className="inline-block bg-white/25 text-white text-[8px] font-bold px-1.5 py-[1px] rounded-full whitespace-nowrap">
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
