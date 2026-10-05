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
  FiChevronRight,
  FiChevronLeft,
  FiCheck
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
    title: "Overview",
    items: [
      { id: "analytics", label: "Analytics", icon: FiActivity, badge: "Live" }
    ]
  },
  {
    title: "Management",
    items: [
      { id: "users", label: "Users", icon: FiUsers },
      { id: "orders", label: "Orders", icon: FiShoppingBag },
      { id: "wallet", label: "Wallet Deposits", icon: FiCreditCard },
      { id: "transactions", label: "Transactions", icon: FiList },
      { id: "queries", label: "Support Messages", icon: FiMessageSquare },
      { id: "pricing", label: "Game Prices", icon: FiDollarSign },
    ]
  },
  {
    title: "Marketing",
    items: [
      { id: "banners", label: "Banners", icon: FiImage },
      { id: "promotional", label: "Promo Messages", icon: FiSend },
      { id: "flash_sale", label: "Flash Sales", icon: FiZap },
      { id: "announcement", label: "Notice Bar", icon: FiBell },
    ]
  },
  {
    title: "Settings",
    items: [
      { id: "ui_settings", label: "Themes & Design", icon: FiSliders },
      { id: "settings", label: "Store Settings", icon: FiSettings },
      { id: "seo", label: "SEO & Google", icon: FiGlobe },
    ]
  }
];

