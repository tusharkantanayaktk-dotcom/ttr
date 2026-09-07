"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiActivity,
  FiUsers,
  FiShoppingBag,
  FiCreditCard,
  FiList,
  FiMessageSquare,
  FiDollarSign,
  FiImage,
  FiSend,
  FiZap,
  FiBell,
  FiSliders,
  FiSettings,
  FiGlobe,
  FiX,
  FiMenu,
  FiExternalLink,
  FiChevronRight
} from "react-icons/fi";

import logo from "@/public/logo.png";
import AdminGuard from "@/components/AdminGuard";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import UsersTab from "@/components/admin/UsersTab";
import OrdersTab from "@/components/admin/OrdersTab";
import PricingTab from "@/components/admin/PricingTab";
import TransactionsTab from "@/components/admin/TransactionsTab";
import SupportQueriesTab from "@/components/admin/SupportQueriesTab";
import BannersTab from "@/components/admin/BannersTab";
import WalletTab from "@/components/admin/WalletTab";
import SettingsTab from "@/components/admin/SettingsTab";
import PromotionalTab from "@/components/admin/PromotionalTab";
import SeoTab from "@/components/admin/SeoTab";
import NoticeBannerTab from "@/components/admin/NoticeBannerTab";
import FlashSaleTab from "@/components/admin/FlashSaleTab";
import UiSettingsTab from "@/components/admin/UiSettingsTab";

const SIDEBAR_GROUPS = [
  {
    title: "Overview & Intelligence",
    items: [
      { id: "analytics", label: "Analytics & Insights", icon: FiActivity, badge: "Live" }
    ]
  },
  {
    title: "Management & Finance",
    items: [
      { id: "users", label: "User Accounts", icon: FiUsers },
      { id: "orders", label: "Orders & Top-ups", icon: FiShoppingBag },
      { id: "wallet", label: "Wallet Deposits", icon: FiCreditCard },
      { id: "transactions", label: "Transactions Log", icon: FiList },
      { id: "queries", label: "Support Queries", icon: FiMessageSquare },
      { id: "pricing", label: "Pricing & Margins", icon: FiDollarSign },
    ]
  },
  {
    title: "Marketing & Growth",
    items: [
      { id: "banners", label: "Game Banners", icon: FiImage },
      { id: "promotional", label: "Marketing Campaigns", icon: FiSend },
      { id: "flash_sale", label: "Flash Sales", icon: FiZap },
      { id: "announcement", label: "Notice Announcement", icon: FiBell },
    ]
  },
  {
    title: "System & Storefront",
    items: [
      { id: "ui_settings", label: "UI & Theme Settings", icon: FiSliders },
      { id: "settings", label: "Maintenance & Mode", icon: FiSettings },
      { id: "seo", label: "SEO & Search Engine", icon: FiGlobe },
    ]
  }
];

