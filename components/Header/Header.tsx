"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { FiPlus, FiChevronDown, FiUser, FiLayout, FiSettings, FiLifeBuoy, FiLogOut, FiBarChart2, FiHome, FiGrid, FiLayers, FiGlobe } from "react-icons/fi";
import Image from "next/image";
import logo from "@/public/logo.png";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
      className={`fixed top-0 left-0 w-full z-[80] transition-colors duration-500`}
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

      <div className="max-w-7xl mx-auto flex items-center justify-between px-2 sm:px-4 h-11 relative">

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
            { name: "Services", href: "/services", icon: FiLayers },
            { name: "Regions", href: "/regions", icon: FiGlobe }
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
            <motion.button
              onClick={() => {
                if (!loading) {
                  setUserMenuOpen(!userMenuOpen);
                }
              }}
              className={`
                flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300
                ${userMenuOpen ? 'bg-[var(--accent)] ring-2 ring-[var(--accent)]/50' : 'hover:bg-[var(--card)]/50 border border-transparent hover:border-[var(--border)]'}
              `}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="w-full h-full rounded-full bg-[var(--accent)] flex items-center justify-center overflow-hidden shadow-sm">
                {!loading && user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="User Avatar"
                    width={28}
                    height={28}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <FiUser className="text-white text-xs" />
                )}
              </div>
            </motion.button>

            {/* USER DROPDOWN MENU */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.98, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 10, scale: 0.98, filter: "blur(10px)" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="absolute right-0 top-[calc(100%+12px)] w-64 bg-[var(--card)]/95 border border-[var(--border)] rounded-[1.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-3xl z-50 p-1.5"
                >
                  <div className="absolute inset-0 bg-[var(--card)] pointer-events-none" />

                  {!user ? (
                    <div className="p-7 flex flex-col items-center justify-center text-center relative z-10">
                      <motion.div
                        initial={{ scale: 0.8, rotate: -5 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-20 h-20 bg-gradient-to-br from-[var(--accent)]/25 via-[var(--accent)]/10 to-transparent rounded-2xl flex items-center justify-center mb-6 border border-[var(--accent)]/30 shadow-[0_15px_30px_-5px_rgba(var(--accent-rgb),0.2)] relative group"
                      >
                        <div className="absolute inset-0 bg-[var(--accent)]/10 blur-xl group-hover:blur-2xl transition-all opacity-60" />
                        <FiUser className="text-3xl text-[var(--accent)] relative z-10" />
                      </motion.div>

                      <h3 className="text-[var(--foreground)] font-black italic uppercase tracking-tighter text-2xl mb-2 leading-none">Welcome, <span className="text-[var(--accent)]">User</span></h3>
                      <p className="text-xs text-[var(--muted)] mb-8 font-bold uppercase tracking-[0.2em] opacity-50 max-w-[90%] leading-relaxed">
                        Sign in to access your wallet and orders.
                      </p>

                      {/* Mobile Guest Navigation */}
                      <div className="lg:hidden flex flex-col gap-1 w-full mb-8">
                        {[
                          { label: "Games", icon: FiGrid, href: "/games" },
                          { label: "Services", icon: FiLayers, href: "/services" },
                          { label: "Regions", icon: FiGlobe, href: "/regions" }
                        ].map((link) => (
                          <Link key={link.label} href={link.href} onClick={() => setUserMenuOpen(false)}>
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--foreground)]/[0.03] hover:bg-[var(--foreground)]/[0.06] text-[var(--muted)] transition-all">
                              <link.icon className="text-lg text-[var(--accent)]" />
                              <span className="text-sm font-bold uppercase tracking-wider">{link.label}</span>
                            </div>
                          </Link>
                        ))}
                      </div>

                      <Link href="/login" onClick={() => setUserMenuOpen(false)} className="w-full">
                        <motion.button
                          className="w-full py-4 bg-[var(--foreground)] text-[var(--background)] font-black italic uppercase tracking-[0.3em] text-[10px] rounded-xl shadow-xl flex items-center justify-center gap-2 group relative overflow-hidden"
                          whileHover={{ scale: 1.02, backgroundColor: 'var(--accent)', color: 'black' }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="relative z-10">Sign In</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                        </motion.button>
                      </Link>
                    </div>
                  ) : (
                    <div className="relative z-10">
                      <div className="px-4 py-3 mb-1 flex items-center justify-between border-b border-[var(--border)]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[var(--accent)] shrink-0 overflow-hidden">
                            {user?.avatar ? (
                              <Image
                                src={user.avatar}
                                alt="User Avatar"
                                width={36}
                                height={36}
                                className="object-cover w-full h-full rounded-full"
                              />
                            ) : (
                              <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center">
                                <FiUser className="text-white text-xl" />
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-[var(--foreground)] truncate leading-tight">
                              {user.name || user.username}
                            </span>
                            <span className="text-[10px] font-medium text-[var(--muted)]/60 truncate">
                              {user.email}
                            </span>
                          </div>
                        </div>

                        {/* TOP RIGHT LOGOUT ICON */}
                        <motion.button
                          onClick={handleLogout}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all ml-1"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiLogOut size={14} strokeWidth={2.5} />
                        </motion.button>
                      </div>

                      {/* Navigation Nodes */}
                      <div className="space-y-0.5 mt-4">
                        {/* Mobile Regular Navigation */}
                        <div className="lg:hidden mb-4 space-y-0.5">
                          {[
                            { label: "Games", icon: FiGrid, href: "/games" },
                            { label: "Services", icon: FiLayers, href: "/services" },
                            { label: "Regions", icon: FiGlobe, href: "/regions" }
                          ].map((link) => (
                            <Link key={link.label} href={link.href} onClick={() => setUserMenuOpen(false)}>
                              <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg hover:bg-[var(--foreground)]/[0.04] text-[var(--muted)] group transition-all">
                                <link.icon className="text-lg text-[var(--accent)]" />
                                <span className="text-sm font-bold uppercase tracking-wider group-hover:text-[var(--foreground)]">{link.label}</span>
                              </div>
                            </Link>
                          ))}
                          <div className="h-[1px] bg-[var(--border)] mx-2 my-2 opacity-30" />
                        </div>

                        {[
                          { label: "Dashboard", icon: FiLayout, href: "/dashboard" },
                          { label: "Orders", icon: FiSettings, href: "/dashboard/order" },
                          { label: "Wallet", icon: FiPlus, href: "/dashboard/wallet" },
                          { label: "Support", icon: FiLifeBuoy, href: "/dashboard/query" },
                          { label: "Leaderboard", icon: FiBarChart2, href: "/leaderboard" },
                        ].map((link, idx) => (
                          <Link key={link.label} href={link.href} onClick={() => setUserMenuOpen(false)}>
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="relative flex items-center justify-between px-3.5 py-2.5 rounded-lg hover:bg-[var(--foreground)]/[0.04] text-[var(--muted)] group transition-all duration-300"
                              whileHover={{ x: 4 }}
                            >
                              <div className="flex items-center gap-3">
                                <link.icon className="text-lg opacity-50 group-hover:opacity-100 group-hover:text-[var(--accent)] transition-all duration-300" />
                                <span className="text-sm font-semibold group-hover:text-[var(--foreground)] transition-colors">{link.label}</span>
                              </div>
                              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-all duration-300" />
                            </motion.div>
                          </Link>
                        ))}

                        {user.userType === "owner" && (
                          <Link href="/owner-panal" onClick={() => setUserMenuOpen(false)}>
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 hover:bg-orange-500/20 transition-all mt-2 group"
                              whileHover={{ scale: 1.02 }}
                            >
                              <FiSettings size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                              <span className="text-sm font-bold uppercase tracking-tight">Admin Panel</span>
                            </motion.div>
                          </Link>
                        )}
                      </div>

                      <div className="h-2" />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </motion.header>
  );
}
