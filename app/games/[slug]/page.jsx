"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import logo from "@/public/logo.png";
import Loader from "@/components/Loader/Loader";
import MLBBPurchaseGuide from "../../../components/HelpImage/MLBBPurchaseGuide";

import ItemGrid from "@/components/GameDetail/ItemGrid";
import BuyPanel from "@/components/GameDetail/BuyPanel";
import ItemGridBgmi from "@/components/GameDetail/ItemGridBgmi";
import BuyPanelBgmi from "@/components/GameDetail/BuyPanelBgmi";

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

  /* ================= FETCH CURRENT GAME ================= */
  const isBGMI =
    game?.gameName?.toLowerCase() === "pubg mobile" || game?.gameName?.toLowerCase() === "bgmi";

  /* ================= FETCH GAME ================= */
  useEffect(() => {
    const token = sessionStorage.getItem("token");

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

    // router.push(
    //   `/games/${slug}/buy/${item.itemSlug}?${query.toString()}`
    // );

    const isBGMI =
      game?.gameName?.toLowerCase() === "pubg mobile" || game?.gameName?.toLowerCase() === "bgmi";

    const basePath = isBGMI
      ? `/games/pubg/${slug}/buy`
      : `/games/${slug}/buy`;

    router.push(
      `${basePath}/${item.itemSlug}?${query.toString()}`
    );
  };

  return (
    <section className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-6">

      {/* ================= PREMIUM GAME SWITCHER HUD ================= */}
      <div className="max-w-6xl mx-auto mb-10 relative group">
        {/* Decorative Grid Accents */}
        <div className="absolute -top-4 left-0 right-0 flex justify-between px-2 opacity-20 pointer-events-none">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-[var(--accent)]" />
            <div className="w-6 h-1.5 bg-[var(--border)]/30" />
          </div>
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">SEC-NAV // 001</span>
        </div>

        <div className="relative rounded-2xl bg-gradient-to-b from-[var(--card)]/60 to-[var(--card)]/20 backdrop-blur-xl border border-[var(--border)]/40 p-2 overflow-hidden shadow-2xl">
          {/* Scanline Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] z-0 bg-[length:100%_4px] pointer-events-none opacity-20" />

          {/* Scroll Fade Gradients */}
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[var(--card)]/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--card)]/80 to-transparent z-10 pointer-events-none" />

          <div className="flex items-center gap-3 overflow-x-auto py-2 no-scrollbar relative z-10 scroll-smooth">
            <div className="flex-shrink-0 w-6" /> {/* Spacer for gradient */}
            {allGames.map((g) => {
              const isActive = g.gameSlug === slug;
              return (
                <button
                  key={g.gameSlug}
                  onClick={() => router.push(`/games/${g.gameSlug}`)}
                  className={`
                    relative flex-shrink-0 flex flex-col items-center gap-2 group/btn
                    p-1.5 min-w-[80px] rounded-xl transition-all duration-500
                    ${isActive
                      ? "bg-[var(--accent)]/10 scale-105"
                      : "hover:bg-white/5"}
                  `}
                >
                  {/* Image Container with Tactical Border */}
                  <div className={`
                    relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-500
                    ${isActive
                      ? "border-[var(--accent)] shadow-[0_0_15px_rgba(var(--accent-rgb),0.4)]"
                      : "border-[var(--border)]/40 grayscale group-hover/btn:grayscale-0 group-hover/btn:border-[var(--accent)]/50"}
                  `}>
                    <Image
                      src={g.gameImageId?.image || logo}
                      alt={g.gameName}
                      fill
                      className="object-cover"
                    />
                    {/* Active Scan Effect */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-x-0 h-px bg-white/50 z-20"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex flex-col items-center">
                    <span className={`
                      text-[9px] font-black uppercase tracking-tight transition-colors duration-300
                      ${isActive ? "text-[var(--accent)]" : "text-[var(--muted)] group-hover/btn:text-[var(--foreground)]"}
                    `}>
                      {g.gameName === "PUBG Mobile" ? "BGMI" : g.gameName}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-glow"
                        className="h-1 w-4 bg-[var(--accent)] rounded-full mt-1 shadow-[0_0_8px_var(--accent)]"
                      />
                    )}
                  </div>
                </button>
              );
            })}
            <div className="flex-shrink-0 w-6" /> {/* Spacer for gradient */}
          </div>
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
            {/* {game?.gameName} */}
            {isBGMI ? "BGMI" : game?.gameName}
          </h1>
          <p className="text-xs text-[var(--muted)]">
            {game?.gameFrom}
          </p>
        </div>
      </div>

      {/* ================= ITEM GRID ================= */}
      {isBGMI ? (
        <ItemGridBgmi
          items={game.allItems}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          buyPanelRef={buyPanelRef}
        />
      ) : (
        <ItemGrid
          items={game.allItems}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          buyPanelRef={buyPanelRef}
        />

      )}

      {/* ================= BUY PANEL ================= */}
      {isBGMI ? (
        <BuyPanelBgmi
          activeItem={activeItem}
          onBuy={goBuy}
          redirecting={redirecting}
          buyPanelRef={buyPanelRef}
        />
      ) : (
        <BuyPanel
          activeItem={activeItem}
          onBuy={goBuy}
          redirecting={redirecting}
          buyPanelRef={buyPanelRef}
        />
      )}


    </section>
  );
}
