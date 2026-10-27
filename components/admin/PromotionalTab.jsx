"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Users,
  Mail,
  Target,
  Plus,
  Search,
  RefreshCcw,
  X,
  Loader2,
  Database,
  Globe,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Type,
  Eye,
  Check,
  RotateCcw,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import Skeleton from "../Skeleton";

export default function PromotionalTab() {
  const [stats, setStats] = useState({
    mailsToday: 0,
    totalReach: 0,
    external: 0,
    database: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const [recipients, setRecipients] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [recipientType, setRecipientType] = useState("all"); // all, user, member, admin, owner, external

  const [externalEmail, setExternalEmail] = useState("");
  const [externalEmails, setExternalEmails] = useState([]);

  const [composer, setComposer] = useState({
    subject: "",
    headerTitle: "",
    bannerUrl: "",
    body: "",
  });

  const [sending, setSending] = useState(false);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState("recipients"); // recipients, composer, history
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  // 300ms debounce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchStats();
    fetchCampaigns();
  }, []);

  useEffect(() => {
    fetchRecipients();
  }, [debouncedSearch, recipientType]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/promotional/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Fetch stats failed", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRecipients = async () => {
    try {
      setLoadingRecipients(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        limit: "5000",
        search: debouncedSearch,
        userType: recipientType === "all" ? "" : recipientType,
      });
      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRecipients(data.data || []);
        setStats(prev => ({ ...prev, database: data.pagination?.total || 0 }));
      }
    } catch (err) {
      console.error("Fetch recipients failed", err);
    } finally {
      setLoadingRecipients(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/promotional/campaigns", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRecentCampaigns(data.data || []);
      }
    } catch (err) {
      console.error("Fetch campaigns failed", err);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const toggleRecipient = (email) => {
    if (selectedRecipients.includes(email)) {
      setSelectedRecipients(selectedRecipients.filter(e => e !== email));
    } else {
      setSelectedRecipients([...selectedRecipients, email]);
    }
  };

  const toggleSelectAll = () => {
    const allEmails = recipients.map(r => r.email);
    const allCurrentSelected = allEmails.every(e => selectedRecipients.includes(e));

    if (allCurrentSelected && allEmails.length > 0) {
      // Deselect currently visible
      setSelectedRecipients(selectedRecipients.filter(e => !allEmails.includes(e)));
    } else {
      // Select all currently visible
      const combined = Array.from(new Set([...selectedRecipients, ...allEmails]));
      setSelectedRecipients(combined);
    }
  };

  const clearAllSelected = () => {
    setSelectedRecipients([]);
  };

  const addExternalEmail = () => {
    const trimmed = externalEmail.trim();
    if (!trimmed) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatusMessage({ type: "error", text: "Invalid email format" });
      setTimeout(() => setStatusMessage({ type: "", text: "" }), 3000);
      return;
    }

    if (!externalEmails.includes(trimmed)) {
      setExternalEmails([...externalEmails, trimmed]);
      if (!selectedRecipients.includes(trimmed)) {
        setSelectedRecipients([...selectedRecipients, trimmed]);
      }
      setExternalEmail("");
      setStats(prev => ({ ...prev, external: externalEmails.length + 1 }));
      setStatusMessage({ type: "success", text: `Added ${trimmed}` });
      setTimeout(() => setStatusMessage({ type: "", text: "" }), 3000);
    } else {
      setStatusMessage({ type: "error", text: "Email already added" });
      setTimeout(() => setStatusMessage({ type: "", text: "" }), 3000);
    }
  };

  const removeExternalEmail = (email) => {
    setExternalEmails(externalEmails.filter(e => e !== email));
    setSelectedRecipients(selectedRecipients.filter(e => e !== email));
    setStats(prev => ({ ...prev, external: Math.max(0, externalEmails.length - 1) }));
  };

  const handleSend = async () => {
    if (!composer.subject.trim() || !composer.body.trim()) {
      setStatusMessage({ type: "error", text: "Subject and message body are required" });
      setTimeout(() => setStatusMessage({ type: "", text: "" }), 3500);
      return;
    }
    if (selectedRecipients.length === 0) {
      setStatusMessage({ type: "error", text: "Please select at least one recipient" });
      setTimeout(() => setStatusMessage({ type: "", text: "" }), 3500);
      return;
    }

    try {
      setSending(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/promotional/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...composer,
          recipients: selectedRecipients,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: "success", text: `Campaign launched to ${selectedRecipients.length} recipients!` });
        fetchCampaigns();
        fetchStats();
        setShowPreview(false);
        setTimeout(() => setStatusMessage({ type: "", text: "" }), 4000);
      } else {
        setStatusMessage({ type: "error", text: data.message || "Failed to send emails" });
        setTimeout(() => setStatusMessage({ type: "", text: "" }), 4000);
      }
    } catch (err) {
      console.error("Send failed", err);
      setStatusMessage({ type: "error", text: "An error occurred while sending" });
      setTimeout(() => setStatusMessage({ type: "", text: "" }), 4000);
    } finally {
      setSending(false);
    }
  };

  const allVisibleSelected = useMemo(() => {
    if (recipients.length === 0) return false;
    return recipients.every(r => selectedRecipients.includes(r.email));
  }, [recipients, selectedRecipients]);

  return (
    <div className="space-y-3.5 sm:space-y-4 pb-10">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)] truncate flex items-center gap-2">
            <Mail size={18} className="text-[var(--accent)] shrink-0" />
            Promotional Hub
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5 truncate">
            Compose and broadcast email promotions to targeted customer segments
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
            <Target size={13} className="text-[var(--accent)]" />
            <span>{stats.totalReach} Reach</span>
          </div>
          <button
            onClick={() => { fetchStats(); fetchCampaigns(); fetchRecipients(); }}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] active:scale-95 transition-all outline-none cursor-pointer"
            title="Refresh All"
          >
            <RefreshCcw size={14} className={loadingRecipients || loadingStats ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ================= COMPACT STATS STRIP ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatPill
          icon={<Send className="text-emerald-500" size={15} />}
          label="SENT TODAY"
          value={stats.mailsToday}
        />
        <StatPill
          icon={<Target className="text-amber-500" size={15} />}
          label="TOTAL REACH"
          value={stats.totalReach}
        />
        <StatPill
          icon={<Globe className="text-sky-500" size={15} />}
          label="EXTERNAL"
          value={stats.external}
        />
        <StatPill
          icon={<Database className="text-purple-500" size={15} />}
          label="DATABASE"
          value={stats.database}
        />
      </div>

      {/* ================= STATUS BANNER ================= */}
      <AnimatePresence>
        {statusMessage.text && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border text-xs font-semibold ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-500 border-rose-500/20"
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage({ type: "", text: "" })}
              className="p-1 hover:opacity-70 transition-opacity"
            >
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MOBILE TAB SWITCHER ================= */}
      <div className="flex sm:hidden p-1 bg-[var(--card)]/80 border border-[var(--border)] rounded-xl gap-1">
        <button
          type="button"
          onClick={() => setActiveMobileTab("recipients")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
            activeMobileTab === "recipients"
              ? "bg-[var(--accent)] text-black shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Users size={13} />
          <span>Recipients</span>
          {selectedRecipients.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-black/20 text-[10px] flex items-center justify-center font-black">
              {selectedRecipients.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveMobileTab("composer")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
            activeMobileTab === "composer"
              ? "bg-[var(--accent)] text-black shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Mail size={13} />
          <span>Composer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMobileTab("history")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
            activeMobileTab === "history"
              ? "bg-[var(--accent)] text-black shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Clock size={13} />
          <span>History</span>
        </button>
      </div>

      {/* ================= MAIN WORKSPACE GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-start">
        {/* ================= LEFT: RECIPIENTS PANEL ================= */}
        <div className={`lg:col-span-5 space-y-2.5 ${activeMobileTab !== "recipients" ? "hidden sm:block" : ""}`}>
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)]">
                Recipients
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
                {selectedRecipients.length} Selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              {selectedRecipients.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllSelected}
                  className="text-[11px] font-bold text-rose-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                >
                  <X size={11} />
                  <span>Clear</span>
                </button>
              )}
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-[11px] font-extrabold text-[var(--accent)] hover:underline uppercase cursor-pointer"
              >
                {allVisibleSelected ? "Deselect All" : `Select All (${recipients.length})`}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 space-y-2.5">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: "all", label: "All" },
                { id: "user", label: "User" },
                { id: "admin", label: "Admin" },
                { id: "owner", label: "Owner" },
                { id: "external", label: "External" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setRecipientType(item.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight transition-all cursor-pointer ${
                    recipientType === item.id
                      ? "bg-[var(--accent)] text-black shadow-sm"
                      : "bg-[var(--foreground)]/[0.04] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.08]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Continuous Search Capsule */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
              <input
                type="text"
                placeholder="Search recipients by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8.5 pl-8 pr-7 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/20 outline-none transition-all placeholder:text-[var(--muted)]/50"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] p-0.5 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Add External Email Row */}
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <Plus size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
                <input
                  type="email"
                  placeholder="Add custom email..."
                  value={externalEmail}
                  onChange={(e) => setExternalEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addExternalEmail()}
                  className="w-full h-8 pl-8 pr-2.5 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 outline-none transition-all placeholder:text-[var(--muted)]/50"
                />
              </div>
              <button
                type="button"
                onClick={addExternalEmail}
                className="px-3 h-8 rounded-lg bg-[var(--accent)] text-black text-xs font-extrabold uppercase hover:brightness-105 active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                Add
              </button>
            </div>

            {/* Recipient Count Bar */}
            <div className="flex items-center justify-between text-[10px] font-bold text-[var(--muted)] px-0.5 pt-0.5 border-t border-[var(--border)]/60">
              <span>Showing {recipients.length} of {stats.database} database records</span>
              {externalEmails.length > 0 && (
                <span className="text-sky-500 font-extrabold">{externalEmails.length} custom</span>
              )}
            </div>

            {/* Recipients List */}
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
              {loadingRecipients ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] animate-pulse" />
                ))
              ) : (
                <>
                  {externalEmails.map((email) => (
                    <RecipientRow
                      key={email}
                      name="External"
                      email={email}
                      tag="external"
                      selected={selectedRecipients.includes(email)}
                      onToggle={() => toggleRecipient(email)}
                      onDelete={() => removeExternalEmail(email)}
                    />
                  ))}
                  {recipients.map((user) => (
                    <RecipientRow
                      key={user._id || user.email}
                      name={user.name || "Customer"}
                      email={user.email}
                      tag={user.userType || "user"}
                      selected={selectedRecipients.includes(user.email)}
                      onToggle={() => toggleRecipient(user.email)}
                    />
                  ))}
                  {!recipients.length && !externalEmails.length && (
                    <div className="py-8 text-center text-[var(--muted)] text-xs font-semibold">
                      No recipients matching filter
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Mobile Jump to Composer Button */}
            {selectedRecipients.length > 0 && (
              <div className="pt-1 block sm:hidden">
                <button
                  type="button"
                  onClick={() => setActiveMobileTab("composer")}
                  className="w-full flex items-center justify-center gap-1.5 bg-[var(--accent)] text-black py-2 rounded-xl text-xs font-extrabold shadow-sm active:scale-95 transition-all"
                >
                  <span>Proceed with {selectedRecipients.length} Selected</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT: COMPOSER & HISTORY ================= */}
        <div className={`lg:col-span-7 space-y-3.5 sm:space-y-4 ${activeMobileTab === "recipients" ? "hidden sm:block" : ""}`}>
          {/* Email Composer Box */}
          <div className={`space-y-2.5 ${activeMobileTab === "history" ? "hidden sm:block" : ""}`}>
            <div className="flex items-center justify-between px-0.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                <Mail size={13} className="text-[var(--accent)]" />
                Email Composer
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/50 text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-all cursor-pointer"
                >
                  <Eye size={12} />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 space-y-3">
              {/* Selected Target Notification inside composer */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--foreground)]/[0.025] border border-[var(--border)] text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Target size={14} className={selectedRecipients.length > 0 ? "text-[var(--accent)] shrink-0" : "text-[var(--muted)] shrink-0"} />
                  <span className="text-[var(--muted)] truncate text-xs">
                    {selectedRecipients.length === 0 ? (
                      <span>No recipients selected yet</span>
                    ) : (
                      <span>
                        Targeting <strong className="text-[var(--foreground)] font-bold">{selectedRecipients.length}</strong> recipient{selectedRecipients.length === 1 ? "" : "s"}
                      </span>
                    )}
                  </span>
                </div>
                {selectedRecipients.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      toggleSelectAll();
                    }}
                    className="text-[11px] font-extrabold text-[var(--accent)] hover:underline shrink-0 cursor-pointer"
                  >
                    Select All ({recipients.length})
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={clearAllSelected}
                    className="text-[11px] font-bold text-rose-500 hover:underline shrink-0 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Subject & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-[var(--muted)] mb-1 block">Subject Line</label>
                  <div className="relative">
                    <Type size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Flash 40% Off Diamonds Weekend!"
                      value={composer.subject}
                      onChange={(e) => setComposer({ ...composer, subject: e.target.value })}
                      className="w-full h-8.5 pl-8 pr-3 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 outline-none transition-all placeholder:text-[var(--muted)]/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[var(--muted)] mb-1 block">Inner Heading (Greeting)</label>
                  <div className="relative">
                    <FileText size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Exclusive Weekend Deal For You"
                      value={composer.headerTitle}
                      onChange={(e) => setComposer({ ...composer, headerTitle: e.target.value })}
                      className="w-full h-8.5 pl-8 pr-3 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 outline-none transition-all placeholder:text-[var(--muted)]/40"
                    />
                  </div>
                </div>
              </div>

              {/* Banner URL */}
              <div>
                <label className="text-[11px] font-semibold text-[var(--muted)] mb-1 block">Banner Image URL (Optional)</label>
                <div className="relative">
                  <ImageIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. https://domain.com/banner.jpg"
                    value={composer.bannerUrl}
                    onChange={(e) => setComposer({ ...composer, bannerUrl: e.target.value })}
                    className="w-full h-8.5 pl-8 pr-3 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 outline-none transition-all font-mono placeholder:text-[var(--muted)]/40"
                  />
                </div>
              </div>

              {/* Message Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-[var(--muted)]">Message Content</label>
                  <span className="text-[10px] font-extrabold text-[var(--muted)]/50 uppercase tracking-wider">
                    HTML SUPPORTED
                  </span>
                </div>
                <textarea
                  placeholder="Type your promotional message here... Use standard text or HTML tags (<p>, <strong>, <a>, <br/>)."
                  value={composer.body}
                  onChange={(e) => setComposer({ ...composer, body: e.target.value })}
                  className="w-full min-h-[130px] p-3 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/20 outline-none resize-y transition-all leading-relaxed custom-scrollbar placeholder:text-[var(--muted)]/40"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="h-10 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--foreground)]/[0.04] text-xs font-bold text-[var(--foreground)] transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-sm cursor-pointer active:scale-95"
                >
                  <Eye size={14} />
                  <span>Preview</span>
                </button>

                {selectedRecipients.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMobileTab("recipients");
                      setStatusMessage({
                        type: "error",
                        text: "Please select recipients from the list to send",
                      });
                      setTimeout(() => setStatusMessage({ type: "", text: "" }), 3000);
                    }}
                    className="h-10 flex-1 px-3 sm:px-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--foreground)]/[0.02] hover:bg-[var(--foreground)]/[0.05] hover:border-[var(--accent)]/50 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Users size={14} className="text-[var(--accent)] shrink-0" />
                    <span className="truncate">Choose Recipients</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--foreground)]/[0.06] text-[var(--muted)] shrink-0">
                      0 selected
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending}
                    className="h-10 flex-1 px-4 rounded-xl bg-[var(--accent)] text-black text-xs font-black shadow-md shadow-[var(--accent)]/15 hover:brightness-105 active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {sending ? (
                      <>
                        <Loader2 size={14} className="animate-spin shrink-0" />
                        <span className="truncate">Broadcasting Campaign...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} className="shrink-0" />
                        <span className="truncate">Send Campaign</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-black/15 text-black text-[10px] font-black shrink-0">
                          {selectedRecipients.length}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* History / Recent Campaigns */}
          <div className={`space-y-2.5 ${activeMobileTab === "composer" ? "hidden sm:block" : ""}`}>
            <div className="flex items-center gap-1.5 px-0.5">
              <Clock size={13} className="text-[var(--accent)]" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)]">
                Campaign History ({recentCampaigns.length})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {loadingCampaigns ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] animate-pulse" />
                ))
              ) : (
                <>
                  {recentCampaigns.map((camp) => (
                    <CampaignCard
                      key={camp._id}
                      campaign={camp}
                      onUseTemplate={() => {
                        setComposer({
                          subject: camp.subject || "",
                          headerTitle: camp.headerTitle || "",
                          bannerUrl: camp.bannerUrl || "",
                          body: camp.body || "",
                        });
                        setActiveMobileTab("composer");
                        setStatusMessage({ type: "success", text: "Loaded campaign template into composer" });
                        setTimeout(() => setStatusMessage({ type: "", text: "" }), 3000);
                      }}
                    />
                  ))}
                  {recentCampaigns.length === 0 && (
                    <div className="col-span-full py-6 text-center text-xs text-[var(--muted)] bg-[var(--card)]/30 rounded-xl border border-[var(--border)] border-dashed">
                      No sent campaigns yet.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= EMAIL PREVIEW MODAL ================= */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full max-w-xl bg-[var(--card)] rounded-t-3xl sm:rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
            >
              {/* Modal Header */}
              <div className="p-3.5 border-b border-[var(--border)] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center">
                    <Eye size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--foreground)]">Email Preview</h4>
                    <p className="text-[10px] text-[var(--muted)] truncate max-w-[240px]">
                      {composer.subject || "No Subject Line"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] transition-all cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Email Content Frame */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-white dark:bg-[#0c0c0c] custom-scrollbar">
                <div className="max-w-md mx-auto space-y-4">
                  {/* Top Branding Mock */}
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center text-black font-black text-xs">
                        T
                      </div>
                      <span className="text-xs font-extrabold uppercase tracking-tight text-neutral-900 dark:text-neutral-100">
                        TopUp Store
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>

                  {/* Banner */}
                  {composer.bannerUrl && (
                    <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 bg-black/5">
                      <img
                        src={composer.bannerUrl}
                        alt="Campaign Banner"
                        className="w-full object-cover max-h-48"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Header Title */}
                  {composer.headerTitle && (
                    <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white leading-snug text-center">
                      {composer.headerTitle}
                    </h3>
                  )}

                  {/* Message Body */}
                  <div
                    className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: composer.body || "<em>No message content yet...</em>" }}
                  />

                  {/* Footer */}
                  <div className="pt-6 border-t border-gray-100 dark:border-white/10 text-center space-y-1 text-[10px] text-neutral-400">
                    <p>You received this promotional message as a registered player.</p>
                    <p className="font-semibold text-[var(--accent)]">Official Top-Up Notification</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3 border-t border-[var(--border)] bg-[var(--card)] flex items-center justify-between shrink-0">
                <span className="text-[11px] font-semibold text-[var(--muted)]">
                  Sending to <strong>{selectedRecipients.length}</strong> recipient{selectedRecipients.length === 1 ? "" : "s"}
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className="px-3.5 py-1.5 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-all cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending || selectedRecipients.length === 0}
                    className="px-4 py-1.5 rounded-xl bg-[var(--accent)] text-black text-xs font-black uppercase hover:brightness-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Confirm & Send"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatPill({ icon, label, value }) {
  return (
    <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 flex items-center gap-2.5">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider truncate">
          {label}
        </p>
        <p className="text-base sm:text-lg font-black text-[var(--foreground)] leading-none mt-0.5">
          {value?.toLocaleString() || 0}
        </p>
      </div>
    </div>
  );
}

function RecipientRow({ name, email, tag, selected, onToggle, onDelete }) {
  return (
    <div
      onClick={onToggle}
      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
        selected
          ? "bg-[var(--accent)]/10 border-[var(--accent)]/40"
          : "bg-[var(--foreground)]/[0.02] border-[var(--border)]/70 hover:border-[var(--border)]"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 ${
            tag === "owner"
              ? "bg-rose-500"
              : tag === "admin"
              ? "bg-amber-500"
              : tag === "external"
              ? "bg-sky-500"
              : "bg-indigo-500"
          }`}
        >
          {name.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-bold text-[var(--foreground)] truncate leading-tight">
              {name}
            </p>
            <span
              className={`text-[8px] font-black uppercase tracking-wider px-1 py-0.2 rounded shrink-0 ${
                tag === "owner"
                  ? "bg-rose-500/15 text-rose-500"
                  : tag === "admin"
                  ? "bg-amber-500/15 text-amber-500"
                  : tag === "external"
                  ? "bg-sky-500/15 text-sky-500"
                  : "bg-[var(--foreground)]/[0.05] text-[var(--muted)]"
              }`}
            >
              {tag}
            </span>
          </div>
          <p className="text-[11px] text-[var(--muted)] truncate leading-tight mt-0.5">
            {email}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded-md text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Remove"
          >
            <Trash2 size={12} />
          </button>
        )}

        <div
          className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-all ${
            selected
              ? "bg-[var(--accent)] border-[var(--accent)] text-black"
              : "border-[var(--border)] bg-[var(--card)]"
          }`}
        >
          {selected && <Check size={11} strokeWidth={3} />}
        </div>
      </div>
    </div>
  );
}

