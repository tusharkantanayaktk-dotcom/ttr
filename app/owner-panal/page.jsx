"use client";

import { useEffect, useState } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import AdminGuard from "@/components/AdminGuard";
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


export default function AdminPanalPage() {
  const [activeTab, setActiveTab] = useState("users");
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
      <section className="min-h-screen bg-[var(--background)] p-4 md:p-6">
        <div className="w-full">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
                Admin Panel
              </h1>
              <p className="text-[10px] text-[var(--muted)]">
                Manage users, orders, transactions, queries & pricing
              </p>
            </div>
            
            <button 
              className="md:hidden p-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] active:scale-95 transition-transform"
              onClick={() => setIsSidebarOpen(true)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          </div>


          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Mobile Overlay */}
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* SIDEBAR */}
            <aside className={`
              fixed md:static top-0 left-0 h-[100dvh] md:h-auto z-[100] md:z-auto
              w-[280px] md:w-64 shrink-0 
              bg-[var(--background)] md:bg-transparent
              border-r border-[var(--border)] md:border-none
              p-6 pb-32 md:p-0
              overflow-y-auto md:overflow-visible
              transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
              <div className="flex items-center justify-between mb-6 md:hidden">
                <h2 className="font-bold text-lg bg-[var(--background)] px-2">Menu</h2>
                <button type="button" onClick={() => setIsSidebarOpen(false)} className="p-2 bg-[var(--card)] hover:bg-[var(--accent)] hover:text-black rounded-lg border border-[var(--border)] cursor-pointer z-50 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] mb-6">

            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
              Account Balance
            </p>

            <div className="flex items-baseline gap-2">
              <p className="text-xl font-bold text-[var(--foreground)]">
                {balance !== null ? balance : "Loading…"}
              </p>

              <span className="text-[10px] font-medium text-green-500 uppercase">
                Available
              </span>
            </div>
          </div>


              <div className="space-y-4">
                {[
                  {
                    title: "Management & Finance",
                    tabs: ["users", "orders", "wallet", "transactions", "queries", "pricing"]
                  },
                  {
                    title: "Marketing & Storefront",
                    tabs: ["banners", "promotional", "flash_sale", "announcement"]
                  },
                  {
                    title: "System & Config",
                    tabs: ["ui_settings", "settings", "seo"]
                  }
                ].map(group => (
                  <div key={group.title}>
                    <h3 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2 ml-1">{group.title}</h3>
                    <div className="flex flex-col gap-1">
                      {group.tabs.map(tab => {
                        const isActive = activeTab === tab;

                        return (
                          <button
                            key={tab}
                            onClick={() => {
                              setActiveTab(tab);
                              setIsSidebarOpen(false);
                            }}
                            className={`
                              w-full text-left px-3 py-2
                              rounded-lg
                              text-[10px] font-bold
                              transition-all
                              border
                              ${isActive
                                ? "bg-[var(--accent)] text-black border-[var(--accent)] shadow-md"
                                : "bg-transparent text-[var(--muted)] border-transparent hover:bg-[var(--card)] hover:border-[var(--border)] hover:text-[var(--foreground)]"
                              }
                            `}
                          >
                            {tab.replace("_", " ").toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            {/* MAIN PANEL */}
            <main className="flex-1 min-w-0">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
            {activeTab === "users" && (
              <UsersTab

              />
            )}

            {activeTab === "orders" && (
              <OrdersTab

              />
            )}

            {activeTab === "transactions" && (
              <TransactionsTab />
            )}

            {activeTab === "queries" && (
              <SupportQueriesTab

              />
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
