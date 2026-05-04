"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from 'next/dynamic';
import GameBannerCarousel from "./GameBannerCarousel";
import {
  TopNoticeBannerSkeleton,
  FlashSaleSkeleton,
  StorySliderSkeleton,
  TronicsWhoSkeleton,
  HomeServicesSkeleton
} from "./HomeSkeletons";

const TopNoticeBanner = dynamic(() => import("./TopNoticeBanner"), { 
  ssr: false, 
  loading: () => <TopNoticeBannerSkeleton /> 
});
const ScrollingNoticeBand = dynamic(() => import("./ScrollingNoticeBand"), { ssr: false });
const GamesPage = dynamic(() => import("@/app/games/page"), { ssr: false });
const FlashSale = dynamic(() => import("./FlashSale"), { 
  ssr: false,
  loading: () => <FlashSaleSkeleton />
});
const StorySlider = dynamic(() => import("./StorySlider"), { 
  ssr: false,
  loading: () => <StorySliderSkeleton />
});
const HomeQuickActions = dynamic(() => import("./HomeQuickActions"), { ssr: false });
const HomeServices = dynamic(() => import("./HomeServices"), { 
  ssr: false,
  loading: () => <HomeServicesSkeleton />
});
const TronicsWho = dynamic(() => import("./TronicsWho"), { 
  ssr: false,
  loading: () => <TronicsWhoSkeleton />
});
const TrustHighlights = dynamic(() => import("./TrustHighlights"), { ssr: false });
const MLBBPurchaseGuide = dynamic(() => import("../HelpImage/MLBBPurchaseGuide"), { ssr: false });


export default function HeroSection() {
  const [search, setSearch] = useState("");
  const pathname = usePathname();

  const isLive = pathname.startsWith("/anime-live");
  //   const checkBalance = async () => {
  //   const res = await fetch("/api/game/balance");
  //   const data = await res.json();
  //   console.log("FINAL BALANCE:", data);
  // };

  // checkBalance();


  return (
    <>
      <TopNoticeBanner />

      <GameBannerCarousel />

      <FlashSale />

      <StorySlider />
      {/*  <HomeQuickActions />  */}

      <GamesPage />


      <TronicsWho />
      <HomeServices />
      {/* <TrustHighlights /> */}


    </>

  );
}