function CampaignCard({ campaign, onUseTemplate }) {
  return (
    <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 hover:bg-[var(--card)] transition-all space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-[var(--foreground)] truncate">
            {campaign.subject || "No Subject"}
          </h4>
          <p className="text-[10px] text-[var(--muted)] font-mono mt-0.5">
            {new Date(campaign.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          type="button"
          onClick={onUseTemplate}
          className="px-2 py-0.5 rounded-md bg-[var(--foreground)]/[0.05] border border-[var(--border)] text-[10px] font-extrabold uppercase hover:bg-[var(--accent)] hover:text-black hover:border-[var(--accent)] transition-all shrink-0 cursor-pointer"
        >
          Use
        </button>
      </div>

      <div className="flex gap-1.5">
        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 uppercase">
          {campaign.sentCount || 0} Sent
        </span>
        {campaign.failedCount > 0 && (
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-500 uppercase">
            {campaign.failedCount} Failed
          </span>
        )}
      </div>

      {campaign.body && (
        <div className="p-2 rounded-lg bg-[var(--foreground)]/[0.02] border border-[var(--border)]/60 line-clamp-2 text-[10px] text-[var(--muted)] leading-snug">
          {campaign.body.replace(/<[^>]*>/g, "")}
        </div>
      )}
    </div>
  );
}
