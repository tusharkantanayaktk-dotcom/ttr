"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiFilter, FiX, FiSearch, FiZap, FiBox, FiActivity, FiArrowRight } from "react-icons/fi";
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

  /* ================= GAME CARD ================= */
  const GameCard = ({ game }: any) => {
    const disabled = isOutOfStock(game.gameName);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={!disabled ? { y: -10 } : {}}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="group relative"
      >
        <Link
          href={disabled ? "#" : `/games/${game.gameSlug}`}
          className={`flex flex-col gap-5 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          {/* IMAGE WRAPPER */}
          <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-[var(--card)] border border-[var(--border)]/40 transition-all duration-700 group-hover:border-[var(--accent)]/60 group-hover:shadow-[0_15px_40px_rgba(var(--accent-rgb),0.15)]">

            {/* Animated Glow Ring on Hover */}
            {!disabled && (
              <div className="absolute inset-0 p-[1.5px] rounded-[1.5rem] overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)] via-purple-500 to-[var(--accent)] animate-spin-slow opacity-30" />
              </div>
            )}

            <div className="relative w-full h-full rounded-[1.4rem] overflow-hidden bg-[var(--background)]">
              <Image
                src={game.gameImageId?.image || logo}
                alt={game.gameName}
                fill
                className={`object-cover transition-transform duration-1000 ease-[0.23, 1, 0.32, 1]
                ${disabled ? "grayscale opacity-30 blur-[4px]" : "group-hover:scale-110"}`}
              />

              {/* Dynamic Overlay */}
              {!disabled && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-500" />
              )}

              {/* TAGS / BADGES */}
              <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
                {!disabled && game.tagId ? (
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-[0.1em] backdrop-blur-md border border-white/10 shadow-xl flex items-center gap-1.5"
                    style={{
                      background: `${game.tagId.tagBackground}aa`,
                      color: game.tagId.tagColor,
                    }}
                  >
                    <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                    {game.tagId.tagName}
                  </motion.div>
                ) : <div />}

                {!disabled && (
                  <div className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 opacity-0 group-hover:opacity-100 group-hover:text-[var(--accent)] transition-all duration-500 scale-75 group-hover:scale-100">
                    <FiZap size={10} />
                  </div>
                )}
              </div>

              {/* OUT OF STOCK OVERLAY */}
              {disabled && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
                  <span className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-2">
                    <FiX size={16} />
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-red-500/80">
                    Offline
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* CARD FOOTER */}
          <div className="px-1.5 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[12px] font-bold text-[var(--foreground)] truncate leading-tight tracking-tight group-hover:text-[var(--accent)] transition-colors duration-300">
                {game.gameName}
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              {game.gameFrom && (
                <p className="text-[8px] text-[var(--muted)] font-black uppercase tracking-[0.1em] opacity-40 group-hover:opacity-80 transition-opacity truncate max-w-[60px]">
                  {game.gameFrom}
                </p>
              )}
              <div className="h-px flex-1 bg-[var(--border)]/20" />
              {!disabled && (
                <span className="text-[7px] font-black uppercase tracking-widest text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-all duration-500">
                  Active
                </span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  const SectionHeader = ({ title, count, icon: Icon }: any) => (
    <div className="flex items-center justify-between mb-12">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shadow-sm">
          <Icon size={20} />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] tracking-tight">
            {title}
          </h2>
          {count !== undefined && (
            <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-[0.2em] opacity-60 mt-0.5">
              Showing {count} Available
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* AMBIENT BACKGROUND */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_center,var(--accent)_0%,transparent_70%)] opacity-[0.03] pointer-events-none" />

      {/* ================= FILTER BAR ================= */}
      <div className="sticky top-0 md:top-[64px] z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]/40 py-3">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center gap-2 md:gap-4">

          {/* SEARCH */}
          <div className="relative flex-1 group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gaming nodes..."
              className="w-full h-11 pl-10 pr-10 rounded-xl border border-[var(--border)]/50 
                       bg-[var(--card)]/40 text-[13px] font-medium outline-none transition-all
                       focus:border-[var(--accent)]/30 focus:bg-[var(--card)]/60"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-red-500 transition-colors"
                >
                  <FiX size={14} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* FILTER ACTION */}
          <button
            onClick={() => setShowFilter(true)}
            className="flex items-center gap-2 h-11 px-4 md:px-6 rounded-xl 
                     bg-[var(--foreground)] text-[var(--background)] font-bold text-xs uppercase tracking-tight
                     hover:bg-[var(--accent)] hover:text-white transition-all active:scale-95 shrink-0"
          >
            <FiFilter size={16} />
            <span className="hidden sm:inline">Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 flex items-center justify-center text-[9px] rounded-full bg-[var(--accent)] text-white font-black border border-[var(--foreground)]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-6 mt-16 space-y-32">

        {/* GAMES SECTION */}
        <section>
          <SectionHeader
            title="Gaming Collection"
            count={processGames(games).length}
            icon={FiBox}
          />
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {processGames(games).map((game: any, i: number) => (
              <GameCard key={i} game={game} />
            ))}
          </div>
        </section>

        {/* OTT SECTION */}
        {otts?.items?.length > 0 && (
          <section>
            <SectionHeader title={otts.title} icon={FiZap} />
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
              {otts.items.map((ott: any) => (
                <motion.div
                  key={ott.slug}
                  className="group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.5 }}
                >
                  <Link href={`/games/ott/${ott.slug}`} className="flex flex-col gap-5">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-[var(--card)] border border-[var(--border)]/40 transition-all duration-700 group-hover:border-[var(--accent)]/50 group-hover:shadow-[0_15px_40px_rgba(var(--accent-rgb),0.2)]">
                      <Image
                        src={ott.image}
                        alt={ott.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                      />

                      {/* Animated Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                      <div className="absolute inset-0 p-4 flex flex-col justify-end gap-1.5 z-10">
                        <div className="flex flex-col gap-0.5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                          <p className="text-[8px] text-[var(--accent)] font-black uppercase tracking-[0.2em] drop-shadow-md">
                            {ott.category}
                          </p>
                          <h4 className="text-[12px] font-black text-white truncate uppercase tracking-tighter italic">
                            {ott.name}
                          </h4>
                        </div>
                      </div>

                      {/* Top Right Accent */}
                      <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 group-hover:text-[var(--accent)] transition-colors">
                        <FiActivity size={10} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* MEMBERSHIP SECTION */}
        {memberships?.items?.length > 0 && (
          <section>
            <SectionHeader title={memberships.title} icon={FiActivity} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {memberships.items.map((plan: any) => (
                <motion.div
                  key={plan.slug}
                  className="group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={`/games/membership/${plan.slug}`}
                    className="relative flex flex-col p-6 md:p-8 rounded-[2rem] bg-[var(--card)] border border-[var(--border)]/40 transition-all duration-500 hover:border-[var(--accent)]/50 group-hover:shadow-[0_20px_40px_rgba(var(--accent-rgb),0.1)] group-hover:-translate-y-2 overflow-hidden"
                  >
                    {/* Dynamic Background Glows */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] opacity-[0.02] blur-[60px] group-hover:opacity-[0.08] transition-opacity duration-700" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500 opacity-0 blur-[40px] group-hover:opacity-[0.04] transition-opacity duration-1000" />

                    <div className="flex items-start justify-between mb-8 relative z-10">
                      <div className="w-16 h-16 relative rounded-2xl overflow-hidden border-2 border-[var(--border)]/50 group-hover:border-[var(--accent)]/40 transition-colors duration-500 shadow-lg group-hover:scale-105 transform-gpu transition-transform">
                        <Image src={plan.image} alt={plan.name} fill className="object-cover" />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center border border-[var(--accent)]/20 shadow-sm group-hover:rotate-12 transition-transform duration-500">
                        <FiZap size={18} fill="currentColor" className="opacity-30 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                      <div>
                        <p className="text-[9px] text-[var(--muted)] font-black uppercase tracking-[0.3em] mb-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                          Subscription Plan
                        </p>
                        <h4 className="text-xl font-black text-[var(--foreground)] uppercase italic tracking-tighter group-hover:text-[var(--accent)] transition-colors">
                          {plan.name}
                        </h4>
                      </div>

                      <div className="inline-flex px-4 py-1.5 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                        {plan.duration}
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--muted)] group-hover:text-[var(--foreground)] transition-all duration-500">
                        Activate Profile
                        <div className="w-7 h-7 rounded-full border border-[var(--border)] group-hover:border-[var(--accent)]/50 flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:text-black transition-all">
                          <FiArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                      <FiActivity className="text-[var(--border)] group-hover:text-[var(--accent)]/30 transition-colors duration-500" size={20} />
                    </div>

                    {/* Subtle Overlay Pattern */}
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:15px_15px]" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
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
    </div>
  );
}
