"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Users,
  Mail,
  Target,
  Plus,
  Search,
  RefreshCcw,
  Tag,
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
  const [recipientType, setRecipientType] = useState("all"); // all, user, member, admin, owner, external
  const [tagFilter, setTagFilter] = useState("");

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

  useEffect(() => {
    fetchStats();
    fetchCampaigns();
  }, []);

  useEffect(() => {
    fetchRecipients();
  }, [search, recipientType, tagFilter]);

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
        limit: 5000,
        search,
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

  const selectAll = () => {
    const allEmails = recipients.map(r => r.email);
    const combined = Array.from(new Set([...selectedRecipients, ...allEmails]));
    setSelectedRecipients(combined);
  };

  const addExternalEmail = () => {
    if (externalEmail && !externalEmails.includes(externalEmail)) {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(externalEmail)) {
        setExternalEmails([...externalEmails, externalEmail]);
        setSelectedRecipients([...selectedRecipients, externalEmail]);
        setExternalEmail("");
        setStats(prev => ({ ...prev, external: externalEmails.length + 1 }));
      } else {
        alert("Invalid email format");
      }
    }
  };

  const removeExternalEmail = (email) => {
    setExternalEmails(externalEmails.filter(e => e !== email));
    setSelectedRecipients(selectedRecipients.filter(e => e !== email));
    setStats(prev => ({ ...prev, external: externalEmails.length - 1 }));
  };

  const handleSend = async () => {
    if (!composer.subject || !composer.body) {
      alert("Subject and body are required");
      return;
    }
    if (selectedRecipients.length === 0) {
      alert("Please select at least one recipient");
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
        alert("Campaign started successfully!");
        fetchCampaigns();
        fetchStats();
        setShowPreview(false);
      } else {
        alert(data.message || "Failed to send emails");
      }
    } catch (err) {
      console.error("Send failed", err);
      alert("An error occurred");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4 pb-10">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Promotional Hub</h2>
          <p className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest mt-0.5">
            Advanced audience segmentation & automated delivery
          </p>
        </div>
        <button
          onClick={() => { fetchStats(); fetchCampaigns(); fetchRecipients(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--foreground)]/[0.03] text-[var(--muted)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-black hover:border-[var(--accent)] transition-all text-[10px] font-black uppercase"
        >
          <RefreshCcw size={12} />
          SYNC
        </button>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Send className="text-emerald-500" size={16} />}
          label="SENT TODAY"
          value={stats.mailsToday}
          color="emerald"
        />
        <StatCard
          icon={<Target className="text-orange-500" size={16} />}
          label="REACH"
          value={stats.totalReach}
          color="orange"
        />
        <StatCard
          icon={<Globe className="text-blue-500" size={16} />}
          label="EXTERNAL"
          value={stats.external}
          color="blue"
        />
        <StatCard
          icon={<Database className="text-purple-500" size={16} />}
          label="DATABASE"
          value={stats.database}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ================= RECIPIENTS SECTION ================= */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black flex items-center gap-2 text-[var(--foreground)] uppercase tracking-wider">
              <Users size={14} className="text-[var(--accent)]" />
              Recipients ({selectedRecipients.length})
            </h3>
            <button onClick={selectAll} className="text-[9px] font-black text-[var(--accent)] hover:underline uppercase">
              SELECT ALL
            </button>
          </div>

          <div className="p-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {["all", "user", "admin", "owner", "external"].map((type) => (
                <button
                  key={type}
                  onClick={() => { setRecipientType(type); }}
                  className={`px-2 py-1 rounded-md text-[9px] font-black uppercase transition-all border ${
                    recipientType === type
                      ? "bg-[var(--accent)] text-black border-[var(--accent)]"
                      : "bg-[var(--foreground)]/[0.03] text-[var(--muted)] border-[var(--border)]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Plus size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="email"
                  placeholder="External Gmail..."
                  value={externalEmail}
                  onChange={(e) => setExternalEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addExternalEmail()}
                  className="w-full h-8 pl-9 pr-3 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[11px] focus:border-[var(--accent)] outline-none"
                />
              </div>
              <button
                onClick={addExternalEmail}
                className="px-3 rounded-lg bg-sky-500 text-white text-[10px] font-black uppercase shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
              >
                Add
              </button>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); }}
                className="w-full h-8 pl-9 pr-3 rounded-lg bg-transparent border-b border-[var(--border)] text-[11px] focus:border-[var(--accent)] outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              <div className="flex items-center justify-between text-[8px] font-black text-[var(--muted)] uppercase px-1 pb-1">
                <span>{recipients.length} of {stats.database} records</span>
              </div>

              {loadingRecipients ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] animate-pulse" />
                ))
              ) : (
                <>
                  {externalEmails.map((email) => (
                    <RecipientItem
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
                    <RecipientItem
                      key={user._id}
                      name={user.name}
                      email={user.email}
                      tag={user.userType}
                      selected={selectedRecipients.includes(user.email)}
                      onToggle={() => toggleRecipient(user.email)}
                    />
                  ))}
                  {!recipients.length && !externalEmails.length && (
                    <div className="py-6 text-center text-[var(--muted)] text-[10px] font-bold uppercase">No results</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ================= COMPOSER SECTION ================= */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black flex items-center gap-2 text-[var(--foreground)] uppercase tracking-wider">
              <Mail size={14} className="text-[var(--accent)]" />
              Email Composer
            </h3>
          </div>

          <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-[var(--muted)] uppercase ml-1">Subject</label>
                <div className="relative">
                  <Type size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type="text"
                    placeholder="Subject line..."
                    value={composer.subject}
                    onChange={(e) => setComposer({ ...composer, subject: e.target.value })}
                    className="w-full h-9 pl-10 pr-3 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[12px] focus:border-[var(--accent)] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-[var(--muted)] uppercase ml-1">Body Header</label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type="text"
                    placeholder="Title inside email..."
                    value={composer.headerTitle}
                    onChange={(e) => setComposer({ ...composer, headerTitle: e.target.value })}
                    className="w-full h-9 pl-10 pr-3 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[12px] focus:border-[var(--accent)] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-[var(--muted)] uppercase ml-1">Banner URL</label>
                <div className="relative">
                  <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type="text"
                    placeholder="Image URL..."
                    value={composer.bannerUrl}
                    onChange={(e) => setComposer({ ...composer, bannerUrl: e.target.value })}
                    className="w-full h-9 pl-10 pr-3 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[12px] focus:border-[var(--accent)] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 flex flex-col">
              <div className="space-y-1.5 flex-1 flex flex-col">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[9px] font-black text-[var(--muted)] uppercase">Message</label>
                  <span className="text-[8px] font-black text-[var(--muted)]/40 uppercase">HTML SUPPORTED</span>
                </div>
                <textarea
                  placeholder="Type message content..."
                  value={composer.body}
                  onChange={(e) => setComposer({ ...composer, body: e.target.value })}
                  className="w-full flex-1 min-h-[120px] p-3 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[12px] focus:border-[var(--accent)] outline-none resize-none custom-scrollbar"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex-1 h-10 rounded-lg bg-[var(--foreground)]/[0.05] border border-[var(--border)] text-[10px] font-black uppercase tracking-wider hover:bg-[var(--foreground)]/[0.1] transition-all"
                >
                  Preview
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || selectedRecipients.length === 0}
                  className={`flex-[2] h-10 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                    sending
                      ? "bg-[var(--foreground)]/[0.05] text-[var(--muted)] cursor-not-allowed"
                      : "bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/10 hover:brightness-110 active:scale-[0.98]"
                  }`}
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {sending ? "Sending..." : `Send to ${selectedRecipients.length} Users`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RECENT CAMPAIGNS ================= */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-[var(--accent)]" />
          <h3 className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-wider">History</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {loadingCampaigns ? (
             Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] animate-pulse" />
            ))
          ) : (
            <>
              {recentCampaigns.map((camp) => (
                <CampaignCard key={camp._id} campaign={camp} onUseTemplate={() => setComposer({
                  subject: camp.subject,
                  headerTitle: camp.headerTitle,
                  bannerUrl: camp.bannerUrl,
                  body: camp.body,
                })} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* ================= PREVIEW MODAL ================= */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[var(--card)] rounded-3xl border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                    <Mail size={16} className="text-[var(--accent)]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-[var(--muted)]">Campaign Preview</h4>
                    <p className="text-sm font-bold text-[var(--foreground)] line-clamp-1">{composer.subject || "No Subject"}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-xl bg-[var(--foreground)]/[0.05] hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#0a0a0a] custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-6">
                  {/* Email Header Mock */}
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[var(--accent)]" />
                      <span className="text-sm font-black uppercase tracking-tighter dark:text-white">Store Name</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date().toLocaleDateString()}</span>
                  </div>

                  {/* Banner */}
                  {composer.bannerUrl && (
                    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5">
                      <img src={composer.bannerUrl} alt="Banner" className="w-full object-cover max-h-60" />
                    </div>
                  )}

                  {/* Body Title */}
                  {composer.headerTitle && (
                    <h2 className="text-2xl font-black text-center dark:text-white">{composer.headerTitle}</h2>
                  )}

                  {/* Body Content */}
                  <div
                    className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: composer.body || "No content yet..." }}
                  />

                  {/* Footer Mock */}
                  <div className="pt-8 border-t border-gray-100 dark:border-white/5 text-center space-y-2">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">You received this because you are a valued user.</p>
                    <button className="text-[9px] font-black text-[var(--accent)] uppercase hover:underline">Unsubscribe</button>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[var(--border)] bg-[var(--foreground)]/[0.02] flex items-center justify-between shrink-0">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase">
                  Sending to {selectedRecipients.length} recipients
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-[var(--foreground)]/[0.05] transition-all"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sending || selectedRecipients.length === 0}
                    className="px-6 py-2 rounded-lg bg-[var(--accent)] text-black text-[10px] font-black uppercase shadow-lg shadow-[var(--accent)]/20 active:scale-95 transition-all"
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

function StatCard({ icon, label, value, color }) {
  const colors = {
    emerald: "from-emerald-500/10 to-transparent border-emerald-500/10",
    orange: "from-orange-500/10 to-transparent border-orange-500/10",
    blue: "from-blue-500/10 to-transparent border-blue-500/10",
    purple: "from-purple-500/10 to-transparent border-purple-500/10",
  };

  return (
    <div className={`p-3 rounded-2xl border bg-gradient-to-br ${colors[color]} bg-[var(--card)] flex items-center gap-3`}>
      <div className="h-8 w-8 rounded-lg bg-[var(--foreground)]/[0.05] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest truncate">{label}</p>
        <p className="text-lg font-black text-[var(--foreground)] leading-none mt-0.5">{value?.toLocaleString()}</p>
      </div>
    </div>
  );
}

function RecipientItem({ name, email, tag, selected, onToggle, onDelete }) {
  return (
    <div
      onClick={onToggle}
      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
        selected
          ? "bg-[var(--accent)]/[0.05] border-[var(--accent)]/30"
          : "bg-[var(--foreground)]/[0.02] border-[var(--border)] hover:border-[var(--muted)]/30"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0 ${
          tag === "owner" ? "bg-rose-500" :
          tag === "admin" ? "bg-amber-500" :
          tag === "external" ? "bg-sky-500" : "bg-indigo-500"
        }`}>
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black text-[var(--foreground)] truncate leading-tight">{name}</p>
          <p className="text-[9px] text-[var(--muted)] truncate leading-tight">{email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-md text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 size={12} />
          </button>
        )}
        <div className={`h-4 w-4 rounded-md border flex items-center justify-center transition-all ${
          selected ? "bg-[var(--accent)] border-[var(--accent)] text-black" : "border-[var(--border)]"
        }`}>
          {selected && <CheckCircle2 size={12} />}
        </div>
      </div>
    </div>
  );
}

function CampaignCard({ campaign, onUseTemplate }) {
  return (
    <div className="p-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/30 transition-all space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-[10px] font-black text-[var(--foreground)] uppercase truncate">{campaign.subject}</h4>
          <p className="text-[8px] text-[var(--muted)] font-bold">{new Date(campaign.createdAt).toLocaleDateString()}</p>
        </div>
        <button
          onClick={onUseTemplate}
          className="px-2 py-1 rounded-md bg-[var(--foreground)]/[0.05] border border-[var(--border)] text-[8px] font-black uppercase hover:bg-[var(--accent)] hover:text-black hover:border-[var(--accent)] transition-all shrink-0"
        >
          USE
        </button>
      </div>

      <div className="flex gap-1.5">
        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 uppercase">{campaign.sentCount} OK</span>
        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-500 uppercase">{campaign.failedCount} ERR</span>
      </div>

      <div className="p-2 rounded-lg bg-[var(--foreground)]/[0.02] border border-[var(--border)] line-clamp-2 text-[9px] text-[var(--muted)] leading-tight italic">
        {campaign.body}
      </div>
    </div>
  );
}


