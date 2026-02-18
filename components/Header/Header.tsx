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
    const token = sessionStorage.getItem("token");
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
        else sessionStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    sessionStorage.removeItem("token");
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

      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-20">

        {/* LOGO SECTION */}
        <div className="flex items-center gap-8">
          <Link href="/" className="relative group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative z-10"
            >
              <Image
                src={logo}
                alt="Logo"
                width={110}
                height={32}
                priority
                className="object-contain -ml-1"
              />
            </motion.div>
            <div className="absolute -inset-2 bg-[var(--accent)]/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-1">
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
        </div>

        {/* ACTIONS SECTION */}
        <div className="flex items-center gap-3 sm:gap-4" ref={dropdownRef}>
          {user && (
            <Link
              href="/dashboard/wallet"
              className="flex items-center gap-2 bg-[var(--accent)]/10 border border-[var(--accent)]/30 px-3 py-2 rounded-full hover:bg-[var(--accent)]/20 transition-all group shrink-0 shadow-sm hover:shadow-md"
            >
              <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                <FiPlus className="text-[var(--accent)] text-[10px]" />
              </div>
              <span className="text-sm font-bold text-[var(--accent)]">₹{user.wallet?.toFixed(2) || "0.00"}</span>
            </Link>
          )}

          <ThemeToggle />

          <div className="h-6 w-[1px] bg-[var(--border)] mx-1 hidden sm:block" />

          {/* USER PROFILE / LOGIN */}
          <div className="relative">
            <motion.button
              onClick={() => {
                if (!loading) {
                  if (user) {
                    setUserMenuOpen(!userMenuOpen);
                  } else {
                    window.location.href = "/login";
                  }
                }
              }}
              className={`
                flex items-center gap-2 p-1 pr-3 rounded-full transition-all duration-300
                ${userMenuOpen ? 'bg-[var(--accent)]/10' : 'hover:bg-[var(--card)]/50'}
              `}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center overflow-hidden shadow-sm">
                {!loading && user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="User Avatar"
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <FiUser className="text-white text-sm" />
                )}
              </div>
              <div className="hidden md:flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold">Account</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold truncate max-w-[80px]">
                    {user ? user.username : 'Guest'}
                  </span>
                  <motion.div animate={{ rotate: userMenuOpen ? 180 : 0 }}>
                    <FiChevronDown className="text-xs text-[var(--muted)]" />
                  </motion.div>
                </div>
              </div>
            </motion.button>

            {/* USER DROPDOWN MENU */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={menuVariants}
                  className="absolute right-0 top-[calc(100%+12px)] w-64 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl z-50 px-2 py-3"
                >
                  {!user ? (
                    <div className="p-5 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-gradient-to-tr from-[var(--accent)]/20 to-[var(--card)] rounded-full flex items-center justify-center mb-4 ring-1 ring-[var(--accent)]/20">
                        <FiUser className="text-2xl text-[var(--accent)]" />
                      </div>

                      <h3 className="text-[var(--foreground)] font-bold text-lg mb-1">Welcome!</h3>
                      <p className="text-xs text-[var(--muted)] mb-5 max-w-[80%] leading-relaxed">
                        Sign in to access your wallet, orders, and exclusive offers.
                      </p>

                      <Link href="/login" onClick={() => setUserMenuOpen(false)} className="w-full">
                        <motion.button
                          className="w-full py-3 bg-[var(--accent)] text-white font-bold rounded-xl text-sm shadow-lg shadow-[var(--accent)]/25 flex items-center justify-center gap-2 group relative overflow-hidden"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="relative z-10">Sign In Now</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        </motion.button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* User Info Header */}
                      <div className="px-4 py-4 border-b border-[var(--border)] mb-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0">
                          {user?.avatar ? (
                            <Image
                              src={user.avatar}
                              alt="User Avatar"
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <FiUser className="text-white text-lg" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-[var(--foreground)] truncate">
                            {user.name || user.username || "User"}
                          </span>
                          <span className="text-[10px] text-[var(--muted)] truncate">
                            {user.email}
                          </span>
                        </div>
                      </div>

                      {/* Menu Links */}
                      <div className="space-y-1">
                        {[
                          { label: "Dashboard", icon: FiLayout, href: "/dashboard" },
                          { label: "Orders", icon: FiSettings, href: "/dashboard/order" },
                          { label: "Wallet", icon: FiPlus, href: "/dashboard/wallet" },
                          { label: "Support", icon: FiLifeBuoy, href: "/dashboard/query" },
                          { label: "Leaderboard", icon: FiBarChart2, href: "/leaderboard" },
                        ].map((link) => (
                          <Link key={link.label} href={link.href} onClick={() => setUserMenuOpen(false)}>
                            <motion.div
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--accent)]/10 text-[var(--muted)] hover:text-[var(--accent)] transition-all group"
                              whileHover={{ x: 4 }}
                            >
                              <link.icon className="text-lg group-hover:scale-110 transition-transform" />
                              <span className="text-sm font-medium">{link.label}</span>
                            </motion.div>
                          </Link>
                        ))}

                        {user.userType === "owner" && (
                          <Link href="/owner-panal" onClick={() => setUserMenuOpen(false)}>
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-500/10 text-orange-500 transition-all font-semibold">
                              <FiSettings className="text-lg" />
                              <span className="text-sm">Admin Panel</span>
                            </div>
                          </Link>
                        )}
                      </div>

                      <div className="mt-2 pt-2 border-t border-[var(--border)]">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-all"
                        >
                          <FiLogOut className="text-lg" />
                          <span className="text-sm font-medium">Log Out</span>
                        </button>
                      </div>
                    </>
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
