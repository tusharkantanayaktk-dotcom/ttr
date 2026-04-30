"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import dynamic from "next/dynamic";
import logo from "@/public/logo.png";

const Loader = dynamic(() => import("@/components/Loader/Loader"), { ssr: false });
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

  /* ================= LOADING ================= */
  if (!game || !activeItem) {
    return <Loader />;
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
        <div className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar scroll-smooth">
          {allGames.map((g) => {
            const isActive = g.gameSlug === slug;
            return (
              <button
                key={g.gameSlug}
                onClick={() => router.push(`/games/${g.gameSlug}`)}
                className={`
                  relative flex-shrink-0 flex flex-col items-center gap-1.5 px-1 py-2 rounded-xl transition-all duration-500 min-w-[68px]
                  ${isActive
                    ? "bg-white/[0.03] opacity-100"
                    : "hover:bg-white/[0.02] opacity-40 hover:opacity-80"}
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
                    className="object-cover"
                  />
                </div>

                {/* LABEL */}
                <div className="flex flex-col items-center text-center w-full px-1">
                  <span className={`
                    text-[8px] font-black italic uppercase tracking-wider transition-colors duration-300 leading-tight
                    ${isActive ? "text-red-500" : "text-[var(--muted)]"}
                  `}>
                    {g.gameName === "PUBG Mobile" ? "BGMI" : g.gameName}
                  </span>
                  <div className="h-[2px] w-full mt-1.5 relative">
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
