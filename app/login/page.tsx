"use client";

import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import Image from "next/image";
import logo from "@/public/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { RiShieldKeyholeFill, RiLockPasswordLine } from "react-icons/ri";
import { FcGoogle } from "react-icons/fc";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleGoogleLogin = async (credential: string) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credential }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Authentication failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("userId", data.user.userId);

      setSuccess("Welcome! One moment...");
      setTimeout(() => (window.location.href = "/"), 900);
    } catch {
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => handleGoogleLogin(codeResponse.access_token),
    onError: () => setError("Google login failed."),
  });

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[var(--background)] px-4">
      {/* ================= SIMPLE PREMIUM BACKGROUND ================= */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Soft, Static Mesh Gradient */}
        <div className="absolute -top-[20%] -left-[10%] w-[100vw] h-[100vw] rounded-full bg-[var(--accent)]/5 blur-[150px] opacity-50" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[80vw] h-[80vw] rounded-full bg-indigo-500/5 blur-[150px] opacity-50" />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.03] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)]" />
      </div>

      {/* ================= LOGIN CARD ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="
          relative z-10 w-full max-w-md
          rounded-[2rem]
          bg-[var(--card)]/40 backdrop-blur-xl
          border border-[var(--border)]
          shadow-[0_8px_32px_rgba(0,0,0,0.12)]
          overflow-hidden
        "
      >
        <div className="p-8 md:p-10 flex flex-col items-center text-center">
          {/* Premium Logo Section */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-6 relative"
          >
            {/* Subtle glow behind logo */}
            <div className="absolute inset-0 bg-[var(--accent)]/10 blur-[40px] rounded-full" />
            
            <div className="relative w-32 h-32 flex items-center justify-center">
              <Image
                src={logo}
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </motion.div>

          {/* Clean Typography */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-1 mb-8"
          >
            <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)]">
              Welcome
            </h1>
            <p className="text-[var(--muted)] text-sm font-medium opacity-80">
              Login to your account.
            </p>
          </motion.div>

          {/* Actions */}
          <div className="w-full space-y-6">
            {/* Status Messages */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl flex items-center gap-3"
                >
                  <RiLockPasswordLine className="text-base flex-shrink-0" />
                  <span className="text-left font-medium">{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-4 py-3 rounded-xl flex items-center gap-3"
                >
                  <RiShieldKeyholeFill className="text-base flex-shrink-0" />
                  <span className="text-left font-medium">{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-[280px] mx-auto"
            >
              <button
                onClick={() => login()}
                className="
                  group relative w-full flex items-center justify-center gap-3
                  py-3 px-6 rounded-2xl
                  bg-white hover:bg-gray-50
                  text-gray-900 font-bold text-sm
                  border border-gray-200
                  shadow-sm hover:shadow-md
                  hover:-translate-y-0.5
                  transition-all duration-300
                  active:scale-[0.98]
                "
              >
                <FcGoogle className="text-xl" />
                <span className="tracking-tight">Continue with Google</span>
              </button>
            </motion.div>

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center justify-center gap-2 py-2">
                <div className="w-4 h-4 border-[1.5px] border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-[var(--muted)] font-bold tracking-widest uppercase">
                  Processing...
                </span>
              </div>
            )}

            <div className="relative pt-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)] opacity-20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[var(--card)]/10 backdrop-blur-md px-4 text-[9px] tracking-[0.2em] font-bold uppercase text-[var(--muted)]/50">
                  Secure Portal
                </span>
              </div>
            </div>

            <p className="text-[10px] text-[var(--muted)]/40 leading-relaxed font-medium">
              Your login is protected with encryption. <br /> Learn more about our <span className="hover:text-[var(--foreground)] transition-colors cursor-pointer underline underline-offset-4">security</span>.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
