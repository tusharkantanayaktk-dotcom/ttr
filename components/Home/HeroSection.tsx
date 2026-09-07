"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import {
  TopNoticeBannerSkeleton,
  GameBannerCarouselSkeleton,
  FlashSaleSkeleton,
  StorySliderSkeleton,
  GamesPageSkeleton,
  HomeServicesSkeleton,
} from "./HomeSkeletons";

const TopNoticeBanner = dynamic(() => import("./TopNoticeBanner"), {
  ssr: false,
  loading: () => <TopNoticeBannerSkeleton />,
});
const GameBannerCarousel = dynamic(() => import("./GameBannerCarousel"), {
  ssr: false,
  loading: () => <GameBannerCarouselSkeleton />,
});
const GamesPage = dynamic(() => import("@/app/games/page"), {
  ssr: false,
  loading: () => <GamesPageSkeleton />,
});
const FlashSale = dynamic(() => import("./FlashSale"), {
  ssr: false,
  loading: () => <FlashSaleSkeleton />,
});
const StorySlider = dynamic(() => import("./StorySlider"), {
  ssr: false,
  loading: () => <StorySliderSkeleton />,
});
const HomeServices = dynamic(() => import("./HomeServices"), {
  ssr: false,
  loading: () => <HomeServicesSkeleton />,
});
const CommunityPopup = dynamic(() => import("./CommunityPopup"), { ssr: false });

export default function HeroSection() {
  const [search, setSearch] = useState("");
  const pathname = usePathname();

  return (
    <>
      <CommunityPopup />
      <TopNoticeBanner />
      <GameBannerCarousel />
      <FlashSale />
      <StorySlider />
      <GamesPage />
      <HomeServices />
    </>
  );
}
