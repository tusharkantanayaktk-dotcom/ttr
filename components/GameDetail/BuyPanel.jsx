"use client";

import Image from "next/image";
const logo = "/logo.svg";

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
      className="fixed bottom-2 sm:bottom-4 left-3 right-3 sm:left-6 sm:right-6 z-40 max-w-4xl mx-auto rounded-2xl sm:rounded-3xl bg-[var(--card)]/95 backdrop-blur-xl border border-[var(--border)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-3.5 py-2.5 sm:py-3 transition-all"
    >
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        {/* Item Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative w-8.5 h-8.5 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-[var(--background)] border border-[var(--border)] shrink-0 shadow-xs flex items-center justify-center p-0.5">
            <Image
              src={activeItem.itemImageId?.image || gameLogo || logo}
              alt={activeItem.itemName}
              fill
              className="object-contain"
            />
          </div>

          <div className="min-w-0 flex flex-col justify-center">
            <h2 className="text-[11px] sm:text-xs font-bold truncate text-[var(--foreground)] leading-tight flex items-center gap-1">
              <svg className="w-3 h-3 text-[var(--accent)] shrink-0" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 1L1 5L8 15L15 5L12 1H4Z" />
              </svg>
              <span className="truncate">{activeItem.itemName}</span>
            </h2>

            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-sm sm:text-lg font-black text-[var(--accent)] tracking-tight leading-none">
                ₹{activeItem.sellingPrice}
              </p>

              {activeItem.dummyPrice && (
                <p className="text-[9.5px] sm:text-xs line-through text-[var(--muted)] leading-none font-medium">
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
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 active:scale-95 shadow-md flex items-center gap-1.5 justify-center min-w-[105px] sm:min-w-[130px]
              ${
                redirecting
                  ? "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
                  : "bg-[var(--accent)] text-white hover:opacity-95 hover:shadow-[0_4px_16px_rgba(139,92,246,0.35)]"
              }`}
          >
            {redirecting ? (
              <span>Redirecting…</span>
            ) : (
              <>
                <span>Buy Now</span>
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
