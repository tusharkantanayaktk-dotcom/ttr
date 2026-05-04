import React from "react";
import Skeleton from "../Skeleton";

export const TopNoticeBannerSkeleton = () => (
  <div className="w-full h-8 bg-[var(--background)] flex items-center justify-center border-b border-[var(--border)]/30">
    <Skeleton width="40%" height={10} className="rounded-full" />
  </div>
);

export const FlashSaleSkeleton = () => (
  <section className="py-2 px-4 border-b border-[var(--border)] opacity-95">
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Skeleton width={20} height={20} className="rounded-md" />
          <Skeleton width={100} height={20} className="rounded-md" />
        </div>
        <Skeleton width={80} height={24} className="rounded-lg" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2 p-1.5 border border-[var(--border)]/30 rounded-2xl">
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            <Skeleton width="60%" height={10} className="ml-1" />
            <Skeleton width="40%" height={12} className="ml-1" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const StorySliderSkeleton = () => (
  <section className="py-4 md:py-8 overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 flex gap-4 md:gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex flex-col items-center gap-3">
          <Skeleton width={64} height={64} variant="circle" className="md:w-20 md:h-20" />
          <Skeleton width={40} height={8} className="rounded-full" />
        </div>
      ))}
    </div>
  </section>
);

export const TronicsWhoSkeleton = () => (
  <section className="py-12 border-y border-[var(--border)]/30 bg-[var(--foreground)]/[0.02]">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div className="space-y-6">
        <Skeleton width="30%" height={12} className="rounded-full" />
        <Skeleton width="80%" height={40} className="rounded-lg" />
        <div className="space-y-3">
          <Skeleton width="100%" height={14} />
          <Skeleton width="90%" height={14} />
          <Skeleton width="70%" height={14} />
        </div>
        <div className="flex gap-4 pt-4">
          <Skeleton width={120} height={48} className="rounded-xl" />
          <Skeleton width={120} height={48} className="rounded-xl" />
        </div>
      </div>
      <Skeleton className="aspect-video w-full rounded-3xl" />
    </div>
  </section>
);

export const HomeServicesSkeleton = () => (
  <section className="py-12 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-8 rounded-3xl border border-[var(--border)]/30 space-y-4">
            <Skeleton width={48} height={48} className="rounded-2xl" />
            <Skeleton width="60%" height={24} className="rounded-md" />
            <Skeleton width="100%" height={40} className="rounded-md" />
          </div>
        ))}
      </div>
    </div>
  </section>
);
