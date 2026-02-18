"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiFilter, FiX, FiSearch, FiZap, FiBox, FiActivity } from "react-icons/fi";
import logo from "@/public/logo.png";
import GamesFilterModal from "@/components/Games/GamesFilterModal";

export default function GamesPage() {
  const [category, setCategory] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [otts, setOtts] = useState<any>(null);
  const [memberships, setMemberships] = useState<any>(null);

  /* ================= FILTER STATE ================= */
  const [showFilter, setShowFilter] = useState(false);
  const [sort, setSort] = useState<"az" | "za">("az");
  const [hideOOS, setHideOOS] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* ================= CONFIG ================= */
  const SPECIAL_MLBB_GAME = "MLBB SMALL";

  const outOfStockGames = [
    "Genshin Impact",
    "Honor Of Kings",
    "TEST 1",
    "Wuthering of Waves",
    "Where Winds Meet"
  ];

  const isOutOfStock = (name: string) =>
    outOfStockGames.includes(name);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => {
        const fetchedOtts = data?.data?.otts || null;
        setOtts(fetchedOtts);
        const fetchedMemberships = data?.data?.memberships || null;
        setMemberships(fetchedMemberships);

        setCategory(data?.data?.category || []);
        setGames(
          (data?.data?.games || []).map((g: any) =>
            g.gameName === "PUBG Mobile"
              ? { ...g, gameName: "PUBG Mobile" }
              : g
          )
        );
      });
  }, []);

  /* ================= ACTIVE FILTER COUNT ================= */
  const activeFilterCount =
    (sort !== "az" ? 1 : 0) +
    (hideOOS ? 1 : 0) +
    (searchQuery ? 1 : 0);

  /* ================= FILTER + SORT + SEARCH ================= */
  const processGames = (list: any[]) => {
    let filtered = [...list];

    if (hideOOS) {
      filtered = filtered.filter(
        (g) => !isOutOfStock(g.gameName)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.gameName.toLowerCase().includes(q) ||
          g.gameFrom?.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) =>
      sort === "az"
        ? a.gameName.localeCompare(b.gameName)
        : b.gameName.localeCompare(a.gameName)
    );

    return filtered;
  };

  /* ================= PIN MLBB GAME ================= */
  const injectSpecialGame = (cat: any) => {
    if (
      !cat.categoryTitle
        ?.toLowerCase()
        .includes("mobile legends")
    ) {
      return cat.gameId;
    }

    const specialGame = games.find(
      (g) => g.gameName === SPECIAL_MLBB_GAME
    );

    if (!specialGame) return cat.gameId;

    const withoutDuplicate = cat.gameId.filter(
      (g: any) => g.gameName !== SPECIAL_MLBB_GAME
    );

    return [specialGame, ...withoutDuplicate];
  };

  /* ================= GAME CARD ================= */
  const GameCard = ({ game }: any) => {
    const disabled = isOutOfStock(game.gameName);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={!disabled ? { y: -8, transition: { duration: 0.3, ease: "easeOut" } } : {}}
      >
        <Link
          href={disabled ? "#" : `/games/${game.gameSlug}`}
          className={`group relative flex flex-col items-center p-1.5 md:p-2.5 rounded-[1.5rem]
          bg-gradient-to-b from-[var(--card)]/60 to-[var(--card)]/20 backdrop-blur-xl 
          border border-[var(--border)]/40 transition-all duration-500 overflow-hidden
          ${disabled
              ? "opacity-50 grayscale cursor-not-allowed"
              : "hover:border-[var(--accent)]/60 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
            }`}
        >
          {/* IMAGE WRAPPER */}
          <div className="relative w-full aspect-square overflow-hidden rounded-[1.2rem] bg-black/40 shadow-inner">
            <Image
              src={game.gameImageId?.image || logo}
              alt={game.gameName}
              fill
              className={`object-cover transition-transform duration-700 ease-out
              ${disabled ? "blur-[2px]" : "group-hover:scale-110"}`}
            />

            {/* HIGH-TECH OVERLAY LAYER */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 opacity-40 group-hover:opacity-20 transition-opacity" />

            {/* SCANLINE EFFECT */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />

            {/* TAG */}
            {!disabled && game.tagId && (
              <div className="absolute top-2 left-2 z-20">
                <span
                  className="text-[8px] md:text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest backdrop-blur-md border border-white/20 shadow-xl inline-flex items-center gap-1"
                  style={{
                    background: game.tagId.tagBackground,
                    color: game.tagId.tagColor,
                  }}
                >
                  <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                  {game.tagId.tagName}
                </span>
              </div>
            )}

            {/* STOCK INDICATOR */}
            {disabled && (
              <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[2px]">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 bg-red-600/90 text-white rounded-lg shadow-2xl border border-red-400/30">
                  OOS
                </span>
              </div>
            )}
          </div>

          {/* INFO SECTION */}
          <div className="w-full mt-3 px-1 space-y-0.5 pb-1">
            <h3 className="text-[11px] md:text-[13px] font-black text-[var(--foreground)] truncate 
                         group-hover:text-[var(--accent)] transition-colors uppercase tracking-tight">
              {game.gameName}
            </h3>
            {game.gameFrom && (
              <div className="flex items-center justify-center gap-1.5">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)]/50 to-transparent" />
                <p className="text-[8px] md:text-[9px] text-[var(--muted)] truncate font-bold uppercase tracking-[0.1em] shrink-0">
                  {game.gameFrom}
                </p>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--border)]/50 to-transparent" />
              </div>
            )}
          </div>

          {/* DECORATIVE CORNER */}
          <div className="absolute top-0 right-0 p-1">
            <div className="w-4 h-4 border-t-2 border-r-2 border-[var(--accent)]/0 group-hover:border-[var(--accent)]/40 transition-all duration-500 rounded-tr-xl" />
          </div>
        </Link>
      </motion.div>
    );
  };

  const SectionHeader = ({ title, count, icon: Icon }: any) => (
    <div className="flex items-center gap-4 mb-8 px-1">
      <div className="relative group">
        <div className="absolute inset-0 bg-[var(--accent)]/30 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="relative p-2.5 rounded-xl bg-[var(--accent)] text-black shadow-[0_0_20px_rgba(var(--accent-rgb),0.4)]">
          <Icon size={22} />
        </div>
      </div>
      <div className="flex flex-col">
        <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-[–0.05em] uppercase italic leading-none">
          {title}
        </h2>
        {count !== undefined && (
          <div className="flex items-center gap-2 mt-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-[0.25em]">
              {count} Units Detected
            </p>
          </div>
        )}
      </div>
      <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--border)] via-[var(--border)]/20 to-transparent ml-6 opacity-40" />
    </div>
  );

  return (
    <section className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      {/* GLOBAL GRID OVERLAY */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none -z-10" />

      {/* AMBIENT EFFECTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accent)]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--accent)]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* ================= FILTER BAR ================= */}
      <div className="sticky top-0 md:top-[64px] z-40 bg-[var(--background)]/60 backdrop-blur-2xl border-b border-[var(--border)]/50">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center gap-4">

          {/* SEARCH */}
          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-[var(--accent)]/5 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="COMMAND SEARCH..."
              className="w-full h-12 pl-12 pr-12 rounded-2xl border border-[var(--border)]/50 
                       bg-[var(--card)]/40 text-xs font-black tracking-widest outline-none transition-all
                       focus:border-[var(--accent)]/50 focus:ring-4 focus:ring-[var(--accent)]/5 uppercase
                       placeholder:text-[var(--muted)]/40"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-[var(--muted)] hover:bg-red-500/10 hover:text-red-500 transition-all z-20"
                >
                  <FiX size={18} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilter(true)}
              className="relative flex items-center justify-center gap-3 h-12 px-6 rounded-2xl 
                       bg-white text-black font-black text-xs uppercase tracking-widest
                       hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all
                       hover:scale-105 active:scale-95 shadow-xl"
            >
              <FiFilter size={20} />
              <span className="hidden sm:inline">Module Filter</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[24px] h-[24px] flex items-center justify-center text-[10px] rounded-full bg-[var(--accent)] text-black font-black border-2 border-white shadow-lg">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-24">

        {/* ALL GAMES SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionHeader
            title="Active Products"
            count={processGames(games).length}
            icon={FiBox}
          />
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-8 lg:gap-12">
            {processGames(games).map((game: any, i: number) => (
              <GameCard key={i} game={game} />
            ))}
          </div>
        </motion.div>

        {/* OTT SECTION */}
        {otts?.items?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionHeader title={otts.title} icon={FiZap} />
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-10">
              {otts.items.map((ott: any) => (
                <motion.div
                  key={ott.slug}
                  whileHover={{ y: -8 }}
                >
                  <Link
                    href={`/games/ott/${ott.slug}`}
                    className="group relative flex flex-col p-1.5 rounded-[1.5rem] bg-[var(--card)]/40 backdrop-blur-xl border border-[var(--border)]/40 transition-all duration-500 overflow-hidden"
                  >
                    <div className="relative w-full aspect-[3/4] overflow-hidden rounded-[1.2rem]">
                      <Image src={ott.image} alt={ott.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-xs md:text-sm font-black text-white italic truncate uppercase tracking-tight">
                          {ott.name}
                        </p>
                        <p className="text-[8px] md:text-[9px] text-[var(--accent)] font-black uppercase tracking-[0.2em] mt-0.5">
                          {ott.category}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* MEMBERSHIP SECTION */}
        {memberships?.items?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionHeader title={memberships.title} icon={FiActivity} />
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-10">
              {memberships.items.map((plan: any) => (
                <motion.div
                  key={plan.slug}
                  whileHover={{ y: -10 }}
                >
                  <Link
                    href={`/games/membership/${plan.slug}`}
                    className="group relative flex flex-col p-2 rounded-[2rem] bg-gradient-to-br from-[var(--accent)]/10 to-transparent backdrop-blur-xl border border-[var(--accent)]/30 transition-all duration-500"
                  >
                    <div className="relative w-full aspect-square overflow-hidden rounded-[1.5rem] bg-black/60 shadow-2xl">
                      <Image src={plan.image} alt={plan.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>
                    <div className="mt-5 pb-3 text-center">
                      <p className="text-[13px] font-black text-[var(--foreground)] uppercase tracking-tighter italic">
                        {plan.name}
                      </p>
                      <div className="inline-block mt-2 px-3 py-1 rounded-full bg-[var(--accent)] text-black text-[9px] font-black uppercase tracking-widest shadow-lg">
                        {plan.duration}
                      </div>
                    </div>
                    {/* PREMIUM INDICATOR */}
                    <div className="absolute top-4 right-4 p-2 bg-white text-black rounded-full shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                      <FiZap size={14} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* ================= FILTER MODAL ================= */}
      <AnimatePresence>
        {showFilter && (
          <GamesFilterModal
            open={showFilter}
            onClose={() => setShowFilter(false)}
            sort={sort}
            setSort={setSort}
            hideOOS={hideOOS}
            setHideOOS={setHideOOS}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