export default function AdminPanalPage() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [queries, setQueries] = useState([]);
  const [balance, setBalance] = useState(null);
  const [banners, setBanners] = useState([]);

  /* ================= TABLE CONTROLS ================= */
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  /* ================= PRICING STATE ================= */
  const [pricingType, setPricingType] = useState("admin");
  const [slabs, setSlabs] = useState([{ min: 0, max: 100, percent: 0 }]);
  const [overrides, setOverrides] = useState([]);
  const [savingPricing, setSavingPricing] = useState(false);

  /* ================= HELPERS ================= */
  const normalizeSlabs = (list) =>
    [...list].sort((a, b) => a.min - b.min);

  const resetControls = () => {
    setSearch("");
    setPage(1);
  };

  /* ================= FETCH BALANCE ================= */
  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/game/balance");
      const data = await res.json();
      if (data.success) {
        setBalance(data?.balance?.data?.balance ?? data.balance);
      }
    } catch (err) {
      console.error("Balance fetch failed", err);
    }
  };

  const fetchBanners = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/banners/game-banners", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setBanners(data.data || []);
  };

  /* ================= FETCH PRICING ================= */
  const fetchPricing = async (type) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/admin/pricing?userType=${type}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (data.success) {
      setSlabs(
        data.data?.slabs?.length
          ? data.data.slabs
          : [{ min: 0, max: 0, percent: 0 }]
      );
      setOverrides(data.data?.overrides || []);
    }
  };

  /* ================= SAVE PRICING ================= */
  const savePricing = async () => {
    try {
      setSavingPricing(true);
      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/pricing", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userType: pricingType,
          slabs: normalizeSlabs(slabs),
          overrides,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed");
      } else {
        alert("Pricing updated successfully");
      }
    } finally {
      setSavingPricing(false);
    }
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    fetchBalance();
  }, []);

  useEffect(() => {
    resetControls();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "banners") fetchBanners();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "pricing") fetchPricing(pricingType);
  }, [activeTab, pricingType, page, search]);

  return (
    <AdminGuard>
      <section className="min-h-screen bg-[var(--background)] p-3 sm:p-4 md:p-6">
        <div className="w-full max-w-7xl mx-auto">
          {/* ================= TOP PANEL BAR ================= */}
          <div className="mb-4 flex items-center justify-between bg-[var(--card)]/60 backdrop-blur-md border border-[var(--border)] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
                <Image
                  src={logo}
                  alt="Tronics"
                  width={20}
                  height={20}
                  className="w-5 h-5 object-contain"
                />
              </div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-[var(--foreground)] flex items-center gap-2">
                Owner Panel
                <span className="px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider rounded-md bg-[var(--accent)] text-black">
                  Admin
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)] text-xs font-bold transition-all"
              >
                <span>Storefront</span>
                <FiExternalLink className="w-3.5 h-3.5" />
              </Link>
              
              <button
                className="md:hidden p-2 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] active:scale-95 transition-transform"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open Menu"
              >
                <FiMenu className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Mobile Overlay Backdrop */}
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] md:hidden transition-opacity"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* ================= SIDEBAR ================= */}
            <aside className={`
              fixed md:static top-0 left-0 h-[100dvh] md:h-auto z-[100] md:z-auto
              w-[290px] md:w-72 shrink-0 
              bg-[var(--background)] md:bg-transparent
              border-r border-[var(--border)] md:border-none
              p-5 pb-32 md:p-0
              overflow-y-auto md:overflow-visible
              transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
              {/* Mobile Drawer Top */}
              <div className="flex items-center justify-between mb-5 md:hidden pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Image src={logo} alt="Logo" width={22} height={22} className="w-5.5 h-5.5 object-contain" />
                  <h2 className="font-black text-sm tracking-tight text-[var(--foreground)]">Control Center</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 bg-[var(--card)] hover:bg-[var(--accent)] hover:text-black rounded-lg border border-[var(--border)] transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {/* Account / Provider Balance Card */}
              <div className="p-4 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)] shadow-sm mb-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)]">
                    <FiCreditCard className="text-[var(--accent)] w-3.5 h-3.5" />
                    <span>Provider Balance</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mt-1">
                  <p className="text-xl font-black text-[var(--foreground)] tracking-tight">
                    {balance !== null ? balance : "Loading…"}
                  </p>
                </div>
              </div>

              {/* Navigation Menu Groups */}
              <div className="space-y-4">
                {SIDEBAR_GROUPS.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <h3 className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest px-2 py-1">
                      {group.title}
                    </h3>
                    <div className="flex flex-col gap-1">
                      {group.items.map((item) => {
                        const isActive = activeTab === item.id;
                        const Icon = item.icon;

                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsSidebarOpen(false);
                            }}
                            className={`
                              w-full flex items-center justify-between px-3 py-2.5
                              rounded-xl
                              text-xs font-bold
                              transition-all duration-150 group
                              ${isActive
                                ? "bg-[var(--accent)] text-black shadow-md shadow-[var(--accent)]/20 font-black"
                                : "bg-transparent text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)] border border-transparent hover:border-[var(--border)]"
                              }
                            `}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                                isActive ? "text-black" : "text-[var(--muted)] group-hover:text-[var(--accent)]"
                              }`} />
                              <span className="truncate">{item.label}</span>
                            </div>

                            {item.badge && (
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                                isActive ? "bg-black/20 text-black" : "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30"
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Return to Storefront (Mobile bottom link) */}
                <div className="pt-2 md:hidden">
                  <Link
                    href="/"
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <FiExternalLink className="w-4 h-4 text-[var(--accent)]" />
                      <span>Visit Storefront</span>
                    </div>
                    <FiChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* ================= MAIN CONTENT PANEL ================= */}
            <main className="flex-1 min-w-0">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 shadow-sm">
                {activeTab === "analytics" && (
                  <AnalyticsTab />
                )}

                {activeTab === "users" && (
                  <UsersTab />
                )}

                {activeTab === "orders" && (
                  <OrdersTab />
                )}

                {activeTab === "transactions" && (
                  <TransactionsTab />
                )}

                {activeTab === "queries" && (
                  <SupportQueriesTab />
                )}

                {activeTab === "banners" && (
                  <BannersTab banners={banners} onRefresh={fetchBanners} />
                )}

                {activeTab === "wallet" && (
                  <WalletTab />
                )}

                {activeTab === "pricing" && (
                  <PricingTab
                    pricingType={pricingType}
                    setPricingType={setPricingType}
                    slabs={slabs}
                    setSlabs={setSlabs}
                    overrides={overrides}
                    setOverrides={setOverrides}
                    savingPricing={savingPricing}
                    onSave={savePricing}
                  />
                )}

                {activeTab === "promotional" && (
                  <PromotionalTab />
                )}

                {activeTab === "announcement" && (
                  <NoticeBannerTab />
                )}

                {activeTab === "ui_settings" && (
                  <UiSettingsTab />
                )}

                {activeTab === "settings" && (
                  <SettingsTab />
                )}

                {activeTab === "seo" && (
                  <SeoTab />
                )}

                {activeTab === "flash_sale" && (
                  <FlashSaleTab />
                )}
              </div>
            </main>
          </div>
        </div>
      </section>
    </AdminGuard>
  );
}
