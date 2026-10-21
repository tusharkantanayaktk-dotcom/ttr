"use client";

import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import Image from "next/image";
const logo = "/logo.svg";
import { motion, AnimatePresence } from "framer-motion";
import { RiShieldKeyholeFill, RiLockPasswordLine, RiPhoneFill } from "react-icons/ri";
import { FcGoogle } from "react-icons/fc";
import { FiArrowLeft } from "react-icons/fi";

interface GoogleAuthResponse {
  success: boolean;
  message?: string;
  token: string;
  needsPhone?: boolean;
  user: {
    name: string;
    email: string;
    phone?: string | null;
    userId: string;
    userType: string;
  };
}

export default function AuthPage() {
  const [step, setStep] = useState<"login" | "phone">("login");
  const [loading, setLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pendingAuth, setPendingAuth] = useState<GoogleAuthResponse | null>(null);

  const completeLoginSession = (
    token: string,
    user: GoogleAuthResponse["user"],
    phone?: string | null
  ) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userName", user.name || "");
    localStorage.setItem("email", user.email || "");
    localStorage.setItem("userId", user.userId || "");
    if (phone) {
      localStorage.setItem("phone", phone);
    }

    setSuccess("Welcome! One moment...");
    setTimeout(() => (window.location.href = "/"), 900);
  };

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

      const data: GoogleAuthResponse = await res.json();
      if (!data.success) {
        setError(data.message || "Authentication failed");
        return;
      }

      // If user already has a phone number registered, do NOT ask for phone!
      if (data.user?.phone && !data.needsPhone) {
        completeLoginSession(data.token, data.user, data.user.phone);
      } else {
        // User does not have a phone number, prompt for phone number
        setPendingAuth(data);
        setStep("phone");
      }
    } catch {
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingAuth) return;

    let cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length === 12 && cleanPhone.startsWith("91")) {
      cleanPhone = cleanPhone.slice(2);
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith("0")) {
      cleanPhone = cleanPhone.slice(1);
    }

    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setPhoneLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/update-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pendingAuth.token}`,
        },
        body: JSON.stringify({
          phone: cleanPhone,
          token: pendingAuth.token,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to update phone number.");
        return;
      }

      completeLoginSession(
        pendingAuth.token,
        data.user || pendingAuth.user,
        cleanPhone
      );
    } catch {
      setError("Failed to save phone number. Please try again.");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleCancelPhone = () => {
    setStep("login");
    setPendingAuth(null);
    setPhoneNumber("");
    setError("");
    setSuccess("");
  };

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => handleGoogleLogin(codeResponse.access_token),
    onError: () => setError("Google login failed."),
  });

  return (
    <section className="relative min-h-screen w-full flex items-start justify-center overflow-hidden bg-[var(--background)] px-4 pt-12 md:pt-16">
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
        className="relative z-10 w-full max-w-md overflow-hidden"
      >
        <div className="px-8 pt-6 pb-10 md:px-10 md:pt-8 md:pb-12 flex flex-col items-center text-center">
          {/* Premium Logo Section */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-4 relative"
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

          <AnimatePresence mode="wait">
            {step === "login" ? (
              <motion.div
                key="step-login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center"
              >
                {/* Clean Typography */}
                <div className="space-y-1 mb-6">
                  <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)]">
                    Welcome
                  </h1>
                  <p className="text-[var(--muted)] text-sm font-medium opacity-80">
                    Sign in to continue.
                  </p>
                </div>

                {/* Actions */}
                <div className="w-full space-y-4">
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
                      disabled={loading}
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
                        cursor-pointer
                        disabled:opacity-60 disabled:cursor-not-allowed
                      "
                    >
                      <FcGoogle className="text-xl" />
                      <span className="tracking-tight">Login with Google</span>
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
                      <span className="px-4 text-[9px] tracking-[0.2em] font-bold uppercase text-[var(--muted)]/50">
                        Safe Login
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-[var(--muted)]/40 leading-relaxed font-medium">
                    Your account is safe with us.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step-phone"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center"
              >
                {/* Header for Phone Step */}
                <div className="space-y-1 mb-6 text-center">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
                    Enter Phone Number
                  </h1>
                  <p className="text-[var(--muted)] text-xs sm:text-sm font-medium opacity-80 max-w-xs mx-auto">
                    {pendingAuth?.user?.name
                      ? `Hi ${pendingAuth.user.name}, please enter your mobile number to continue.`
                      : "Please enter your mobile number to continue."}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handlePhoneSubmit} className="w-full space-y-4">
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

                  {/* Phone Input */}
                  <div className="w-full max-w-[320px] mx-auto text-left space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] ml-1">
                      Mobile Number
                    </label>
                    <div className="flex items-center gap-2 px-3.5 py-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] focus-within:border-[var(--accent)] transition-all shadow-inner">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--foreground)] border-r border-[var(--border)] pr-2.5 shrink-0 select-none">
                        <RiPhoneFill className="text-[var(--accent)] text-sm" />
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        autoFocus
                        value={phoneNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setPhoneNumber(val);
                          if (error) setError("");
                        }}
                        placeholder="10-digit number"
                        className="w-full bg-transparent text-sm font-semibold text-[var(--foreground)] placeholder-[var(--muted)]/40 focus:outline-none tracking-widest"
                      />
                      <span className="text-[10px] text-[var(--muted)] font-mono shrink-0 select-none">
                        {phoneNumber.length}/10
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="w-full max-w-[320px] mx-auto pt-1 space-y-3">
                    <button
                      type="submit"
                      disabled={phoneLoading || phoneNumber.length !== 10}
                      className={`
                        group relative w-full flex items-center justify-center gap-2
                        py-3 px-6 rounded-2xl font-bold text-sm
                        transition-all duration-300
                        ${
                          phoneNumber.length === 10 && !phoneLoading
                            ? "bg-[var(--accent)] text-black hover:opacity-90 shadow-md hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
                            : "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed opacity-50"
                        }
                      `}
                    >
                      {phoneLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-[1.5px] border-black border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </div>
                      ) : (
                        <span>Continue</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelPhone}
                      disabled={phoneLoading}
                      className="w-full flex items-center justify-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors py-1 cursor-pointer font-medium"
                    >
                      <FiArrowLeft className="text-xs" />
                      <span>Use a different account</span>
                    </button>
                  </div>

                  <div className="relative pt-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[var(--border)] opacity-20"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 text-[9px] tracking-[0.2em] font-bold uppercase text-[var(--muted)]/50">
                        Safe Login
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-[var(--muted)]/40 leading-relaxed font-medium">
                    Your account is safe with us.
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
