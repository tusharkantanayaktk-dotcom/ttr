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

              {/* LEFT COLUMN: SELECTED ITEM & MORE PACKS */}
              <div className="lg:col-span-5 space-y-4">

                {/* HERO CARD (Compact with Integrated Back Button) */}
                <motion.div
                  layoutId={`item-${activeItem.itemSlug}`}
                  className="relative bg-[var(--card)] rounded-2xl p-2.5 sm:p-3 border border-[var(--border)] overflow-hidden group shadow-xs"
                >
                  {/* Subtle Background Glow */}
                  <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--accent)]/10 blur-[60px] -mr-16 -mt-16 pointer-events-none" />

                  {/* Header inside Card: Back Button & Tag */}
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[var(--border)]/30 relative z-10">
                    <button
                      onClick={() => router.back()}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors group"
                    >
                      <FiArrowLeft size={13} className="text-[var(--accent)] group-hover:-translate-x-0.5 transition-transform" />
                      <span>Back</span>
                    </button>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">Selected Pack</span>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3 relative z-10">
                    {/* Compact Icon Pod */}
                    <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-black/20 border border-[var(--border)] shrink-0 transition-transform duration-300 group-hover:scale-105 flex items-center justify-center p-0.5">
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

                    {/* Content: Title & Price (no instant delivery) */}
                    <div className="flex flex-col justify-center min-w-0 pr-10">
                      <h1 className="text-xs sm:text-[13px] font-extrabold tracking-tight truncate leading-tight text-[var(--foreground)]">
                        {activeItem.itemName}
                      </h1>

                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-sm sm:text-base font-black text-[var(--accent)] tracking-tight">₹{activeItem.sellingPrice}</span>
                        {activeItem.dummyPrice > activeItem.sellingPrice && (
                          <span className="text-[10px] text-[var(--muted)] line-through font-semibold">₹{activeItem.dummyPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Modern Faceted Gaming Diamond SVG Watermark */}
                  <div className="absolute bottom-2.5 right-2.5 pointer-events-none opacity-[0.09] group-hover:opacity-[0.16] transition-opacity text-[var(--accent)]">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="6 3 18 3 22 9 12 22 2 9" />
                      <line x1="2" y1="9" x2="22" y2="9" />
                      <line x1="12" y1="22" x2="7" y2="9" />
                      <line x1="12" y1="22" x2="17" y2="9" />
                      <line x1="7" y1="9" x2="10" y2="3" />
                      <line x1="17" y1="9" x2="14" y2="3" />
                    </svg>
                  </div>
                </motion.div>

                {/* MORE PACKS SECTION (Collapsible, Default Hidden, Compact) */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowMorePacks(!showMorePacks)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--card)]/60 hover:bg-[var(--card)] border border-[var(--border)] transition-all duration-200 group text-left cursor-pointer shadow-2xs hover:border-[var(--accent)]/40"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 16 16">
                          <path d="M8 1L1 4.5V11.5L8 15L15 11.5V4.5L8 1Z" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[var(--foreground)]">
                        More Packs
                      </span>
                      <span className="text-[9px] text-[var(--muted)] font-bold">({allItems.length})</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--accent)]">
                      <span>{showMorePacks ? "Hide" : "Show"}</span>
                      <motion.div animate={{ rotate: showMorePacks ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <FiChevronDown size={14} />
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
                        className="overflow-hidden"
                      >
                        <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1.5 pt-1 md:grid md:grid-cols-4 lg:grid-cols-3">
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
                                relative p-2 rounded-xl border transition-all duration-200 text-left overflow-hidden group min-h-[46px] sm:min-h-[50px] flex flex-col justify-center shrink-0 min-w-[95px] sm:min-w-[105px] md:w-full cursor-pointer
                                ${isSelected
                                    ? "bg-[var(--accent)]/[0.1] border-[var(--accent)] ring-1 ring-[var(--accent)] shadow-xs"
                                    : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--card)]/90"}
                              `}
                              >
                                {isSelected && (
                                  <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-[var(--accent)] text-white rounded-full flex items-center justify-center z-10 shadow-xs">
                                    <FiCheck size={8} strokeWidth={4} />
                                  </div>
                                )}
                                <p className={`text-[9.5px] sm:text-[10px] font-bold tracking-tight truncate leading-tight pr-3 ${isSelected ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}>
                                  {item.itemName}
                                </p>
                                <p className="text-[11px] sm:text-xs font-black tracking-tight mt-0.5 text-[var(--foreground)]">₹{item.sellingPrice}</p>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* RIGHT COLUMN: PLAYER INFO & PAYMENT */}
              <div className="lg:col-span-7 space-y-4">

                {/* SECTION 1: PLAYER INFO */}
                <div className="bg-[var(--card)]/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[var(--border)] space-y-4 shadow-sm backdrop-blur-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-[var(--accent)] text-white font-black text-xs flex items-center justify-center shadow-xs">
                      1
                    </div>
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-[var(--foreground)]">Player Information</h2>
                  </div>

                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* PLAYER ID */}
                      <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors">
                          <FiUser size={15} />
                        </div>
                        <input
                          value={playerId}
                          onChange={(e) => setPlayerId(e.target.value)}
                          placeholder="User ID"
                          className="p-3 pl-10 rounded-xl bg-[var(--background)]/60 border border-[var(--border)] w-full text-[var(--foreground)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all outline-none placeholder:text-[var(--muted)]/50 font-bold text-xs sm:text-sm"
                          disabled={loading || reviewData}
                        />
                      </div>

                      {/* ZONE ID */}
                      {needsZoneId && (
                        <div className="relative group">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors">
                            <FiHash size={15} />
                          </div>
                          <input
                            value={zoneId}
                            onChange={(e) => setZoneId(e.target.value)}
                            placeholder="Server ID"
                            className="p-3 pl-10 rounded-xl bg-[var(--background)]/60 border border-[var(--border)] w-full text-[var(--foreground)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all outline-none placeholder:text-[var(--muted)]/50 font-bold text-xs sm:text-sm"
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
                        className="w-full py-3 sm:py-3.5 rounded-xl bg-[var(--accent)] text-white font-extrabold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] shadow-md shadow-[var(--accent)]/20"
                      >
                        {loading ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                            <FiSearch size={15} />
                          </motion.div>
                        ) : <FiSearch size={15} />}
                        <span>{loading ? "Checking Player..." : "Check Name"}</span>
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
                <div className={`bg-[var(--card)]/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[var(--border)] space-y-4 transition-all duration-300 shadow-sm backdrop-blur-xs ${!reviewData ? "opacity-40 grayscale pointer-events-none" : ""}`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-[var(--accent)] text-white font-black text-xs flex items-center justify-center shadow-xs">
                      2
                    </div>
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-[var(--foreground)]">Payment Method</h2>
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
