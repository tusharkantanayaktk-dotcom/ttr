"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiTool, FiLogIn } from "react-icons/fi";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Maintenance() {
    const pathname = usePathname();
    const [show, setShow] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkMaintenance = async () => {
            try {
                // Check if user is admin to bypass
                const token = localStorage.getItem("token");
                if (token) {
                    const resMe = await fetch("/api/auth/me", {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const dataMe = await resMe.json();
                    if (dataMe.success && dataMe.user.userType === "owner") {
                        setIsAdmin(true);
                        return; // Bypass maintenance
                    }
                }

                // Check maintenance status
                const res = await fetch("/api/system/maintenance");
                const data = await res.json();
                if (data.success && data.maintenanceMode) {
                    setIsActive(true);
                    setTimeout(() => setShow(true), 200);
                }
            } catch (err) {
                console.error("Maintenance check failed", err);
            }
        };

        checkMaintenance();
        const interval = setInterval(checkMaintenance, 30000);
        return () => clearInterval(interval);
    }, []);

    if (isAdmin || !isActive || pathname === "/login") return null;

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-6 bg-black">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="w-full max-w-[340px]"
                    >
                        <div className="bg-zinc-950 border border-white/10 rounded-2xl p-10 flex flex-col items-center text-center">
                            
                            {/* Simple Icon */}
                            <div className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center text-white mb-8">
                                <FiTool size={20} />
                            </div>

                            {/* Typography */}
                            <div className="space-y-2 mb-10">
                                <h1 className="text-xl font-bold text-white tracking-tight uppercase">Under Maintenance</h1>
                                <p className="text-zinc-500 text-sm leading-relaxed">
                                    We are updating our system. <br />
                                    Please check back very soon.
                                </p>
                            </div>

                            {/* Login / Action Area */}
                            <div className="w-full space-y-4">
                                <Link
                                    href="/login"
                                    className="block w-full py-4 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest transition-transform active:scale-95 text-center"
                                >
                                    Login to System
                                </Link>
                                
                                <button 
                                    onClick={() => window.open('https://waitlist.tronics.official', '_blank')}
                                    className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-zinc-400 transition-colors"
                                >
                                    Tronics Official
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
