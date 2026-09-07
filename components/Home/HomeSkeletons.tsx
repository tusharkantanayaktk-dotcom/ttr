import React from "react";
import Skeleton from "../Skeleton";

/**
 * Top Notice Banner Skeleton
 * Matches the actual TopNoticeBanner pill layout with icon, text, and action
 */
export const TopNoticeBannerSkeleton = () => (
  <div className="w-full bg-[var(--card)]/60 border-b border-[var(--border)] py-2 px-4">
    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <Skeleton width={18} height={18} className="rounded-md shrink-0" />
        <Skeleton width="45%" height={12} className="rounded-full max-w-[280px]" />
      </div>
      <Skeleton width={16} height={16} variant="circle" className="shrink-0" />
    </div>
  </div>
);

/**
 * Game Banner Carousel Skeleton
 * Matches the exact dimensions and controls of GameBannerCarousel
 */
export const GameBannerCarouselSkeleton = () => (
  <div className="relative w-full max-w-[1600px] mx-auto px-4 md:px-12 mt-2 md:mt-6">
    <div className="relative h-[220px] sm:h-[240px] md:h-[340px] rounded-2xl sm:rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--card)]/40 p-4 sm:p-8 flex flex-col justify-between">
      {/* Top Tag & Indicator */}
      <div className="flex items-center justify-between">
        <Skeleton width={90} height={22} className="rounded-full" />
        <Skeleton width={40} height={20} className="rounded-full" />
      </div>

      {/* Middle Banner Content */}
      <div className="space-y-2.5 max-w-md">
        <Skeleton width="75%" height={28} className="rounded-lg sm:h-9" />
        <Skeleton width="50%" height={14} className="rounded-md" />
      </div>

      {/* Bottom Action & Pagination Dots */}
      <div className="flex items-center justify-between">
        <Skeleton width={110} height={36} className="rounded-xl" />
        <div className="flex items-center gap-1.5">
          <Skeleton width={20} height={6} className="rounded-full" />
          <Skeleton width={8} height={6} variant="circle" />
          <Skeleton width={8} height={6} variant="circle" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Flash Sale Skeleton
 * Matches the real FlashSale countdown header and 6-column product cards
 */
export const FlashSaleSkeleton = () => (
  <section className="relative py-2.5 sm:py-3 px-4 border-b border-[var(--border)] overflow-hidden">
    <div className="max-w-7xl mx-auto">
      {/* Header with Title and Countdown */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <Skeleton width={22} height={22} className="rounded-lg shrink-0" />
          <Skeleton width={100} height={18} className="rounded-md" />
          <Skeleton width={50} height={18} className="rounded-full hidden sm:block" />
        </div>
        <div className="flex items-center gap-2">
          {/* Countdown Boxes */}
          <div className="flex items-center gap-1">
            <Skeleton width={24} height={20} className="rounded-md" />
            <span className="text-[var(--muted)] font-bold text-xs">:</span>
            <Skeleton width={24} height={20} className="rounded-md" />
            <span className="text-[var(--muted)] font-bold text-xs">:</span>
            <Skeleton width={24} height={20} className="rounded-md" />
          </div>
          <Skeleton width={70} height={24} className="rounded-lg hidden sm:block" />
        </div>
      </div>

      {/* Flash Sale Product Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--card)]/50 space-y-2 flex flex-col justify-between"
          >
            {/* Image Placeholder with discount badge */}
            <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-[var(--foreground)]/[0.04]">
              <Skeleton className="w-full h-full rounded-lg border-none" />
              <div className="absolute top-1 left-1">
                <Skeleton width={32} height={14} className="rounded-md" />
              </div>
            </div>

            {/* Product Title */}
            <div className="space-y-1">
              <Skeleton width="85%" height={11} className="rounded" />
              <Skeleton width="55%" height={9} className="rounded" />
            </div>

            {/* Pricing & CTA */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-baseline justify-between">
                <Skeleton width={44} height={14} className="rounded" />
                <Skeleton width={28} height={10} className="rounded" />
              </div>
              <Skeleton width="100%" height={22} className="rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/**
 * Story Slider Skeleton
 * Matches the real circular story avatar and label layout
 */
export const StorySliderSkeleton = () => (
  <section className="relative w-full overflow-hidden py-2 sm:py-3">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex gap-4 sm:gap-6 overflow-hidden py-1">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 max-w-[72px] sm:max-w-[80px]">
            {/* Story Avatar Ring */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] border border-[var(--border)] bg-[var(--card)]/50 flex items-center justify-center">
              <Skeleton width="100%" height="100%" variant="circle" className="border-none" />
            </div>
            {/* Story Title */}
            <Skeleton width={48} height={10} className="rounded-full mt-0.5" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

/**
 * Games Grid Skeleton
 * Matches the search bar, filter button, section header and game poster grid
 */
export const GamesPageSkeleton = () => (
  <section className="py-4 pb-12 bg-[var(--background)]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <Skeleton height={42} className="flex-1 rounded-full" />
        <Skeleton width={42} height={42} variant="circle" className="shrink-0" />
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Skeleton width={40} height={40} className="rounded-xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton width={140} height={22} className="rounded-md sm:h-6" />
            <Skeleton width={85} height={10} className="rounded-full" />
          </div>
        </div>
      </div>

      {/* Games Posters Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((i) => (
          <div key={i} className="space-y-1.5 group">
            {/* Game Poster Image */}
            <div className="relative aspect-[3/4] sm:aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)]/50">
              <Skeleton className="w-full h-full border-none rounded-[inherit]" />
            </div>
            {/* Game Title */}
            <div className="px-1 pt-0.5">
              <Skeleton width="80%" height={11} className="rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/**
 * TronicsWho / Why Choose Tronics Skeleton
 * Matches the 4-column feature highlights box
 */
export const TronicsWhoSkeleton = () => (
  <section className="py-6 sm:py-8 px-4 bg-[var(--background)] border-t border-[var(--border)]/40">
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-5 sm:mb-6 space-y-2">
        <Skeleton width={80} height={14} className="rounded-full" />
        <Skeleton width={220} height={24} className="rounded-md sm:h-7" />
        <Skeleton width={320} height={12} className="rounded-full max-w-full" />
      </div>

      {/* 4 Feature Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-3.5 sm:p-4 rounded-xl bg-[var(--card)]/50 border border-[var(--border)] space-y-2.5"
          >
            <Skeleton width={32} height={32} className="rounded-lg" />
            <Skeleton width="65%" height={14} className="rounded" />
            <div className="space-y-1">
              <Skeleton width="100%" height={10} className="rounded" />
              <Skeleton width="75%" height={10} className="rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/**
 * Home Services / Build Your Site Skeleton
 * Matches the compact bottom banner
 */
export const HomeServicesSkeleton = () => (
  <section className="px-4 py-3 bg-[var(--background)]">
    <div className="max-w-2xl mx-auto flex items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)]">
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <Skeleton width={8} height={8} variant="circle" />
          <Skeleton width={100} height={14} className="rounded" />
        </div>
        <Skeleton width="70%" height={10} className="rounded max-w-[200px]" />
      </div>
      <Skeleton width={96} height={34} className="rounded-xl shrink-0" />
    </div>
  </section>
);

/**
 * Composite Complete Home Page Skeleton
 * Used for instant, cohesive page-level transitions
 */
export const HomePageFullSkeleton = () => (
  <div className="w-full min-h-screen bg-[var(--background)] animate-pulse-subtle">
    <TopNoticeBannerSkeleton />
    <GameBannerCarouselSkeleton />
    <FlashSaleSkeleton />
    <StorySliderSkeleton />
    <GamesPageSkeleton />
    <TronicsWhoSkeleton />
    <HomeServicesSkeleton />
  </div>
);

