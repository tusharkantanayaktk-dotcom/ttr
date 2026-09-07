"use client";

import Image from "next/image";
import logo from "@/public/logo.png";

export default function BuyPanel({
  activeItem,
  onBuy,
  redirecting,
  buyPanelRef,
  gameLogo,
}) {
  if (!activeItem) return null;

  return (
    <div
      ref={buyPanelRef}
      className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--card)]/90 backdrop-blur-xl border-t border-[var(--border)] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] px-4 py-3 sm:py-4 transition-all"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Item Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-[var(--background)] border border-[var(--border)] shrink-0 shadow-sm">
            <Image
              src={activeItem.itemImageId?.image || gameLogo || logo}
              alt={activeItem.itemName}
              fill
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex flex-col justify-center">
            <h2 className="text-xs sm:text-sm font-bold truncate text-[var(--foreground)] leading-tight flex items-center gap-1">
              <span>💎</span>
              <span className="truncate">{activeItem.itemName}</span>
            </h2>

            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-lg sm:text-2xl font-black text-[var(--accent)] tracking-tight leading-none">
                ₹{activeItem.sellingPrice}
              </p>

              {activeItem.dummyPrice && (
                <p className="text-xs line-through text-[var(--muted)] leading-none">
                  ₹{activeItem.dummyPrice}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Buy Now Button */}
        <div className="shrink-0">
          <button
            onClick={() => onBuy(activeItem)}
            disabled={redirecting}
            className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center min-w-[120px] sm:min-w-[150px]
              ${
                redirecting
                  ? "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
                  : "bg-[var(--accent)] text-black hover:opacity-90 hover:shadow-[var(--accent)]/25"
              }`}
          >
            {redirecting ? "Redirecting…" : "Buy Now →"}
          </button>
        </div>
      </div>
    </div>
  );
}
