"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiZap, FiAlertTriangle, FiCpu, FiLogOut, FiServer } from "react-icons/fi";

export default function Maintenance() {
    const [show, setShow] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShow(true), 800);
        return () => clearTimeout(timer);
    }, []);

    const handleLoggingOff = () => {
        setIsLoggingOut(true);

        const keysToRemove = ["token", "userName", "email", "userId", "phone", "pending_topup_order", "avatar"];
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
        localStorage.removeItem("mlbb_verified_players");

        setTimeout(() => {
            window.location.href = "/";
        }, 2500);
    };

    // Generate random particles
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
    }));

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 overflow-hidden">
                    {/* Animated Grid Background */}
                    <div className="absolute inset-0 bg-black">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,100,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,100,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
                    </div>

                    {/* Floating Particles */}
                    {particles.map((particle) => (
                        <motion.div
                            key={particle.id}
                            className="absolute w-1 h-1 bg-pink-500/30 rounded-full"
                            style={{
                                left: `${particle.x}%`,
                                top: `${particle.y}%`,
                            }}
                            animate={{
                                y: [0, -100, 0],
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0],
                            }}
                            transition={{
                                duration: particle.duration,
                                repeat: Infinity,
                                delay: particle.delay,
                                ease: "easeInOut",
                            }}
                        />
                    ))}

                    {/* Radial Gradient Overlays */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"
                    />

                    {/* Main Card */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
                        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", damping: 20 }}
                        className="relative w-full max-w-[480px]"
                        style={{ perspective: "1000px" }}
                    >
                        {/* Holographic Border Effect */}
                        <div className="absolute inset-0 rounded-[32px] bg-gradient-to-r from-pink-500/50 via-purple-500/50 to-cyan-500/50 blur-xl opacity-60" />

                        {/* Card Content */}
                        <div className="relative bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl overflow-hidden">

                            {/* Animated Border Gradient */}
                            <motion.div
                                className="absolute inset-0 opacity-50"
                                animate={{
                                    background: [
                                        "linear-gradient(0deg, rgba(255,0,100,0.1), rgba(100,0,255,0.1))",
                                        "linear-gradient(360deg, rgba(255,0,100,0.1), rgba(100,0,255,0.1))",
                                    ],
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />

                            {/* Glitch Lines */}
                            <motion.div
                                className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500 to-transparent"
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />

                            <div className="relative z-10 p-10 text-center">

                                {/* Icon Container */}
                                <div className="relative mx-auto w-32 h-32 mb-8">
                                    {/* Rotating Ring */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 rounded-full border-2 border-dashed border-pink-500/30"
                                    />

                                    {/* Pulsing Glow */}
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.3, 1],
                                            opacity: [0.5, 0.8, 0.5],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-2xl"
                                    />

                                    {/* Center Icon */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <motion.div
                                            animate={{
                                                y: [0, -8, 0],
                                            }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <FiServer className="text-5xl text-pink-500 drop-shadow-[0_0_20px_rgba(255,0,100,0.8)]" />
                                        </motion.div>
                                    </div>

                                    {/* Orbiting Icons */}
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0"
                                    >
                                        <FiZap className="absolute top-0 left-1/2 -translate-x-1/2 text-cyan-400 text-xl" />
                                    </motion.div>
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0"
                                    >
                                        <FiCpu className="absolute bottom-0 left-1/2 -translate-x-1/2 text-purple-400 text-xl" />
                                    </motion.div>
                                </div>

                                {/* Title with Glitch Effect */}
                                <motion.div
                                    animate={{
                                        textShadow: [
                                            "0 0 20px rgba(255,0,100,0.5)",
                                            "0 0 30px rgba(255,0,100,0.8)",
                                            "0 0 20px rgba(255,0,100,0.5)",
                                        ],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <h1 className="text-4xl md:text-5xl font-black uppercase mb-2">
                                        <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                                            Under
                                        </span>
                                        <br />
                                        <span className="text-white">Maintenance</span>
                                    </h1>
                                </motion.div>

                                {/* Status Badge */}
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/30 mb-6">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <FiAlertTriangle className="text-pink-500 text-sm" />
                                    </motion.div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-pink-400">
                                        System Offline
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                                    We're upgrading our systems to serve you better.
                                    <br />
                                    <span className="text-white font-semibold">We'll be back online soon!</span>
                                </p>

                                {/* Divider */}
                                <div className="relative h-[1px] w-32 mx-auto mb-8">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                                        animate={{ x: ["-100%", "100%"] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />
                                </div>

                                {/* Action Button */}
                                <div className="w-full max-w-xs mx-auto">
                                    {!isLoggingOut ? (
                                        <motion.button
                                            onClick={handleLoggingOff}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="relative w-full group"
                                        >
                                            {/* Button Glow */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />

                                            {/* Button Content */}
                                            <div className="relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl border border-white/20 shadow-lg">
                                                <FiLogOut className="text-lg group-hover:-translate-x-1 transition-transform" />
                                                <span className="font-bold uppercase tracking-wider text-sm">
                                                    Logout Now
                                                </span>
                                            </div>
                                        </motion.button>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Loading State */}
                                            <div className="flex items-center justify-center gap-3 py-4">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full"
                                                />
                                                <span className="font-bold uppercase tracking-wider text-sm text-white">
                                                    Logging Out...
                                                </span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: "100%" }}
                                                    transition={{ duration: 2.3, ease: "easeInOut" }}
                                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-[0_0_20px_rgba(255,0,100,0.5)]"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <motion.p
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="mt-10 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-600"
                                >
                                    Mewji • 2026
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
