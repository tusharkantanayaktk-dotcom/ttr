"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { FiPlus, FiChevronDown, FiUser, FiLayout, FiSettings, FiLifeBuoy, FiLogOut, FiBarChart2, FiHome, FiGrid, FiLayers, FiGlobe, FiX } from "react-icons/fi";
import Image from "next/image";
import logo from "@/public/logo.png";
import Skeleton from "../Skeleton";


export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [avatarError, setAvatarError] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Dynamic header styles based on scroll
  const headerOpacity = useTransform(scrollY, [0, 50], [0, 0.9]);
  const headerBlur = useTransform(scrollY, [0, 50], [0, 16]);
  const headerBorder = useTransform(scrollY, [0, 50], ["rgba(0,0,0,0)", "var(--border)"]);

  /* ================= FETCH USER ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.user);
        else localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  /* ================= SCROLL EFFECT ================= */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= BODY SCROLL LOCK ================= */
  useEffect(() => {
    if (userMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [userMenuOpen]);

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && userMenuOpen) {
        // We handle closure via backdrop or button, but keeping it for safety
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  /* ================= ANIMATION VARIANTS ================= */
  const headerVariants = {
    hidden: { y: -100 },
    visible: {
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }
    }
  };

  const menuVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.98,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className={`fixed top-0 left-0 w-full ${userMenuOpen ? 'z-[1000]' : 'z-[80]'} transition-colors duration-500`}
      style={{
        backgroundColor: scrolled ? "var(--card)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      }}
    >
      {/* Tactical Glow Line (only when scrolled) */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent z-10"
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto flex items-center justify-between px-2 sm:px-4 h-13 relative">

        {/* LOGO SECTION */}
        <div className="flex items-center">
          <Link href="/" className="relative group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative z-10"
            >
              <Image
                src={logo}
                alt="Logo"
                width={80}
                height={24}
                priority
                className="object-contain -ml-2"
              />
            </motion.div>
            <div className="absolute -inset-2 bg-[var(--accent)]/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
          </Link>
        </div>

        {/* DESKTOP NAV - CENTERED */}
        <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {[
            { name: "Games", href: "/games", icon: FiGrid },
            { name: "Regions", href: "/region", icon: FiGlobe }
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors group"
            >
              <item.icon className="text-lg opacity-70 group-hover:opacity-100 group-hover:text-[var(--accent)] transition-all" />
              <span>{item.name}</span>
              <motion.span
                className="absolute bottom-0 left-4 right-4 h-0.5 bg-[var(--accent)] rounded-full origin-left opacity-0 group-hover:opacity-100"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            </Link>
          ))}
        </nav>

        {/* ACTIONS SECTION */}
        <div className="flex items-center gap-3 sm:gap-4" ref={dropdownRef}>
          {user && (
            <Link
              href="/dashboard/wallet"
              className="flex items-center gap-1 bg-[var(--accent)]/10 border border-[var(--accent)]/30 px-2 py-1 rounded-full hover:bg-[var(--accent)]/20 transition-all group shrink-0 shadow-sm"
            >
              <div className="w-4 h-4 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                <FiPlus className="text-[var(--accent)] text-[8px]" />
              </div>
              <span className="text-[12px] font-bold text-[var(--accent)]">₹{user.wallet?.toFixed(1) || "0.0"}</span>
            </Link>
          )}

          <ThemeToggle />

          <div className="h-6 w-[1px] bg-[var(--border)] mx-1 hidden sm:block" />

          {/* USER PROFILE / LOGIN */}
          <div className="relative">
            {loading ? (
              <Skeleton variant="circle" className="w-7 h-7 border-none" />
            ) : (
              <motion.button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                }}
                className={`
                  flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300
                  ${userMenuOpen ? 'bg-[var(--accent)] ring-2 ring-[var(--accent)]/50' : 'hover:bg-[var(--card)]/50 border border-transparent hover:border-[var(--border)]'}
                `}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="w-full h-full rounded-full bg-[var(--accent)] flex items-center justify-center overflow-hidden shadow-sm">
                  {user?.avatar && !avatarError ? (
                    <img
                      src={user.avatar}
                      alt="User Avatar"
                      className="object-cover w-full h-full"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span className="text-white text-[10px] font-black uppercase">
                      {(user?.name || user?.username || user?.email || "U")[0]}
                    </span>
                  )}
                </div>
              </motion.button>
            )}


            {/* USER SLIDER (SIDEBAR) */}
            <AnimatePresence>
              {userMenuOpen && (
                <>
                  {/* Backdrop Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setUserMenuOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]"
                  />

                  {/* Sidebar Slider */}
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="fixed right-0 top-0 h-[100dvh] w-[75%] sm:w-[320px] bg-[var(--card)] border-l border-[var(--border)] shadow-2xl z-[1001] flex flex-col"
                  >
                    {/* CLOSE BUTTON - FLOATING TOP RIGHT */}
                    <div className="p-4 flex items-center justify-between border-b border-[var(--border)] shrink-0">
                      <h2 className="text-[10px] font-black italic uppercase tracking-[0.2em] text-[var(--muted)] opacity-50">Account</h2>
                      <motion.button
                        onClick={() => setUserMenuOpen(false)}
                        whileHover={{ rotate: 90, scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-black transition-colors"
                      >
                        <FiX className="text-lg" />
                      </motion.button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
                      {!user ? (
                        <div className="flex flex-col items-center justify-center text-center">
                          <motion.div
                            initial={{ scale: 0.8, rotate: -5 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="w-16 h-16 bg-gradient-to-br from-[var(--accent)]/25 via-[var(--accent)]/10 to-transparent rounded-[1.2rem] flex items-center justify-center mb-5 border border-[var(--accent)]/30 shadow-[0_10px_20px_-5px_rgba(var(--accent-rgb),0.3)] relative group"
                          >
                            <div className="absolute inset-0 bg-[var(--accent)]/15 blur-xl group-hover:blur-2xl transition-all opacity-70" />
                            <FiUser className="text-3xl text-[var(--accent)] relative z-10" />
                          </motion.div>

                          <h3 className="text-[var(--foreground)] font-black italic uppercase tracking-tighter text-2xl mb-1 leading-none">
                            Welcome, <span className="text-[var(--accent)]">User</span>
                          </h3>
                          <p className="text-[9px] text-[var(--muted)] mb-6 font-bold uppercase tracking-[0.2em] opacity-60 leading-relaxed max-w-[180px]">
                            Sign in to access your wallet and orders.
                          </p>

                          {/* Mobile/Guest Navigation Nodes */}
                          <div className="grid grid-cols-2 gap-2 w-full mb-8">
                            {[
                              { label: "Games", icon: FiGrid, href: "/games" },
                              { label: "Regions", icon: FiGlobe, href: "/region" }
                            ].map((link) => (
                              <Link key={link.label} href={link.href} onClick={() => setUserMenuOpen(false)}>
                                <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] hover:bg-[var(--foreground)]/[0.06] hover:border-[var(--accent)]/30 text-[var(--muted)] transition-all group text-center">
                                  <link.icon className="text-xl text-[var(--accent)] group-hover:scale-110 transition-transform" />
                                  <span className="text-[9px] font-black uppercase tracking-[0.2em] group-hover:text-[var(--foreground)]">{link.label}</span>
                                </div>
                              </Link>
                            ))}
                          </div>

                          <Link href="/login" onClick={() => setUserMenuOpen(false)} className="w-full mt-auto">
                            <motion.button
                              className="w-full py-4 bg-[var(--foreground)] text-[var(--background)] font-black italic uppercase tracking-[0.4em] text-[10px] rounded-xl shadow-[0_10px_20px_-5px_rgba(0,0,0,0.4)] flex items-center justify-center gap-2 group relative overflow-hidden"
                              whileHover={{ scale: 1.02, backgroundColor: 'var(--accent)', color: 'black' }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span className="relative z-10">Sign In</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                            </motion.button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* User Profile Header horizontal */}
                          <div className="flex items-center gap-3 pb-6 border-b border-[var(--border)] relative">
                            {/* Left: Avatar */}
                            <div className="w-12 h-12 rounded-[0.8rem] bg-[var(--accent)] p-[1.5px] shadow-[0_5px_15px_-5px_rgba(var(--accent-rgb),0.5)] shrink-0">
                              <div className="w-full h-full rounded-[0.7rem] overflow-hidden bg-[var(--card)]">
                                {user?.avatar && !avatarError ? (
                                  <img
                                    src={user.avatar}
                                    alt="User Avatar"
                                    className="object-cover w-full h-full"
                                    onError={() => setAvatarError(true)}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)]">
                                    <span className="text-white text-lg font-black uppercase">
                                      {(user.name || user.username || user.email || "U")[0]}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Middle: Info */}
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-sm font-black italic uppercase tracking-tight text-[var(--foreground)] truncate leading-none mb-1">
                                {user.name || user.username}
                              </span>
                              <span className="text-[8px] font-bold text-[var(--muted)] opacity-50 uppercase tracking-widest truncate mb-2">
                                {user.email}
                              </span>
                              <div className="flex">
                                <span className={`
                                  text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border
                                  ${user.userType === 'owner' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                                    user.userType === 'admin' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                                    'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20'}
                                `}>
                                  {user.userType === "owner" ? "Owner" : user.userType === "admin" ? "Reseller" : "User"}
                                </span>
                              </div>
                            </div>

                            {/* Right: Logout Icon */}
                            <motion.button
                              onClick={handleLogout}
                              className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shrink-0 border border-red-500/10"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Sign Out"
                            >
                              <FiLogOut size={18} strokeWidth={2.5} />
                            </motion.button>
                          </div>

                          {/* Navigation nodes compacted */}
                          <div className="space-y-1">
                            <div className="lg:hidden grid grid-cols-2 gap-2 mb-4">
                              {[
                                { label: "Games", icon: FiGrid, href: "/games" },
                                { label: "Regions", icon: FiGlobe, href: "/region" }
                              ].map((link) => (
                                <Link key={link.label} href={link.href} onClick={() => setUserMenuOpen(false)}>
                                  <div className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl hover:bg-[var(--foreground)]/[0.03] text-[var(--muted)] group transition-all border border-transparent hover:border-[var(--border)] text-center">
                                    <link.icon className="text-lg text-[var(--accent)] group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] group-hover:text-[var(--foreground)]">{link.label}</span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                            <div className="h-[1px] bg-[var(--border)] mx-4 my-2 opacity-50" />

                            {[
                              { label: "Dashboard", icon: FiLayout, href: "/dashboard" },
                              { label: "Orders", icon: FiSettings, href: "/dashboard/order" },
                              { label: "Wallet", icon: FiPlus, href: "/dashboard/wallet" },
                              { label: "Support", icon: FiLifeBuoy, href: "/dashboard/query" },
                              { label: "Leaderboard", icon: FiBarChart2, href: "/leaderboard" },
                            ].map((link, idx) => (
                              <Link key={link.label} href={link.href} onClick={() => setUserMenuOpen(false)}>
                                <motion.div
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="relative flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-[var(--foreground)]/[0.04] text-[var(--muted)] group transition-all duration-300 border border-transparent hover:border-[var(--border)]"
                                  whileHover={{ x: -2 }}
                                >
                                  <div className="flex items-center gap-3">
                                    <link.icon className="text-lg opacity-50 group-hover:opacity-100 group-hover:text-[var(--accent)] transition-all duration-300" />
                                    <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-[var(--foreground)] transition-colors">{link.label}</span>
                                  </div>
                                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)] opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                </motion.div>
                              </Link>
                            ))}

                            {user.userType === "owner" && (
                              <Link href="/owner-panal" onClick={() => setUserMenuOpen(false)}>
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 }}
                                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-all mt-4 group shadow-sm"
                                  whileHover={{ scale: 1.02 }}
                                >
                                  <FiSettings size={14} className="group-hover:rotate-90 transition-transform duration-700" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Admin Panel</span>
                                </motion.div>
                              </Link>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* FOOTER OF SIDEBAR */}
                    <div className="p-4 border-t border-[var(--border)] mt-auto bg-[var(--foreground)]/[0.02] text-center space-y-1">
                      <p className="text-[7px] font-black uppercase tracking-[0.4em] text-[var(--accent)] opacity-50">Love from TK</p>
                      <p className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-[0.3em] opacity-30">TRONICS © 2026</p>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </motion.header>
  );
}
