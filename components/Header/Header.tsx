"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { FiPlus, FiChevronDown, FiUser, FiLayout, FiSettings, FiLifeBuoy, FiLogOut, FiBarChart2, FiHome, FiGrid, FiLayers, FiGlobe, FiX, FiChevronRight, FiSearch } from "react-icons/fi";
import Image from "next/image";
import logo from "@/public/logo.png";
import Skeleton from "../Skeleton";
import PWAHeaderButton from "../PWA/PWAHeaderButton";
import SearchModal from "./SearchModal";


export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [avatarError, setAvatarError] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

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
    let lastState = window.scrollY > 20;
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== lastState) {
        lastState = isScrolled;
        setScrolled(isScrolled);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= GLOBAL SEARCH SHORTCUT ================= */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
          <Link href="/" className="relative group flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 flex items-center"
            >
              <Image
                src={logo}
                alt="Tronics Logo"
                width={36}
                height={36}
                priority
                className="w-9 h-9 object-contain"
              />
            </motion.div>
            <span className="font-black text-base sm:text-lg tracking-tighter uppercase italic bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground)]/80 bg-clip-text">
              Tronics<span className="text-[var(--accent)]">Store</span>
            </span>
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
        <div className="flex items-center gap-2 sm:gap-3" ref={dropdownRef}>
          {/* Quick Search Button */}
          <motion.button
            onClick={() => setSearchOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[var(--foreground)]/[0.04] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/50 transition-all text-xs"
            title="Search games & items (Ctrl+K)"
          >
            <FiSearch size={14} className="text-[var(--accent)]" />
            <span className="hidden md:inline font-medium">Search</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.2 text-[9px] font-mono rounded bg-[var(--foreground)]/[0.06] border border-[var(--border)] text-[var(--muted)]">
              ⌘K
            </kbd>
          </motion.button>

          {/* PWA Download Button */}
          <PWAHeaderButton />

          <ThemeToggle />

          <div className="h-6 w-[1px] bg-[var(--border)] mx-0.5 hidden sm:block" />

          {/* USER PROFILE / LOGIN */}
          <div className="relative mr-2">
            {loading ? (
              <Skeleton variant="circle" className="w-9 h-9 border-none" />
            ) : (
              <motion.button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                }}
                className={`
                  flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300
                  ${userMenuOpen ? 'bg-[var(--accent)] ring-2 ring-[var(--accent)]/50' : 'hover:bg-[var(--card)]/50 border border-transparent hover:border-[var(--border)]'}
                `}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="w-full h-full rounded-full bg-[var(--accent)] flex items-center justify-center overflow-hidden">
                  {user?.avatar && !avatarError ? (
                    <img
                      src={user.avatar}
                      alt="User Avatar"
                      className="object-cover w-full h-full"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span className="text-white text-[12px] font-black uppercase">
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
                    transition={{ type: "spring", damping: 28, stiffness: 280 }}
                    className="fixed right-0 top-0 h-[100dvh] w-[88vw] max-w-[310px] bg-[var(--card)]/95 backdrop-blur-2xl border-l border-[var(--border)] z-[1001] flex flex-col"
                  >
                    {/* Top Header Bar */}
                    <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--border)] shrink-0 bg-[var(--foreground)]/[0.01]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)]/90">Account</span>
                      </div>
                      <motion.button
                        onClick={() => setUserMenuOpen(false)}
                        whileHover={{ rotate: 90, scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-7 h-7 rounded-lg bg-[var(--foreground)]/[0.05] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/50 transition-all"
                      >
                        <FiX size={14} />
                      </motion.button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3.5 py-3 custom-scrollbar flex flex-col gap-3">
                      {!user ? (
                        <div className="flex flex-col items-center justify-center text-center py-6 my-auto">
                          {/* Guest Icon */}
                          <div className="relative mb-4 group">
                            <div className="w-14 h-14 bg-gradient-to-br from-[var(--accent)]/20 via-[var(--card)] to-[var(--foreground)]/[0.04] text-[var(--accent)] rounded-2xl flex items-center justify-center border border-[var(--accent)]/30 relative z-10">
                              <FiUser size={24} />
                            </div>
                          </div>

                          <h3 className="text-[var(--foreground)] font-bold text-sm mb-1">
                            Welcome
                          </h3>
                          <p className="text-[11px] text-[var(--muted)] mb-5 max-w-[210px] leading-relaxed">
                            Sign in to access your wallet, orders, and special discounts.
                          </p>

                          {/* Quick Links Grid */}
                          <div className="grid grid-cols-2 gap-2 w-full mb-4">
                            {[
                              { label: "Games", desc: "All Games", icon: FiGrid, href: "/games" },
                              { label: "Regions", desc: "Select Region", icon: FiGlobe, href: "/region" }
                            ].map((link) => (
                              <Link key={link.label} href={link.href} onClick={() => setUserMenuOpen(false)}>
                                <div className="flex flex-col items-start p-2.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/[0.04] text-[var(--foreground)] transition-all group">
                                  <link.icon size={15} className="text-[var(--accent)] mb-1.5 group-hover:scale-110 transition-transform" />
                                  <span className="text-[11px] font-bold tracking-tight leading-none">{link.label}</span>
                                  <span className="text-[9px] text-[var(--muted)] font-mono mt-0.5">{link.desc}</span>
                                </div>
                              </Link>
                            ))}
                          </div>

                          <Link href="/login" onClick={() => setUserMenuOpen(false)} className="w-full">
                            <motion.button
                              className="w-full py-2.5 bg-[var(--accent)] text-black font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span>Sign In</span>
                            </motion.button>
                          </Link>
                        </div>
                      ) : (
                        <>
                          {/* USER PROFILE CARD */}
                          <div className="relative p-3 rounded-2xl bg-gradient-to-br from-[var(--accent)]/[0.08] via-[var(--card)] to-[var(--foreground)]/[0.02] border border-[var(--accent)]/25 overflow-hidden">
                            {/* Ambient Glow */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent)]/10 rounded-full blur-2xl pointer-events-none" />

                            <div className="flex items-center gap-2.5 relative z-10">
                              {/* Avatar */}
                              <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-[var(--accent)] p-[1.5px]">
                                  <div className="w-full h-full rounded-[0.6rem] overflow-hidden bg-[var(--card)] flex items-center justify-center">
                                    {user?.avatar && !avatarError ? (
                                      <img
                                        src={user.avatar}
                                        alt="Avatar"
                                        className="object-cover w-full h-full"
                                        onError={() => setAvatarError(true)}
                                      />
                                    ) : (
                                      <span className="text-[var(--accent)] font-black text-sm uppercase">
                                        {user.name?.charAt(0) || "U"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--card)]" />
                              </div>

                              {/* Identity Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-xs font-bold text-[var(--foreground)] truncate">
                                    {user.name}
                                  </h4>
                                </div>
                                <p className="text-[10px] text-[var(--muted)] truncate font-mono">
                                  {user.email}
                                </p>
                                <div className="mt-1">
                                  <span className={`
                                    text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border inline-block
                                    ${user.userType === "owner" 
                                      ? "bg-amber-500/15 text-amber-500 border-amber-500/30" 
                                      : user.userType === "admin"
                                      ? "bg-purple-500/15 text-purple-500 border-purple-500/30"
                                      : "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/30"}
                                  `}>
                                    {user.userType === "owner" ? "👑 Owner" : user.userType === "admin" ? "⚡ Reseller" : "User"}
                                  </span>
                                </div>
                              </div>

                              {/* Logout Button */}
                              <motion.button
                                onClick={handleLogout}
                                className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shrink-0 border border-red-500/20"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.9 }}
                                title="Sign Out"
                              >
                                <FiLogOut size={13} />
                              </motion.button>
                            </div>
                          </div>

                          {/* WALLET BALANCE CARD */}
                          <div className="p-3 rounded-2xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] relative overflow-hidden">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">Wallet Balance</span>
                              <span className="text-[9px] font-mono text-[var(--accent)] uppercase font-bold">Active</span>
                            </div>
                            <div className="flex items-end justify-between">
                              <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black text-[var(--foreground)] tracking-tight font-mono">
                                  ₹{user.wallet?.toFixed(1) || "0.0"}
                                </span>
                              </div>
                              <Link
                                href="/dashboard/wallet"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="px-2.5 py-1 rounded-lg bg-[var(--accent)] text-black font-black text-[10px] uppercase tracking-wider flex items-center gap-1"
                                >
                                  <FiPlus size={11} />
                                  <span>Add Money</span>
                                </motion.button>
                              </Link>
                            </div>
                          </div>

                          {/* 2x2 SHORTCUT TILES */}
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: "Orders", desc: "Purchase History", icon: FiSettings, href: "/dashboard/order" },
                              { label: "Leaderboard", desc: "Top Users", icon: FiBarChart2, href: "/leaderboard" },
                              { label: "Games", desc: "All Games", icon: FiGrid, href: "/games" },
                              { label: "Regions", desc: "Countries", icon: FiGlobe, href: "/region" },
                            ].map((tile) => (
                              <Link key={tile.label} href={tile.href} onClick={() => setUserMenuOpen(false)}>
                                <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/[0.04] transition-all group flex flex-col justify-between h-full">
                                  <div className="flex items-center justify-between mb-2">
                                    <tile.icon size={14} className="text-[var(--accent)] group-hover:scale-110 transition-transform" />
                                    <FiChevronRight size={11} className="text-[var(--muted)] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                  </div>
                                  <div>
                                    <div className="text-[11px] font-bold text-[var(--foreground)] tracking-tight leading-none">{tile.label}</div>
                                    <div className="text-[9px] text-[var(--muted)] font-mono mt-0.5">{tile.desc}</div>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>

                          {/* ESSENTIAL LINKS */}
                          <div className="space-y-1">
                            {[
                              { label: "Dashboard", icon: FiLayout, href: "/dashboard" },
                              { label: "Help & Support", icon: FiLifeBuoy, href: "/dashboard/query" },
                            ].map((link) => (
                              <Link key={link.label} href={link.href} onClick={() => setUserMenuOpen(false)}>
                                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--foreground)]/[0.015] border border-[var(--border)]/60 hover:border-[var(--accent)]/30 hover:bg-[var(--foreground)]/[0.04] transition-all group">
                                  <div className="flex items-center gap-2.5">
                                    <link.icon size={13} className="text-[var(--accent)]" />
                                    <span className="text-xs font-semibold text-[var(--foreground)]/90 group-hover:text-[var(--foreground)]">{link.label}</span>
                                  </div>
                                  <FiChevronRight size={12} className="text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </Link>
                            ))}
                          </div>

                          {/* OWNER ADMIN PANEL */}
                          {user.userType === "owner" && (
                            <Link href="/owner-panal" onClick={() => setUserMenuOpen(false)} className="mt-0.5">
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-[var(--accent)]/20 to-amber-500/10 border border-amber-500/30 text-[var(--foreground)] font-bold text-xs uppercase tracking-wider flex items-center justify-between hover:border-amber-500/60 transition-all group"
                              >
                                <div className="flex items-center gap-2">
                                  <FiSettings size={13} className="text-amber-500 group-hover:rotate-90 transition-transform duration-500" />
                                  <span className="text-[11px] font-black tracking-wide">Owner Panel</span>
                                </div>
                                <span className="text-[9px] font-mono text-amber-500 uppercase font-black px-1.5 py-0.5 rounded bg-amber-500/10">ADMIN</span>
                              </motion.div>
                            </Link>
                          )}
                        </>
                      )}
                    </div>

                    {/* Simple Footer */}
                    <div className="py-2.5 px-4 border-t border-[var(--border)] shrink-0 flex items-center justify-between bg-[var(--foreground)]/[0.01]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                        <span className="text-[9px] font-mono text-[var(--muted)] uppercase tracking-wider">TRONICS STORE</span>
                      </div>
                      <span className="text-[9px] font-mono text-[var(--muted)]/60">© 2026</span>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* SEARCH MODAL */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </motion.header>
  );
}
