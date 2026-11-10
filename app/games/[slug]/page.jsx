"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import dynamic from "next/dynamic";
const logo = "/logo.svg";
import Skeleton from "@/components/Skeleton";

const MLBBPurchaseGuide = dynamic(() => import("../../../components/HelpImage/MLBBPurchaseGuide"), { ssr: false });
const ItemGrid = dynamic(() => import("@/components/GameDetail/ItemGrid"), { ssr: false });
const BuyPanel = dynamic(() => import("@/components/GameDetail/BuyPanel"), { ssr: false });

const GameThumbnail = ({ src, name, index, isLarge = false }) => {
  const [err, setErr] = useState(false);
  const letter = name?.charAt(0).toUpperCase() || "?";

  if (!src || err) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--card)] to-[var(--background)] border border-[var(--border)] rounded-xl`}>
        <span className={`${isLarge ? "text-2xl" : "text-lg"} font-black text-[var(--accent)] opacity-40 uppercase`}>
          {letter}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src || logo}
      alt={name || "Game"}
      fill
      sizes={isLarge ? "56px" : "44px"}
      priority={index !== undefined && index < 8}
      onError={() => setErr(true)}
      className="object-cover"
    />
  );
};

export default function GameDetailPage() {
  const { slug } = useParams();
  const router = useRouter();

  const buyPanelRef = useRef(null);

  const [game, setGame] = useState(null);
  const [allGames, setAllGames] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  /* ================= FETCH ALL GAMES ================= */
  useEffect(() => {
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => {
        const fetchedGames = (data?.data?.games || []).map((g) => {
          let name = g.gameName;
          if (name.toUpperCase().includes("MLBB")) {
            name = name.replace(/MLBB/gi, "Mobile Legends");
          }
          return { ...g, gameName: name };
        });
        setAllGames(fetchedGames);
      });
  }, []);

  /* ================= FETCH GAME ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`/api/games/${slug}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const rawItems = data?.data?.itemId || [];
        const items = rawItems
          .filter((item) => item.itemAvailablity !== false && item.inStock !== false)
          .sort((a, b) => a.sellingPrice - b.sellingPrice);

        let gameName = data?.data?.gameName || "";
        if (gameName.toUpperCase().includes("MLBB")) {
          gameName = gameName.replace(/MLBB/gi, "Mobile Legends");
        }

        setGame({
          ...data.data,
          gameName,
          allItems: items,
        });

        setActiveItem(items[0] || null);
      });
  }, [slug]);

  if (!game) {
    return (
      <section className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-6">
        {/* ================= MODERN GAME SWITCHER SKELETON ================= */}
        <div className="max-w-6xl mx-auto mb-2 overflow-hidden">
          <div className="flex items-center gap-1.5 mb-1 px-0.5">
            <div className="w-1 h-2 bg-red-600/60 rounded-full" />
            <Skeleton width={80} height={7} className="rounded-full" />
          </div>

          <div className="flex items-center gap-0.5 overflow-x-auto py-0.5 no-scrollbar">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 flex flex-col items-center gap-0.5 px-0.5 py-0.5 rounded-md min-w-[44px]"
              >
                <div className="w-7 h-7 rounded-md overflow-hidden bg-[var(--card)]/50 border border-[var(--border)]">
                  <Skeleton className="w-full h-full border-none" />
                </div>
                <div className="flex flex-col items-center text-center w-full px-0.5 mt-0.5">
                  <Skeleton width={26} height={5} className="rounded-full" />
                  <div className="h-[1.5px] w-full mt-0.5">
                    {i === 1 && <div className="h-full w-full bg-red-600/40 rounded-full" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= HEADER SKELETON ================= */}
        <div className="max-w-6xl mx-auto mb-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[var(--border)] bg-[var(--card)]/50">
            <Skeleton className="w-full h-full border-none" />
          </div>

          <div className="space-y-1">
            <Skeleton width={160} height={24} className="rounded-md" />
          </div>
        </div>

        {/* Skeleton Divider */}
        <div className="max-w-6xl mx-auto mb-4 relative flex items-center h-2">
          <div className="w-2 h-2 rounded-full bg-[var(--border)] shrink-0" />
          <div className="h-[2px] w-28 sm:w-44 bg-[var(--border)] shrink-0" />
          <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--border)] to-transparent" />
        </div>

        {/* ================= ITEM GRID SKELETON ================= */}
        <div className="max-w-6xl mx-auto mb-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]/40 flex items-center gap-2 sm:gap-2.5 min-h-[68px] sm:min-h-[72px] p-2 sm:p-2.5"
            >
              {/* Diamond / Item Icon */}
              <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg overflow-hidden shrink-0 bg-[var(--foreground)]/[0.04]">
                <Skeleton className="w-full h-full border-none" />
              </div>

              {/* Details Column */}
              <div className="flex flex-col flex-1 min-w-0 justify-center space-y-1">
                <Skeleton width="80%" height={10} className="rounded" />
                <div className="flex items-baseline gap-1 pt-0.5">
                  <Skeleton width={40} height={12} className="rounded" />
                  <Skeleton width={28} height={9} className="rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= BUY PANEL SKELETON ================= */}
        <div className="max-w-6xl mx-auto bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-4 shadow-sm">
          <div className="flex gap-4 items-center">
            {/* Big Preview Image */}
            <div className="w-[100px] sm:w-[110px] h-[100px] sm:h-[110px] rounded-xl overflow-hidden shrink-0 bg-[var(--foreground)]/[0.04] border border-[var(--border)]">
              <Skeleton className="w-full h-full border-none" />
            </div>

            {/* Price & Details */}
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton width={180} height={20} className="rounded-md" />
              <div className="flex items-center gap-2 pt-1">
                <Skeleton width={90} height={26} className="rounded-lg" />
                <Skeleton width={50} height={14} className="rounded" />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Skeleton height={48} className="w-full rounded-xl" />
        </div>
      </section>
    );
  }


  const isBGMI =
    game?.gameName?.toLowerCase() === "pubg mobile" || game?.gameName?.toLowerCase() === "bgmi";

  /* ================= BUY HANDLER ================= */
  const goBuy = (item) => {
    if (redirecting) return;
    setRedirecting(true);

    const query = new URLSearchParams({
      name: item.itemName,
      price: item.sellingPrice?.toString() || "",
      dummy: item.dummyPrice?.toString() || "",
      image: item.itemImageId?.image || "",
    });

    // Always use generic path
    const basePath = `/games/${slug}/buy`;

    router.push(
      `${basePath}/${item.itemSlug}?${query.toString()}`
    );
  };

  return (
    <section className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-6 pb-28 sm:pb-32">

      {/* ================= MODERN GAME SWITCHER ================= */}
      <div className="max-w-6xl mx-auto mb-2 overflow-hidden">
        <div className="flex items-center gap-1.5 mb-1 px-0.5">
          <div className="w-1 h-2 bg-red-600 rounded-full" />
          <h2 className="text-[7.5px] font-black uppercase tracking-[0.15em] text-[var(--muted)] italic">
            Quick Game Switch
          </h2>
        </div>

        <div className="flex items-center gap-0.5 overflow-x-auto py-0.5 no-scrollbar scroll-smooth">
          {allGames.map((g, index) => {
            const isActive = g.gameSlug === slug;
            return (
              <button
                key={g.gameSlug}
                onClick={() => router.push(`/games/${g.gameSlug}`)}
                className={`
                  relative flex-shrink-0 flex flex-col items-center gap-0.5 px-0.5 py-0.5 rounded-md transition-all duration-200 min-w-[44px]
                  ${isActive
                    ? "opacity-100"
                    : "opacity-40 hover:opacity-80"}
                `}
              >
                {/* THUMBNAIL */}
                <div className={`
                  relative w-7 h-7 rounded-md overflow-hidden transition-all duration-200
                  ${isActive ? "ring-1 ring-red-500/50" : "grayscale opacity-80"}
                `}>
                  <GameThumbnail src={g.gameImageId?.image} name={g.gameName} index={index} />
                </div>

                {/* LABEL */}
                <div className="flex flex-col items-center text-center w-full px-0.5">
                  <div className="h-3 flex items-center justify-center mb-0.5">
                    <span className={`
                      text-[6px] font-extrabold italic uppercase tracking-tight transition-colors duration-200 leading-[1]
                      ${isActive ? "text-red-500" : "text-[var(--muted)]"}
                      line-clamp-2 max-w-[42px] whitespace-normal
                    `}>
                      {g.gameName === "PUBG Mobile" ? "BGMI" : g.gameName}
                    </span>
                  </div>
                  <div className="h-[1.5px] w-full relative">
                    {isActive && (
                      <motion.div
                        layoutId="activeTabRedLine"
                        className="absolute inset-0 bg-red-600 rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= HEADER ================= */}
      <div className="max-w-6xl mx-auto mb-3 flex items-center gap-3">
        <div className="w-10 h-10 sm:w-11 sm:h-11 relative rounded-xl overflow-hidden shadow-sm shrink-0 ring-1 ring-[var(--border)]">
          <GameThumbnail src={game?.gameImageId?.image} name={game?.gameName} isLarge />
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">
              {isBGMI ? "BGMI" : game?.gameName}
            </h1>
            {/* Verified Badge SVG */}
            <span title="Official & Verified Top-Up" className="inline-flex text-[var(--accent)] shrink-0">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            </span>
          </div>

          {/* Quick Features Row */}
          <div className="flex items-center gap-2 mt-0.5 text-[10px] sm:text-[11px] font-medium text-[var(--muted)]">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M13 2L3 14h7v8l10-12h-7l3-8z" />
              </svg>
              <span>Instant Delivery</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <svg className="w-3 h-3 fill-none stroke-current shrink-0" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Direct UID Top-Up</span>
            </span>
          </div>
        </div>
      </div>

      {/* ================= HIGH-TECH SVG DIVIDER BELOW HEADER ================= */}
      <div className="max-w-6xl mx-auto mb-3 relative">
        <div className="relative flex items-center h-2">
          {/* Glowing Start Diamond Node */}
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)] shrink-0" />
          {/* Gradient Accent Line */}
          <div className="h-[2px] w-28 sm:w-44 bg-gradient-to-r from-[var(--accent)] via-[var(--accent)]/70 to-transparent shrink-0" />
          {/* Extended Tapering Line */}
          <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--accent)]/30 via-[var(--border)] to-transparent" />
        </div>
        {/* Ambient Underglow */}
        <div className="absolute top-0 left-0 w-36 h-2 bg-[var(--accent)]/25 blur-sm pointer-events-none" />
      </div>

      {/* ================= OUT OF STOCK / EMPTY STATE ================= */}
      {game.allItems.length === 0 || game.gameAvailablity === false ? (
        <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-500 flex items-center justify-center">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[var(--foreground)]">Currently Out of Stock</h3>
          <p className="text-xs text-[var(--muted)] max-w-sm">
            All top-up packs for {game.gameName} are currently unavailable. Please check back later.
          </p>
          <button
            onClick={() => router.push("/games")}
            className="mt-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            Browse Other Games
          </button>
        </div>
      ) : (
        <>
          {/* ================= ITEM GRID ================= */}
          <ItemGrid
            items={game.allItems}
            gameLogo={game?.gameImageId?.image || logo}
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            buyPanelRef={buyPanelRef}
          />

          {/* ================= BUY PANEL ================= */}
          {activeItem && (
            <BuyPanel
              activeItem={activeItem}
              onBuy={goBuy}
              redirecting={redirecting}
              buyPanelRef={buyPanelRef}
              gameLogo={game?.gameImageId?.image || logo}
            />
          )}
        </>
      )}

    </section>
  );
}
