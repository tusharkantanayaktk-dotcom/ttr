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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="group"
      >
        <Link
          href={disabled ? "#" : `/games/${game.gameSlug}`}
          className={`flex flex-col gap-4 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          {/* IMAGE WRAPPER */}
          <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-[var(--card)] border border-[var(--border)]/40 transition-all duration-500 group-hover:border-[var(--accent)]/50 group-hover:shadow-2xl">
            <Image
              src={game.gameImageId?.image || logo}
              alt={game.gameName}
              fill
              className={`object-cover transition-transform duration-700 ease-out
              ${disabled ? "grayscale opacity-40 blur-[2px]" : "group-hover:scale-110"}`}
            />

            {/* OVERLAY */}
            {!disabled && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            )}

            {/* TAG */}
            {!disabled && game.tagId && (
              <div className="absolute top-4 left-4 z-20">
                <span
                  className="text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-widest backdrop-blur-md border border-white/10 shadow-lg inline-flex items-center gap-1.5"
                  style={{
                    background: game.tagId.tagBackground,
                    color: game.tagId.tagColor,
                  }}
                >
                  <div className="w-1 h-1 rounded-full bg-current" />
                  {game.tagId.tagName}
                </span>
              </div>
            )}

            {/* STOCK INDICATOR */}
            {disabled && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black uppercase tracking-widest bg-red-500 text-white px-3 py-1 rounded-full">
                  Unavailable
                </span>
              </div>
            )}
          </div>

          {/* INFO SECTION */}
          <div className="px-2 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors tracking-tight">
                {game.gameName}
              </h3>
              {!disabled && (
                <FiArrowRight className="text-[var(--accent)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" size={14} />
              )}
            </div>
            {game.gameFrom && (
              <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest opacity-60">
                {game.gameFrom}
              </p>
            )}
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
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12">
            {processGames(games).map((game: any, i: number) => (
              <GameCard key={i} game={game} />
            ))}
          </div>
        </section>

        {/* OTT SECTION */}
        {otts?.items?.length > 0 && (
          <section>
            <SectionHeader title={otts.title} icon={FiZap} />
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12">
              {otts.items.map((ott: any) => (
                <motion.div key={ott.slug} className="group cursor-pointer">
                  <Link href={`/games/ott/${ott.slug}`} className="flex flex-col gap-4">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[2.5rem] bg-[var(--card)] border border-[var(--border)]/40 transition-all duration-500 group-hover:border-[var(--accent)]/50 group-hover:shadow-2xl">
                      <Image src={ott.image} alt={ott.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <p className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-[0.2em] mb-1">
                          {ott.category}
                        </p>
                        <h4 className="text-sm font-bold text-white truncate uppercase">
                          {ott.name}
                        </h4>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {memberships.items.map((plan: any) => (
                <motion.div key={plan.slug} className="group">
                  <Link
                    href={`/games/membership/${plan.slug}`}
                    className="relative flex flex-col p-8 rounded-[3rem] bg-[var(--card)] border border-[var(--border)]/40 hover:border-[var(--accent)]/50 transition-all group-hover:shadow-2xl overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] opacity-[0.03] blur-[60px]" />

                    <div className="flex items-start justify-between mb-8">
                      <div className="w-16 h-16 relative rounded-2xl overflow-hidden border border-[var(--border)]">
                        <Image src={plan.image} alt={plan.name} fill className="object-cover" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                        <FiZap size={18} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-[var(--foreground)] uppercase italic tracking-tighter">
                        {plan.name}
                      </h4>
                      <div className="inline-flex px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold uppercase tracking-widest">
                        {plan.duration}
                      </div>
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors">
                      Activate Profile <FiArrowRight />
                    </div>
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
