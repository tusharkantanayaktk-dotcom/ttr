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
        setAllGames(data?.data?.games || []);
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

        setGame({
          ...data.data,
          allItems: items,
        });

        setActiveItem(items[0] || null);
      });
  }, [slug]);

  if (!game || !activeItem) {
    return (
      <section className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-6">
        {/* Modern Game Switcher Skeleton */}
        <div className="max-w-6xl mx-auto mb-6 px-2 overflow-hidden">
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-1 h-3 bg-[var(--muted)] opacity-20 rounded-full" />
            <Skeleton width={100} height={12} className="rounded-sm" />
          </div>
          <div className="flex gap-2 py-2 overflow-x-auto no-scrollbar">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} width={68} height={85} className="shrink-0 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Header Skeleton */}
        <div className="max-w-6xl mx-auto mb-8 flex items-center gap-4">
          <Skeleton width={56} height={56} className="rounded-lg shrink-0" />
          <div className="space-y-2">
            <Skeleton width={180} height={28} className="rounded-md" />
            <Skeleton width={100} height={14} className="rounded-md" />
          </div>
        </div>

        {/* Item Grid Skeleton */}
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} height={100} className="rounded-2xl" />
          ))}
        </div>

        {/* Footer/Panel Placeholder */}
        <div className="max-w-6xl mx-auto mt-10">
          <Skeleton height={140} className="w-full rounded-[2rem]" />
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
    <section className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-6">

      {/* ================= MODERN GAME SWITCHER ================= */}
      <div className="max-w-6xl mx-auto mb-6 overflow-hidden px-2">
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="w-1 h-3 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] italic">
            Quick Game Switch
          </h2>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar scroll-smooth">
          {allGames.map((g, index) => {
            const isActive = g.gameSlug === slug;
            return (
              <button
                key={g.gameSlug}
                onClick={() => router.push(`/games/${g.gameSlug}`)}
                className={`
                  relative flex-shrink-0 flex flex-col items-center gap-1.5 px-1 py-2 rounded-xl transition-all duration-500 min-w-[68px]
                  ${isActive
                    ? "bg-[var(--foreground)]/[0.05] opacity-100"
                    : "hover:bg-[var(--foreground)]/[0.03] opacity-40 hover:opacity-80"}
                `}
              >
                {/* THUMBNAIL */}
                <div className={`
                  relative w-11 h-11 rounded-xl overflow-hidden transition-all duration-500 transform
                  ${isActive ? "ring-1 ring-red-500/50 scale-105" : "grayscale opacity-80"}
                `}>
                  <Image
                    src={g.gameImageId?.image || logo}
                    alt={g.gameName}
                    fill
                    sizes="44px"
                    className="object-cover"
                    priority={index < 8}
                  />
                </div>

                {/* LABEL */}
                <div className="flex flex-col items-center text-center w-full px-1">
                  <div className="h-5 flex items-center justify-center mb-1">
                    <span className={`
                      text-[7px] font-black italic uppercase tracking-wider transition-colors duration-300 leading-[1]
                      ${isActive ? "text-red-500" : "text-[var(--muted)]"}
                      line-clamp-2 max-w-[64px] whitespace-normal
                    `}>
                      {g.gameName === "PUBG Mobile" ? "BGMI" : g.gameName}
                    </span>
                  </div>
                  <div className="h-[2px] w-full relative">
                    {isActive && (
                      <motion.div
                        layoutId="activeTabRedLine"
                        className="absolute inset-0 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)]"
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
      <div className="max-w-6xl mx-auto mb-6 flex items-center gap-4">
        <div className="w-14 h-14 relative rounded-lg overflow-hidden">
          <Image
            src={game?.gameImageId?.image || logo}
            alt={game?.gameName || "Game"}
            fill
            className="object-cover"
          />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold">
            {isBGMI ? "BGMI" : game?.gameName}
          </h1>
          <p className="text-xs text-[var(--muted)]">
            {game?.gameFrom}
          </p>
        </div>
      </div>

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
      />

    </section>
  );
}
