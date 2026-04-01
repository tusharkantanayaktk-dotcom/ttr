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


export default function AdminPanalPage() {
  const [activeTab, setActiveTab] = useState("users");

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
      <section className="min-h-screen bg-[var(--background)] px-6 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
              Admin Panel
            </h1>
            <p className="text-[10px] text-[var(--muted)]">
              Manage users, orders, transactions, queries & pricing
            </p>
          </div>


          <div className="mb-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">

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


          <div className="mb-4 flex flex-wrap gap-1.5">
            {["users", "orders", "wallet", "transactions", "queries", "pricing", "banners", "settings"].map(
              (tab) => {
                const isActive = activeTab === tab;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                      px-3 py-1
                      rounded-lg
                      text-[10px] font-bold
                      transition-all
                      border
                      ${isActive
                        ? "bg-[var(--accent)] text-black border-[var(--accent)]"
                        : "bg-transparent text-[var(--muted)] border-[var(--border)] hover:border-[var(--muted)]"
                      }
                    `}
                  >
                    {tab.toUpperCase()}
                  </button>
                );
              }
            )}
          </div>



          {/* PANEL */}
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

            {activeTab === "settings" && (
              <SettingsTab />
            )}
          </div>


        </div>
      </section>
    </AdminGuard>
  );
}
