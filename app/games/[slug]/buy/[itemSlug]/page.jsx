"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiHash, FiSearch, FiArrowLeft, FiCheck, FiHelpCircle, FiChevronDown } from "react-icons/fi";
import AuthGuard from "../../../../../components/AuthGuard";
import Skeleton from "@/components/Skeleton";
const logo = "/logo.svg";
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
  const [showMorePacks, setShowMorePacks] = useState(false);
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
      const baseGameId = isMLBB_local ? "mobile-legends114" : (game?.gameId || slug);
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

          {/* SUCCESS MESSAGE */}
          {showSuccess && (
            <div className="bg-green-600/20 border border-green-600 text-green-500 p-8 rounded-[2.5rem] text-center shadow-lg mb-10">
              <h2 className="text-3xl font-black italic uppercase">Payment Successful ✔</h2>
              <p className="text-sm mt-2 opacity-80">Your order has been placed successfully.</p>
            </div>
          )}

          {!showSuccess && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">

              {/* LEFT COLUMN: SELECTED ITEM & MORE PACKS (Unified Left Panel) */}
              <div className="lg:col-span-5 bg-[var(--card)] rounded-2xl border border-[var(--border)] p-3 sm:p-3.5 space-y-3 shadow-xs h-fit">
                {/* Header inside Card: Back Button & Tag */}
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/40">
                  <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors group cursor-pointer"
                  >
                    <FiArrowLeft size={13} className="text-[var(--accent)] group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back</span>
                  </button>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">Selected Pack</span>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3 relative">
                  {/* Compact Icon Pod */}
                  <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-black/20 border border-[var(--border)] shrink-0 flex items-center justify-center p-0.5">
                    <Image
                      src={activeItem.itemImageId?.image || fallbackImage || logo}
                      alt={activeItem.itemName}
                      fill
                      className="object-contain p-0.5"
                    />
                    {discountPerc > 0 && (
                      <div className="absolute top-0 left-0 bg-red-600 text-white text-[7.5px] font-black px-1.5 py-0.5 rounded-br-md leading-none shadow-xs z-10">
                        {discountPerc}%
                      </div>
                    )}
                  </div>

                  {/* Content: Title & Price */}
                  <div className="flex flex-col justify-center min-w-0 pr-2">
                    <h1 className="text-xs sm:text-[13px] font-extrabold tracking-tight leading-snug text-[var(--foreground)]">
                      {activeItem.itemName}
                    </h1>

                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-sm sm:text-base font-black text-[var(--accent)] tracking-tight">₹{activeItem.sellingPrice}</span>
                      {activeItem.dummyPrice > activeItem.sellingPrice && (
                        <span className="text-[10px] text-[var(--muted)] line-through font-semibold">₹{activeItem.dummyPrice}</span>
                      )}
                    </div>
                  </div>

                  {/* Modern Faceted Gaming Diamond SVG Watermark */}
                  <div className="absolute -bottom-1 -right-1 pointer-events-none opacity-[0.10] text-[var(--accent)]">
                    <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="6 3 18 3 22 9 12 22 2 9" />
                      <line x1="2" y1="9" x2="22" y2="9" />
                      <line x1="12" y1="22" x2="7" y2="9" />
                      <line x1="12" y1="22" x2="17" y2="9" />
                    </svg>
                  </div>
                </div>

                {/* Integrated More Packs Toggle */}
                <div className="pt-2 border-t border-[var(--border)]/40">
                  <button
                    type="button"
                    onClick={() => setShowMorePacks(!showMorePacks)}
                    className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                        More Packs
                      </span>
                      <span className="text-[9.5px] text-[var(--muted)] font-bold">({allItems.length})</span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--accent)]">
                      <span>{showMorePacks ? "Hide" : "Show"}</span>
                      <motion.div animate={{ rotate: showMorePacks ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <FiChevronDown size={13} />
                      </motion.div>
                    </div>
                  </button>

                  {/* Collapsible Content */}
                  <AnimatePresence>
                    {showMorePacks && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pt-2"
                      >
                        <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1 md:grid md:grid-cols-3">
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
                                relative p-2 rounded-lg border transition-all duration-200 text-left overflow-hidden group min-h-[44px] flex flex-col justify-center shrink-0 min-w-[95px] md:w-full cursor-pointer
                                ${isSelected
                                    ? "bg-[var(--accent)]/[0.1] border-[var(--accent)] ring-1 ring-[var(--accent)]"
                                    : "bg-[var(--foreground)]/[0.02] border-[var(--border)]/70 hover:border-[var(--accent)]/40"}
                              `}
                              >
                                {isSelected && (
                                  <div className="absolute top-1 right-1 w-3 h-3 bg-[var(--accent)] text-white rounded-full flex items-center justify-center z-10 shadow-xs">
                                    <FiCheck size={8} strokeWidth={4} />
                                  </div>
                                )}
                                <p className={`text-[9.5px] font-bold tracking-tight truncate leading-tight pr-3 ${isSelected ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}>
                                  {item.itemName}
                                </p>
                                <p className="text-[11px] font-black tracking-tight mt-0.5 text-[var(--foreground)]">₹{item.sellingPrice}</p>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* RIGHT COLUMN: PLAYER INFO & PAYMENT (Unified Single Checkout Panel) */}
              <div className="lg:col-span-7 bg-[var(--card)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)]/50 shadow-xs overflow-hidden h-fit">

                {/* SECTION 1: PLAYER INFO */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-[var(--accent)] text-white font-extrabold text-[11px] flex items-center justify-center">
                      1
                    </div>
                    <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-[var(--foreground)]">Player Information</h2>
                  </div>

                  {!reviewData ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {/* PLAYER ID */}
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors pointer-events-none">
                            {/* Gaming Controller / Player ID SVG */}
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="6" width="20" height="12" rx="4" />
                              <path d="M6 12h4m-2-2v4" />
                              <circle cx="15.5" cy="10" r="1" fill="currentColor" />
                              <circle cx="17.5" cy="13" r="1" fill="currentColor" />
                            </svg>
                          </div>
                          <input
                            value={playerId}
                            onChange={(e) => setPlayerId(e.target.value)}
                            placeholder="User ID"
                            className="py-2.5 pl-9 pr-3 rounded-xl bg-[var(--background)]/60 border border-[var(--border)] w-full text-[var(--foreground)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all outline-none placeholder:text-[var(--muted)]/50 font-bold text-xs"
                            disabled={loading}
                          />
                        </div>

                        {/* ZONE ID */}
                        {needsZoneId && (
                          <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors pointer-events-none">
                              {/* Server / Region Globe Grid SVG */}
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="9" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <path d="M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9z" />
                              </svg>
                            </div>
                            <input
                              value={zoneId}
                              onChange={(e) => setZoneId(e.target.value)}
                              placeholder="Server ID"
                              className="py-2.5 pl-9 pr-3 rounded-xl bg-[var(--background)]/60 border border-[var(--border)] w-full text-[var(--foreground)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all outline-none placeholder:text-[var(--muted)]/50 font-bold text-xs"
                              disabled={loading}
                            />
                          </div>
                        )}
                      </div>

                      {/* VALIDATION BUTTON */}
                      <button
                        onClick={handleValidate}
                        disabled={loading}
                        className="w-full py-2.5 sm:py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black font-black text-xs tracking-wide transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm cursor-pointer"
                      >
                        {loading ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <path d="M21 12a9 9 0 1 1-6.2-8.5" />
                            </svg>
                          </motion.div>
                        ) : (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <circle cx="11" cy="11" r="3" strokeDasharray="2 2" />
                          </svg>
                        )}
                        <span>{loading ? "Checking Player..." : "Check Name"}</span>
                      </button>

                      {/* ERROR */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 flex items-center gap-2"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">{error}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* RECENT PLAYERS */}
                      <div className="pt-2 border-t border-[var(--border)]/40">
                        <RecentVerifiedPlayers
                          limit={3}
                          onSelect={(player) => {
                            setPlayerId(player.playerId);
                            if (needsZoneId) setZoneId(player.zoneId);
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    /* COMPACT VERIFIED PLAYER IDENTITY STRIP (No redundant nested input boxes) */
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Verified Starburst Badge SVG */}
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2l2.4 2.8 3.7-.4 1.1 3.5 3.3 1.7-1 3.5 1.9 3.1-2.9 2.3-.2 3.7-3.6 1-1.9 3.2-3.4-1.5-3.4 1.5-1.9-3.2-3.6-1-.2-3.7-2.9-2.3 1.9-3.1-1-3.5 3.3-1.7 1.1-3.5 3.7.4L12 2z" fill="#10B981" />
                            <path d="M8.5 12.5l2.5 2.5 4.5-5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs sm:text-sm text-[var(--foreground)] truncate">{reviewData.userName}</span>
                            <span className="text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">Verified</span>
                          </div>
                          <p className="text-[10.5px] text-[var(--muted)] font-mono mt-0.5">
                            User ID: <span className="text-[var(--foreground)] font-bold">{playerId}</span> {needsZoneId && zoneId ? `• Server: ${zoneId}` : ""}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReviewData(null)}
                        className="text-xs font-bold text-[var(--accent)] hover:underline shrink-0 pl-3 cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>

                {/* SECTION 2: PAYMENT */}
                <div className={`p-4 sm:p-5 space-y-3.5 transition-all duration-300 ${!reviewData ? "opacity-40 grayscale pointer-events-none bg-[var(--background)]/20" : ""}`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-md font-extrabold text-[11px] flex items-center justify-center ${reviewData ? "bg-[var(--accent)] text-white" : "bg-[var(--border)] text-[var(--muted)]"}`}>
                      2
                    </div>
                    <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-[var(--foreground)]">Payment Method</h2>
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
