"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import dynamic from "next/dynamic";
import logo from "@/public/logo.png";
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
        const items = [...(data?.data?.itemId || [])].sort(
          (a, b) => a.sellingPrice - b.sellingPrice
        );

        let gameName = data.data.gameName;
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

  if (!game || !activeItem) {
    return (
      <section className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-6">
        {/* ================= MODERN GAME SWITCHER SKELETON ================= */}
        <div className="max-w-6xl mx-auto mb-3 overflow-hidden">
          <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
            <div className="w-1 h-2.5 bg-red-600/60 rounded-full" />
            <Skeleton width={100} height={9} className="rounded-full" />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 flex flex-col items-center gap-1 px-1 py-1 rounded-lg min-w-[50px]"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-[var(--card)]/50 border border-[var(--border)]">
                  <Skeleton className="w-full h-full border-none" />
                </div>
                <div className="flex flex-col items-center text-center w-full px-0.5 mt-0.5">
                  <Skeleton width={32} height={6} className="rounded-full" />
                  <div className="h-[2px] w-full mt-0.5">
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

        <div className="max-w-6xl mx-auto h-[1px] bg-[var(--border)] mb-4 opacity-50" />

        {/* ================= ITEM GRID SKELETON ================= */}
        <div className="max-w-6xl mx-auto mb-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/40 flex items-center gap-3.5 min-h-[76px] p-3"
            >
              {/* Diamond / Item Icon */}
              <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-[var(--foreground)]/[0.04]">
                <Skeleton className="w-full h-full border-none" />
              </div>

              {/* Details Column */}
              <div className="flex flex-col flex-1 min-w-0 justify-center space-y-1.5">
                <Skeleton width="80%" height={12} className="rounded" />
                <Skeleton width="45%" height={9} className="rounded" />
                <div className="flex items-baseline gap-1 pt-0.5">
                  <Skeleton width={48} height={14} className="rounded" />
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
      <div className="max-w-6xl mx-auto mb-3 overflow-hidden">
        <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
          <div className="w-1 h-2.5 bg-red-600 rounded-full" />
          <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted)] italic">
            Quick Game Switch
          </h2>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar scroll-smooth">
          {allGames.map((g, index) => {
            const isActive = g.gameSlug === slug;
            return (
              <button
                key={g.gameSlug}
                onClick={() => router.push(`/games/${g.gameSlug}`)}
                className={`
                  relative flex-shrink-0 flex flex-col items-center gap-1 px-1 py-1 rounded-lg transition-all duration-200 min-w-[50px]
                  ${isActive
                    ? "opacity-100"
                    : "opacity-40 hover:opacity-80"}
                `}
              >
                {/* THUMBNAIL */}
                <div className={`
                  relative w-8 h-8 rounded-lg overflow-hidden transition-all duration-200
                  ${isActive ? "" : "grayscale opacity-80"}
                `}>
                  <GameThumbnail src={g.gameImageId?.image} name={g.gameName} index={index} />
                </div>

                {/* LABEL */}
                <div className="flex flex-col items-center text-center w-full px-0.5">
                  <div className="h-3.5 flex items-center justify-center mb-0.5">
                    <span className={`
                      text-[6.5px] font-black italic uppercase tracking-wider transition-colors duration-200 leading-[1]
                      ${isActive ? "text-red-500" : "text-[var(--muted)]"}
                      line-clamp-2 max-w-[48px] whitespace-normal
                    `}>
                      {g.gameName === "PUBG Mobile" ? "BGMI" : g.gameName}
                    </span>
                  </div>
                  <div className="h-[2px] w-full relative">
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
        <div className="w-10 h-10 relative rounded-lg overflow-hidden shadow-md">
          <GameThumbnail src={game?.gameImageId?.image} name={game?.gameName} isLarge />
        </div>

        <div>
          <h1 className="text-xl font-extrabold tracking-tight">
            {isBGMI ? "BGMI" : game?.gameName}
          </h1>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto h-[1px] bg-[var(--border)] mb-4 opacity-50" />

      {/* ================= ITEM GRID ================= */}
      <ItemGrid
        items={game.allItems}
        gameLogo={game?.gameImageId?.image || logo}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        buyPanelRef={buyPanelRef}
      />

      {/* ================= BUY PANEL ================= */}
      <BuyPanel
        activeItem={activeItem}
        onBuy={goBuy}
        redirecting={redirecting}
        buyPanelRef={buyPanelRef}
        gameLogo={game?.gameImageId?.image || logo}
      />

    </section>
  );
}
