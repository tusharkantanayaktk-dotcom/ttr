"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { FiPlus, FiChevronDown, FiUser, FiLayout, FiSettings, FiLifeBuoy, FiLogOut, FiBarChart2, FiHome, FiGrid, FiLayers, FiGlobe, FiX, FiChevronRight } from "react-icons/fi";
import Image from "next/image";
import logo from "@/public/logo.png";
import Skeleton from "../Skeleton";
import PWAHeaderButton from "../PWA/PWAHeaderButton";


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
                className="w-9 h-9 object-contain drop-shadow-sm"
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
                <div className="w-full h-full rounded-full bg-[var(--accent)] flex items-center justify-center overflow-hidden shadow-sm">
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
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="fixed right-0 top-0 h-[100dvh] w-[80%] sm:w-[300px] bg-[var(--card)] border-l border-[var(--border)] z-[1001] flex flex-col"
                  >
                    {/* CLOSE BUTTON - FLOATING TOP RIGHT */}
                    <div className="p-4 flex items-center justify-between border-b border-[var(--border)] shrink-0">
                      <div className="flex flex-col">
                        <h2 className="text-xs font-black uppercase tracking-widest text-[var(--foreground)]">Account</h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <motion.button
                          onClick={() => setUserMenuOpen(false)}
                          whileHover={{ rotate: 90, scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 rounded-full bg-[var(--foreground)]/[0.06] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-black transition-colors"
                        >
                          <FiX className="text-lg" />
                        </motion.button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
                      {!user ? (
                        <div className="flex flex-col items-center justify-center text-center">
                          <motion.div
                            initial={{ scale: 0.8, rotate: -5 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="w-16 h-16 bg-gradient-to-br from-[var(--accent)]/25 via-[var(--accent)]/10 to-transparent rounded-[1.2rem] flex items-center justify-center mb-5 border border-[var(--accent)]/30 relative group"
                          >
                            <div className="absolute inset-0 bg-[var(--accent)]/15 blur-xl group-hover:blur-2xl transition-all opacity-70" />
                            <FiUser className="text-3xl text-[var(--accent)] relative z-10" />
                          </motion.div>

                          <h3 className="text-[var(--foreground)] font-black uppercase tracking-tight text-xl mb-1 leading-none">
                            Welcome, <span className="text-[var(--accent)]">User</span>
                          </h3>
                          <p className="text-xs text-[var(--muted)] mb-6 font-medium leading-relaxed max-w-[200px]">
                            Sign in to access your wallet and orders.
                          </p>

                          {/* Mobile/Guest Navigation Nodes */}
                          <div className="grid grid-cols-2 gap-2 w-full mb-8">
                            {[
                              { label: "Games", icon: FiGrid, href: "/games" },
                              { label: "Regions", icon: FiGlobe, href: "/region" }
                            ].map((link) => (
                              <Link key={link.label} href={link.href} onClick={() => setUserMenuOpen(false)}>
                                <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-[var(--foreground)]/[0.04] border border-[var(--border)] hover:bg-[var(--accent)]/10 hover:border-[var(--accent)] text-[var(--foreground)] transition-all group text-center">
                                  <link.icon className="text-xl text-[var(--accent)] group-hover:scale-110 transition-transform" />
                                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">{link.label}</span>
                                </div>
                              </Link>
                            ))}
                          </div>

                          <Link href="/login" onClick={() => setUserMenuOpen(false)} className="w-full mt-auto">
                            <motion.button
                              className="w-full py-3.5 bg-[var(--accent)] text-black font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 shadow-md group relative overflow-hidden"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span className="relative z-10">Sign In</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                            </motion.button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* User Profile Header horizontal - COMPACT */}
                          <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)] relative">
                            {/* Left: Avatar */}
                            <div className="w-11 h-11 rounded-xl bg-[var(--accent)] p-[1.5px] shrink-0">
                              <div className="w-full h-full rounded-[0.65rem] overflow-hidden bg-[var(--card)]">
                                {user?.avatar && !avatarError ? (
                                  <img
                                    src={user.avatar}
                                    alt="User Avatar"
                                    className="object-cover w-full h-full"
                                    onError={() => setAvatarError(true)}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-[var(--accent)] text-black font-black text-sm uppercase">
                                    {user.name?.charAt(0) || "U"}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Center: Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-black uppercase tracking-tight text-[var(--foreground)] truncate">
                                {user.name}
                              </h4>
                              <p className="text-xs text-[var(--muted)] truncate font-mono font-medium">
                                {user.email}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`
                                  text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border
                                  ${user.userType === "owner" 
                                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" 
                                    : user.userType === "admin"
                                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30"
                                    : "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/30"}
                                `}>
                                  {user.userType === "owner" ? "Owner" : user.userType === "admin" ? "Reseller" : "User"}
                                </span>
                              </div>
                            </div>

                            {/* Right: Logout Icon */}
                            <motion.button
                              onClick={handleLogout}
                              className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shrink-0 border border-red-500/20"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              title="Sign Out"
                            >
                              <FiLogOut size={18} strokeWidth={2.5} />
                            </motion.button>
                          </div>

                          {/* Prominent Wallet Section inside sidebar */}
                          <Link
                            href="/dashboard/wallet"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--accent)]/[0.09] border border-[var(--accent)]/30 hover:bg-[var(--accent)]/[0.15] transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-black">
                                <FiPlus size={14} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-wider text-[var(--foreground)]/70">Wallet Balance</span>
                                <span className="text-lg font-black text-[var(--foreground)] tracking-tight">₹{user.wallet?.toFixed(1) || "0.0"}</span>
                              </div>
                            </div>
                            <div className="w-7 h-7 rounded-full bg-[var(--foreground)]/[0.06] flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:text-black transition-all">
                              <FiChevronRight size={14} />
                            </div>
                          </Link>

                          {/* Navigation nodes compacted */}
                          <div className="space-y-1">
                            <div className="lg:hidden grid grid-cols-2 gap-2 mb-3">
                              {[
                                { label: "Games", icon: FiGrid, href: "/games" },
                                { label: "Regions", icon: FiGlobe, href: "/region" }
                              ].map((link) => (
                                <Link key={link.label} href={link.href} onClick={() => setUserMenuOpen(false)}>
                                  <div className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[var(--foreground)]/[0.04] text-[var(--foreground)] group transition-all border border-[var(--border)] hover:border-[var(--accent)]/40 text-center">
                                    <link.icon className="text-lg text-[var(--accent)] group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">{link.label}</span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                            <div className="h-[1px] bg-[var(--border)] mx-2 my-2" />

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
                                  className="relative flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[var(--foreground)]/[0.06] text-[var(--foreground)] group transition-all duration-200 border border-transparent hover:border-[var(--border)]"
                                  whileHover={{ x: -2 }}
                                >
                                  <div className="flex items-center gap-3">
                                    <link.icon className="text-lg text-[var(--accent)] transition-all duration-200" />
                                    <span className="text-xs font-bold uppercase tracking-wide text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">{link.label}</span>
                                  </div>
                                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-all duration-200" />
                                </motion.div>
                              </Link>
                            ))}

                            {user.userType === "owner" && (
                              <Link href="/owner-panal" onClick={() => setUserMenuOpen(false)}>
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 }}
                                  className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[var(--accent)] text-black font-black text-xs uppercase tracking-wider shadow-sm hover:brightness-110 transition-all mt-4 group"
                                  whileHover={{ scale: 1.02 }}
                                >
                                  <FiSettings size={15} className="group-hover:rotate-90 transition-transform duration-700" />
                                  <span>Admin Panel</span>
                                </motion.div>
                              </Link>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* FOOTER OF SIDEBAR */}
                    <div className="p-3 border-t border-[var(--border)] mt-auto bg-[var(--foreground)]/[0.02] text-center space-y-0.5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)]">Love from TK</p>
                      <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider">TRONICS © 2026</p>
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
