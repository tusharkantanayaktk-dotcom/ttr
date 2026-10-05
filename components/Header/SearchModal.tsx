"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX, FiZap, FiPackage, FiArrowRight } from "react-icons/fi";
import logo from "@/public/logo.png";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (games.length === 0) {
        setLoading(true);
        fetch("/api/games")
          .then((res) => res.json())
          .then((data) => {
            const rawGames = data?.data?.games || [];
            const processed = rawGames.map((g: any) => {
              let name = g.gameName || "";
              if (name.toUpperCase().includes("MLBB")) {
                name = name.replace(/MLBB/gi, "Mobile Legends");
              }
              return { ...g, gameName: name };
            });
            setGames(processed);
          })
          .catch(() => setGames([]))
          .finally(() => setLoading(false));
      }
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredGames = useMemo(() => {
    if (!query.trim()) return games.slice(0, 8);
    const q = query.toLowerCase().trim();
    return games.filter(
      (g) =>
        g.gameName?.toLowerCase().includes(q) ||
        g.gameSlug?.toLowerCase().includes(q) ||
        g.gameFrom?.toLowerCase().includes(q)
    );
  }, [games, query]);

  const handleSelectGame = (slug: string) => {
    onClose();
    router.push(`/games/${slug}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1100] flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-xl bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]"
        >
          {/* Search Header Input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)]">
            <FiSearch size={18} className="text-[var(--accent)] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search games, vouchers, items..."
              className="w-full bg-transparent text-sm sm:text-base font-bold text-[var(--foreground)] placeholder:text-[var(--muted)]/50 outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <FiX size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[10px] font-mono uppercase px-2 py-1 rounded bg-[var(--foreground)]/[0.05] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] shrink-0"
            >
              ESC
            </button>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 custom-scrollbar space-y-1">
            {loading ? (
              <div className="py-12 text-center text-xs text-[var(--muted)] font-mono animate-pulse">
                Loading game catalog...
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="py-12 text-center text-xs text-[var(--muted)] space-y-1">
                <FiPackage size={24} className="mx-auto mb-2 opacity-40" />
                <p className="font-bold">No results found for &quot;{query}&quot;</p>
                <p className="text-[11px] opacity-70">Try searching for Mobile Legends, PUBG, or game slug</p>
              </div>
            ) : (
              <>
                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--muted)] flex items-center justify-between">
                  <span>{query ? "Matching Results" : "Popular Games"}</span>
                  <span className="font-mono">{filteredGames.length} available</span>
                </div>

                <div className="grid grid-cols-1 gap-1">
                  {filteredGames.map((game: any) => (
                    <button
                      key={game.gameSlug}
                      onClick={() => handleSelectGame(game.gameSlug)}
                      className="w-full flex items-center justify-between p-2 sm:p-2.5 rounded-xl hover:bg-[var(--foreground)]/[0.04] border border-transparent hover:border-[var(--border)] transition-all group text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden bg-[var(--background)] border border-[var(--border)] shrink-0">
                          <Image
                            src={game.gameImageId?.image || logo}
                            alt={game.gameName || "Game"}
                            fill
                            sizes="44px"
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors">
                              {game.gameName}
                            </h4>
                            {game.tagId && (
                              <span
                                className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider shrink-0"
                                style={{
                                  backgroundColor: `${game.tagId.tagBackground}20`,
                                  color: game.tagId.tagColor,
                                }}
                              >
                                {game.tagId.tagName}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[var(--muted)] font-mono truncate">
                            {game.gameFrom || "Instant Delivery"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-2 shrink-0">
                        <span className="hidden sm:inline text-[10px] font-mono text-[var(--muted)] opacity-60 group-hover:opacity-100 group-hover:text-[var(--accent)]">
                          View
                        </span>
                        <FiArrowRight
                          size={14}
                          className="text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Quick Footer */}
          <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--foreground)]/[0.01] flex items-center justify-between text-[10px] font-mono text-[var(--muted)]">
            <span className="flex items-center gap-1.5">
              <FiZap size={11} className="text-[var(--accent)]" /> Instant top-ups available
            </span>
            <span>Press ESC to exit</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}