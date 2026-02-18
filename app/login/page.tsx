"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import Image from "next/image";
import logo from "@/public/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { RiShieldKeyholeFill, RiLockPasswordLine } from "react-icons/ri";

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

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("userName", data.user.name);
      sessionStorage.setItem("email", data.user.email);
      sessionStorage.setItem("userId", data.user.userId);

      setSuccess("Welcome back! Redirecting...");
      setTimeout(() => (window.location.href = "/"), 900);
    } catch {
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[var(--background)] px-4">
      {/* ================= ANIMATED BACKGROUND ================= */}
      <div className="absolute inset-0 z-0">
        {/* Deep mesh gradient */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-[var(--accent)]/5 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-purple-500/5 blur-[120px]"
        />

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* ================= LOGIN CARD ================= */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="
          relative z-10 w-full max-w-md
          rounded-3xl
          bg-[var(--card)]/80 backdrop-blur-2xl
          border border-[var(--border)]
          shadow-2xl shadow-black/40
          overflow-hidden
        "
      >
        {/* Top Decorative Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50" />

        <div className="p-8 md:p-10 flex flex-col items-center text-center">

          {/* Logo Container */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 relative group"
          >
            <div className="absolute inset-0 bg-[var(--accent)]/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--background)] to-[var(--card)] border border-[var(--border)] p-4 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
              <Image
                src={logo}
                alt="Meowji Logo"
                fill
                className="object-contain p-2"
              />
            </div>
          </motion.div>

          {/* Texts */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-2 mb-8"
          >
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-[var(--foreground)] to-[var(--foreground)]/70">
              Welcome Back
            </h1>
            <p className="text-[var(--muted)] text-sm px-4">
              Access your dashboard, track orders & manage your profile securely.
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full space-y-6"
          >
            {/* Status Messages */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2"
                >
                  <RiLockPasswordLine /> {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2"
                >
                  <RiShieldKeyholeFill /> {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Button Wrapper - Custom Styling via Container */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/0 via-[var(--accent)]/10 to-[var(--accent)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-full" />
              <div className="flex justify-center transform transition-transform active:scale-95 duration-200">
                <GoogleLogin
                  onSuccess={(res) =>
                    res.credential && handleGoogleLogin(res.credential)
                  }
                  onError={() => setError("Authorization Failed")}
                  theme="filled_black"
                  size="large"
                  shape="pill"
                  width="100%"
                  text="continue_with"
                />
              </div>
            </div>

            {/* Spinner */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 text-xs text-[var(--accent)] font-medium"
              >
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Verifying Credentials...
              </motion.div>
            )}

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[var(--card)] px-2 text-[var(--muted)]">SECURE LOGIN</span>
              </div>
            </div>

            <p className="text-[10px] text-[var(--muted)]/60 text-center max-w-xs mx-auto">
              By logging in, you agree to our Terms of Service & Privacy Policy.
              Protected by reCAPTCHA.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