export default function AdminPanalPage() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("owner_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleSidebarCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("owner_sidebar_collapsed", String(next));
      return next;
    });
  };

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
          <div className="mb-4 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSidebarCollapse}
                className="hidden md:flex items-center justify-center w-7 h-7 bg-[var(--card)] hover:bg-[var(--foreground)]/[0.05] border border-[var(--border)] hover:border-[var(--accent)]/50 rounded-lg text-[var(--foreground)] active:scale-95 transition-all"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label="Toggle sidebar"
              >
                {isCollapsed ? <FiChevronRight className="w-3.5 h-3.5 text-[var(--accent)]" /> : <FiChevronLeft className="w-3.5 h-3.5" />}
              </button>

              <h1 className="text-base sm:text-lg font-black tracking-tight text-[var(--foreground)]">
                Owner Panel
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="md:hidden p-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--foreground)] active:scale-95 transition-transform"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open Menu"
              >
                <FiMenu className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Mobile Overlay Backdrop & Outside Close Button */}
            {isSidebarOpen && (
              <>
                <div 
                  className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] md:hidden transition-opacity"
                  onClick={() => setIsSidebarOpen(false)}
                />
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="fixed top-3.5 left-[290px] max-[360px]:left-auto max-[360px]:right-3 z-[110] md:hidden p-2 bg-[var(--card)] hover:bg-[var(--accent)] hover:text-black rounded-xl border border-[var(--border)] text-[var(--foreground)] shadow-xl active:scale-95 transition-all"
                  aria-label="Close Menu"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </>
            )}

            {/* ================= SIDEBAR ================= */}
            <aside className={`
              fixed md:static top-0 left-0 h-[100dvh] md:h-auto z-[100] md:z-auto
              w-[280px] ${isCollapsed ? "md:w-14" : "md:w-60"} shrink-0 
              bg-[var(--background)] md:bg-transparent
              border-r border-[var(--border)] md:border-none
              p-5 pb-32 md:p-0
              overflow-y-auto md:overflow-visible
              transition-all duration-300 ease-in-out
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
              {/* Mobile Drawer Top */}
              <div className="flex items-center mb-3 md:hidden pb-2.5 border-b border-[var(--border)]">
                <Image src={logo} alt="Logo" width={22} height={22} className="w-5.5 h-5.5 object-contain" />
              </div>

              {/* Account / Provider Balance Card */}
              {isCollapsed ? (
                <div 
                  className="hidden md:flex flex-col items-center justify-center p-2 rounded-lg border border-[var(--border)] bg-[var(--card)]/50 mb-3 relative cursor-pointer hover:border-[var(--accent)]/40 transition-colors"
                  title={`1Game Balance: ${balance !== null ? balance : "Loading…"}`}
                >
                  <FiCreditCard className="text-[var(--accent)] w-3.5 h-3.5" />
                  <FiCheck className="w-2.5 h-2.5 text-emerald-400 mt-1" />
                </div>
              ) : null}

              <div className={`${isCollapsed ? "md:hidden" : "flex"} items-center justify-between p-2.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/50 mb-3 shadow-sm`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--accent)]/20">
                    <FiCreditCard className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] block leading-none">1Game Balance</span>
                    <span className="text-xs font-black text-[var(--foreground)] truncate tracking-tight block mt-0.5">
                      {balance !== null ? balance : "Loading…"}
                    </span>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                  <FiCheck className="w-3 h-3" />
                </div>
              </div>

              {/* Navigation Menu Groups */}
              <div className="space-y-2.5">
                {SIDEBAR_GROUPS.map((group) => (
                  <div key={group.title} className="space-y-0.5">
                    {isCollapsed ? (
                      <div className="hidden md:block my-1.5 border-t border-[var(--border)]/40" />
                    ) : (
                      <h3 className="text-[9px] font-black text-[var(--muted)]/80 uppercase tracking-wider px-2 py-0.5">
                        {group.title}
                      </h3>
                    )}
                    {isCollapsed && (
                      <h3 className="md:hidden text-[9px] font-black text-[var(--muted)]/80 uppercase tracking-wider px-2 py-0.5">
                        {group.title}
                      </h3>
                    )}

                    <div className="flex flex-col gap-0.5">
                      {group.items.map((item) => {
                        const isActive = activeTab === item.id;
                        const Icon = item.icon;

                        return (
                          <button
                            key={item.id}
                            title={item.label}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsSidebarOpen(false);
                            }}
                            className={`
                              w-full flex items-center ${isCollapsed ? "md:justify-center px-2 md:px-0 py-2" : "justify-between px-2.5 py-1.5"}
                              rounded-lg
                              text-xs font-semibold
                              transition-all duration-150 group relative
                              ${isActive
                                ? "bg-[var(--accent)] text-black shadow-sm font-bold"
                                : "bg-transparent text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)]"
                              }
                            `}
                          >
                            <div className={`flex items-center ${isCollapsed ? "md:justify-center gap-2 md:gap-0" : "gap-2"} min-w-0`}>
                              <Icon className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110 ${
                                isActive ? "text-black" : "text-[var(--muted)] group-hover:text-[var(--accent)]"
                              }`} />
                              <span className={`truncate text-xs ${isCollapsed ? "md:hidden" : "block"}`}>{item.label}</span>
                            </div>

                            {item.badge && !isCollapsed && (
                              <span className={`text-[8px] font-black uppercase px-1 py-0.2 rounded ${
                                isActive ? "bg-black/20 text-black" : "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30"
                              }`}>
                                {item.badge}
                              </span>
                            )}

                            {item.badge && isCollapsed && (
                              <>
                                <span className="hidden md:block absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                                <span className={`md:hidden text-[8px] font-black uppercase px-1 py-0.2 rounded ${
                                  isActive ? "bg-black/20 text-black" : "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30"
                                }`}>
                                  {item.badge}
                                </span>
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Return to Storefront */}
                <div className={`pt-1.5 ${isCollapsed ? "block" : "md:hidden"}`}>
                  <Link
                    href="/"
                    title="Visit Storefront"
                    className={`w-full flex items-center ${isCollapsed ? "md:justify-center px-2 md:px-0 py-2" : "justify-between px-2.5 py-1.5"} rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors`}
                  >
                    <div className={`flex items-center ${isCollapsed ? "md:justify-center gap-2 md:gap-0" : "gap-2"}`}>
                      <FiExternalLink className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span className={isCollapsed ? "md:hidden" : "block"}>Visit Storefront</span>
                    </div>
                    <FiChevronRight className={`w-3.5 h-3.5 ${isCollapsed ? "md:hidden" : "block"}`} />
                  </Link>
                </div>
              </div>
            </aside>

            {/* ================= MAIN CONTENT PANEL ================= */}
            <main className="flex-1 min-w-0">
              <div className="w-full">
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
