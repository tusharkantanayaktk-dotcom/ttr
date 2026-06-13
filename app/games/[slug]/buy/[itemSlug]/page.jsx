"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiHash, FiSearch, FiArrowLeft, FiCheck, FiHelpCircle } from "react-icons/fi";
import AuthGuard from "../../../../../components/AuthGuard";
import Skeleton from "@/components/Skeleton";
import logo from "@/public/logo.png";
import { saveVerifiedPlayer } from "@/utils/storage/verifiedPlayerStorage";
import RecentVerifiedPlayers from "../../../../region/RecentVerifiedPlayers";
import ReviewAndPaymentStep from "./ReviewAndPaymentStep";

export default function BuyFlowPage() {
  const { slug, itemSlug: initialItemSlug } = useParams();
  const router = useRouter();
  const params = useSearchParams();

  /* ================= FLOW STATE ================= */
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [reviewData, setReviewData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= USER DATA ================= */
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);

  /* ================= GAME & ITEM DATA ================= */
  const [game, setGame] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [allItems, setAllItems] = useState([]);

  /* ================= FALLBACK (UI ONLY) ================= */
  const fallbackImage = params.get("image");

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;
        setUserEmail(data.user.email);
        setUserPhone(data.user.phone);
        setWalletBalance(data.user.wallet || 0);
      });
  }, []);

  /* ================= FETCH GAME & ALL ITEMS ================= */
  useEffect(() => {
    if (!slug) return;
    const token = localStorage.getItem("token");

    fetch(`/api/games/${slug}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then(res => res.json())
      .then(data => {
        const gameData = data?.data;
        if (!gameData) return;
        setGame(gameData);

        const items = [...(gameData.itemId || [])].sort(
          (a, b) => a.sellingPrice - b.sellingPrice
        );
        setAllItems(items);

        const foundItem = items.find((i) => i.itemSlug === initialItemSlug);
        if (foundItem) {
          setActiveItem(foundItem);
        } else if (items.length > 0) {
          setActiveItem(items[0]);
        }
      })
      .catch(() => setError("Failed to load game items"));
  }, [slug, initialItemSlug]);

  /* ================= GAME CONFIG ================= */
  const isMLBB = slug?.toLowerCase().includes("mlbb") || slug?.toLowerCase().includes("mobile-legends") || slug?.toLowerCase().includes("legends988") || slug?.toLowerCase().includes("bundle931") || slug?.toLowerCase().includes("magic-chess-gogo");
  const isBGMI = slug?.toLowerCase().includes("pubg") || slug?.toLowerCase().includes("bgmi");
  const isOTT = slug?.toLowerCase().includes("netflix") || slug?.toLowerCase().includes("youtube");
  const isMembership = slug?.toLowerCase().includes("membership");

  const needsZoneId = isMLBB;
  const isVerificationBypass = isOTT || isMembership || game?.isValidationRequired === false;

  /* ================= VALIDATE PLAYER ================= */
  const handleValidate = async () => {
    setError("");
    if (!playerId || (needsZoneId && !zoneId)) {
      setError(`Please enter your Player ID${needsZoneId ? " and Zone ID" : ""}`);
      return;
    }

    setLoading(true);
    const name = game?.gameName?.toLowerCase() || "";
    const isMLBB_local = slug.includes("mlbb") || name.includes("mlbb") || slug.includes("legends988");

    if (isVerificationBypass) {
      const vData = {
        playerId,
        zoneId: zoneId || "NA",
        username: isBGMI ? "BGMI Player" : (isOTT ? "OTT User" : (isMembership ? "Member" : "Player")),
        region: "Global",
        savedAt: Date.now(),
      };
      saveVerifiedPlayer(vData);
      setReviewData({
        userName: vData.username,
        region: vData.region,
        playerId: vData.playerId,
        zoneId: vData.zoneId,
      });
      setLoading(false);
      return;
    }

    try {
      const baseGameId = isMLBB_local ? "mobile-legends270" : (game?.gameId || slug);
      const productId = `${baseGameId}_${activeItem?.itemId || initialItemSlug}`;

      const nameRes = await fetch("/api/check-region/namecheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, playerId, zoneId: zoneId || "NA" }),
      });
      const nameData = await nameRes.json();

      if (
        (nameData?.success === 200 || nameData?.success === true) &&
        (nameData?.data?.username || nameData?.data?.name) &&
        nameData?.data?.valid !== false
      ) {
        const username = nameData?.data?.username || nameData?.data?.name || "Unknown";
        const region = nameData?.data?.region || "Global";

        saveVerifiedPlayer({ playerId, zoneId, username, region, savedAt: Date.now() });
        setReviewData({ userName: username, region, playerId, zoneId });
      } else {
        setError(nameData?.message || "Player not found");
      }
    } catch (err) {
      setError("Validation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= PAYMENT ================= */
  const handlePayment = async () => {
    setTimeout(() => setShowSuccess(true), 500);
  };

  if (!game || !activeItem) {
    return (
      <section className="min-h-screen bg-[var(--background)] px-4 py-3 md:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton width={32} height={32} variant="circle" />
            <Skeleton width={100} height={20} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-6">
              <Skeleton height={140} className="rounded-3xl" />
              <div className="space-y-3">
                <Skeleton width={80} height={12} className="mb-2" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} height={80} className="rounded-2xl" />)}
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 space-y-6">
              <Skeleton height={350} className="rounded-[2.5rem]" />
              <Skeleton height={250} className="rounded-[2.5rem]" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const discountVal = activeItem.dummyPrice > activeItem.sellingPrice ? activeItem.dummyPrice - activeItem.sellingPrice : 0;
  const discountPerc = activeItem.dummyPrice ? Math.round((discountVal / activeItem.dummyPrice) * 100) : 0;

  return (
    <AuthGuard>
      <section className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-3 md:px-8">
        <div className="max-w-6xl mx-auto">

          {/* HEADER / BACK */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-3 group"
          >
            <div className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center group-hover:bg-[var(--foreground)]/[0.05]">
              <FiArrowLeft size={16} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </button>

          {/* SUCCESS MESSAGE */}
          {showSuccess && (
            <div className="bg-green-600/20 border border-green-600 text-green-500 p-8 rounded-[2.5rem] text-center shadow-lg mb-10">
              <h2 className="text-3xl font-black italic uppercase">Payment Successful ✔</h2>
              <p className="text-sm mt-2 opacity-80">Your order has been placed successfully.</p>
            </div>
          )}

          {!showSuccess && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* LEFT COLUMN: SELECTED ITEM & MORE PACKS */}
              <div className="lg:col-span-5 space-y-4">

                {/* HERO CARD */}
                <motion.div
                  layoutId={`item-${activeItem.itemSlug}`}
                  className="relative bg-[var(--card)] rounded-2xl p-4 border border-[var(--border)] shadow-xl overflow-hidden group"
                >
                  {/* Background Decor */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent)]/5 blur-[80px] -mr-24 -mt-24 pointer-events-none" />

                  <div className="flex items-center gap-5 relative z-10">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-xl border-2 border-white/5 shrink-0 transition-transform duration-500 group-hover:scale-105">
                      <Image
                        src={activeItem.itemImageId?.image || fallbackImage || logo}
                        alt={activeItem.itemName}
                        fill
                        className="object-cover"
                      />
                      {discountPerc > 0 && (
                        <div className="absolute top-1 left-1 bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-lg">
                          {discountPerc}%
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="bg-[var(--accent)]/[0.08] px-2 py-0.5 rounded-md border border-[var(--accent)]/20 w-fit flex items-center gap-1.5 mb-0.5">
                        <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_var(--emerald-400)]" />
                        <span className="text-[7px] font-black uppercase tracking-wider text-[var(--accent)]">Instant</span>
                      </div>

                      <h1 className="text-lg font-black tracking-tighter uppercase leading-none truncate text-[var(--foreground)]">
                        {activeItem.itemName}
                      </h1>

                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-[var(--accent)] drop-shadow-[0_0_10px_var(--accent-glow)]">₹{activeItem.sellingPrice}</span>
                        {activeItem.dummyPrice > activeItem.sellingPrice && (
                          <span className="text-xs text-[var(--foreground)]/30 line-through font-bold">₹{activeItem.dummyPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subtle Icon Overlay */}
                  <div className="absolute bottom-4 right-6 opacity-[0.03] text-[var(--foreground)]">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                  </div>
                </motion.div>

                {/* MORE PACKS SECTION */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 px-1">
                    <div className="w-5 h-5 rounded-md bg-[var(--foreground)]/[0.05] border border-[var(--border)] flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
                    </div>
                    <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">More Packs</h2>
                  </div>

                  <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-2 md:grid md:grid-cols-4 lg:grid-cols-3">
                    {allItems.map((item) => {
                      const isSelected = activeItem.itemSlug === item.itemSlug;
                      return (
                        <button
                          key={item.itemSlug}
                          onClick={() => {
                            setActiveItem(item);
                            router.replace(`/games/${slug}/buy/${item.itemSlug}`, { scroll: false });
                          }}
                          className={`
                          relative p-2 rounded-lg border transition-all duration-300 text-left overflow-hidden group min-h-[52px] flex flex-col justify-center shrink-0 w-[90px] md:w-full
                          ${isSelected
                              ? "bg-[var(--accent)]/[0.08] border-[var(--accent)] shadow-lg shadow-[var(--accent)]/5"
                              : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--accent)]/30 hover:bg-[var(--foreground)]/[0.02]"}
                        `}
                        >
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center z-10">
                              <FiCheck size={9} strokeWidth={4} />
                            </div>
                          )}
                          <p className={`text-[8px] font-bold uppercase tracking-tight mb-0.5 truncate ${isSelected ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}>
                            {item.itemName}
                          </p>
                          <p className="text-sm font-black tracking-tight">₹{item.sellingPrice}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: PLAYER INFO & PAYMENT */}
              <div className="lg:col-span-7 space-y-4">

                {/* SECTION 1: PLAYER INFO */}
                <div className="bg-[var(--card)] rounded-3xl p-6 border border-[var(--border)] shadow-xl space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl font-black italic text-[var(--accent)] drop-shadow-[0_0_8px_var(--accent-glow)]">| 1.</span>
                      <h2 className="text-xl font-black italic tracking-tight uppercase text-[var(--foreground)]">Player Info</h2>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-[var(--accent)] text-black flex items-center justify-center shadow-lg shadow-[var(--accent)]/30 hover:scale-110 transition-transform">
                      <FiHelpCircle size={16} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* PLAYER ID */}
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors">
                          <FiUser size={16} />
                        </div>
                        <input
                          value={playerId}
                          onChange={(e) => setPlayerId(e.target.value)}
                          placeholder="User ID"
                          className="p-4 pl-12 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]/40 w-full text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none placeholder:text-[var(--muted)]/40 font-bold text-sm"
                          disabled={loading || reviewData}
                        />
                      </div>

                      {/* ZONE ID */}
                      {needsZoneId && (
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors">
                            <FiHash size={16} />
                          </div>
                          <input
                            value={zoneId}
                            onChange={(e) => setZoneId(e.target.value)}
                            placeholder="Server ID"
                            className="p-4 pl-12 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]/40 w-full text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none placeholder:text-[var(--muted)]/40 font-bold text-sm"
                            disabled={loading || reviewData}
                          />
                        </div>
                      )}
                    </div>

                    {/* VALIDATION BUTTON / STATUS */}
                    {!reviewData ? (
                      <button
                        onClick={handleValidate}
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-[var(--accent)] text-black font-black uppercase tracking-[0.2em] italic transition-all flex items-center justify-center gap-3 shadow-lg shadow-[var(--accent)]/20 hover:brightness-110 active:scale-[0.98] text-xs"
                      >
                        {loading ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                            <FiSearch size={16} />
                          </motion.div>
                        ) : <FiSearch size={16} />}
                        <span>{loading ? "Checking..." : "Check Name"}</span>
                      </button>
                    ) : (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                            <FiCheck size={16} />
                          </div>
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-wider text-emerald-500/60">Verified Player</p>
                            <p className="font-black text-emerald-500 uppercase text-xs">{reviewData.userName}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setReviewData(null)}
                          className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)] hover:text-red-500 transition-colors"
                        >
                          Change
                        </button>
                      </div>
                    )}

                    {/* ERROR */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2.5"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* RECENT PLAYERS */}
                    {!reviewData && (
                      <div className="pt-3 border-t border-[var(--border)]/40">
                        <RecentVerifiedPlayers
                          limit={3}
                          onSelect={(player) => {
                            setPlayerId(player.playerId);
                            if (needsZoneId) setZoneId(player.zoneId);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION 2: PAYMENT */}
                <div className={`bg-[var(--card)] rounded-3xl p-6 border border-[var(--border)] shadow-xl space-y-5 transition-all duration-500 ${!reviewData ? "opacity-40 grayscale pointer-events-none" : ""}`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl font-black italic text-[var(--accent)] drop-shadow-[0_0_8px_var(--accent-glow)]">| 2.</span>
                    <h2 className="text-xl font-black italic tracking-tight uppercase text-[var(--foreground)]">Payment</h2>
                  </div>

                  <ReviewAndPaymentStep
                    step={reviewData ? 2 : 1}
                    itemName={activeItem.itemName}
                    itemImage={activeItem.itemImageId?.image || fallbackImage}
                    price={activeItem.sellingPrice}
                    discount={discountVal}
                    totalPrice={activeItem.sellingPrice}
                    userEmail={userEmail}
                    userPhone={userPhone}
                    reviewData={reviewData}
                    walletBalance={walletBalance}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    onPaymentComplete={handlePayment}
                    slug={slug}
                    itemSlug={activeItem.itemSlug}
                    isUnified={true}
                  />
                </div>

              </div>
            </div>
          )}

        </div>
      </section>
    </AuthGuard>
  );
}
