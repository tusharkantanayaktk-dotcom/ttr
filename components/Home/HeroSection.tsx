"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GamesPage from "@/app/games/page";
import GameBannerCarousel from "./GameBannerCarousel";
import HomeServices from "./HomeServices";
import TrustHighlights from "./TrustHighlights";
import MLBBPurchaseGuide from "../HelpImage/MLBBPurchaseGuide";
import TopNoticeBanner from "./TopNoticeBanner";
import ScrollingNoticeBand from "./ScrollingNoticeBand";
import StorySlider from "./StorySlider";
import HomeQuickActions from "./HomeQuickActions";

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
      <ScrollingNoticeBand />

      <StorySlider />
      <HomeQuickActions />

      <GamesPage />
      <ScrollingNoticeBand />


      <HomeServices />
      <TrustHighlights />


    </>

  );
}
