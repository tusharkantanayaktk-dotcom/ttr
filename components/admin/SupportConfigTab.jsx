"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  MessageCircle,
  Save,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Sparkles,
  Share2,
  Headphones,
  Send,
  HelpCircle,
  ShieldCheck,
  Check
} from "lucide-react";
import {
  FaWhatsapp,
  FaInstagram,
  FaYoutube,
  FaDiscord,
  FaXTwitter,
  FaEnvelope,
  FaPhoneAlt
} from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_SUPPORT_CONFIG, sanitizePhone } from "@/lib/config";
import { updateSupportConfigCache } from "@/lib/useSupportConfig";

export default function SupportConfigTab() {
  const [formData, setFormData] = useState({
    email: DEFAULT_SUPPORT_CONFIG.email || "",
    phone: DEFAULT_SUPPORT_CONFIG.phone || "",
    whatsappNumber: DEFAULT_SUPPORT_CONFIG.whatsappNumber || "",
    whatsappUrl: DEFAULT_SUPPORT_CONFIG.whatsappUrl || "",
    whatsappChannelUrl: DEFAULT_SUPPORT_CONFIG.whatsappChannelUrl || "",
    instagramUrl: DEFAULT_SUPPORT_CONFIG.instagramUrl || "",
    instagramLabel: DEFAULT_SUPPORT_CONFIG.instagramLabel || "",
    youtubeUrl: DEFAULT_SUPPORT_CONFIG.youtubeUrl || "",
    youtubeLabel: DEFAULT_SUPPORT_CONFIG.youtubeLabel || "",
    discordUrl: DEFAULT_SUPPORT_CONFIG.discordUrl || "",
    twitterUrl: DEFAULT_SUPPORT_CONFIG.twitterUrl || "",
    developerWhatsappUrl: DEFAULT_SUPPORT_CONFIG.developerWhatsappUrl || "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success && data.data && data.data.SUPPORT_CONFIG) {
        const saved = data.data.SUPPORT_CONFIG;
        setFormData({
          email: saved.email || DEFAULT_SUPPORT_CONFIG.email || "",
          phone: saved.phone || DEFAULT_SUPPORT_CONFIG.phone || "",
          whatsappNumber: saved.whatsappNumber || DEFAULT_SUPPORT_CONFIG.whatsappNumber || "",
          whatsappUrl: saved.whatsappUrl || DEFAULT_SUPPORT_CONFIG.whatsappUrl || "",
          whatsappChannelUrl: saved.whatsappChannelUrl || DEFAULT_SUPPORT_CONFIG.whatsappChannelUrl || "",
          instagramUrl: saved.instagramUrl || DEFAULT_SUPPORT_CONFIG.instagramUrl || "",
          instagramLabel: saved.instagramLabel || DEFAULT_SUPPORT_CONFIG.instagramLabel || "",
          youtubeUrl: saved.youtubeUrl || DEFAULT_SUPPORT_CONFIG.youtubeUrl || "",
          youtubeLabel: saved.youtubeLabel || DEFAULT_SUPPORT_CONFIG.youtubeLabel || "",
          discordUrl: saved.discordUrl || DEFAULT_SUPPORT_CONFIG.discordUrl || "",
          twitterUrl: saved.twitterUrl || DEFAULT_SUPPORT_CONFIG.twitterUrl || "",
          developerWhatsappUrl: saved.developerWhatsappUrl || DEFAULT_SUPPORT_CONFIG.developerWhatsappUrl || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch support config", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const autoGenerateWhatsAppUrl = () => {
    const rawNumber = sanitizePhone(formData.whatsappNumber || formData.phone);
    if (!rawNumber) {
      setMessage({ type: "error", text: "Please enter a valid WhatsApp number first." });
      return;
    }
    const generatedUrl = `https://wa.me/${rawNumber}`;
    setFormData((prev) => ({
      ...prev,
      whatsappNumber: rawNumber,
      whatsappUrl: generatedUrl,
    }));
    setMessage({ type: "success", text: `WhatsApp URL updated to: ${generatedUrl}` });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const autoGenerateInstagramUrl = () => {
    const handle = (formData.instagramLabel || "").trim().replace(/^@/, "");
    if (!handle) {
      setMessage({ type: "error", text: "Please enter an Instagram username/handle first." });
      return;
    }
    const generatedUrl = `https://www.instagram.com/${handle}`;
    setFormData((prev) => ({
      ...prev,
      instagramLabel: handle,
      instagramUrl: generatedUrl,
    }));
    setMessage({ type: "success", text: `Instagram URL updated to: ${generatedUrl}` });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const autoGenerateYoutubeUrl = () => {
    const handle = (formData.youtubeLabel || "").trim().replace(/^@/, "");
    if (!handle) {
      setMessage({ type: "error", text: "Please enter a YouTube handle first." });
      return;
    }
    const formattedLabel = `@${handle}`;
    const generatedUrl = `https://www.youtube.com/${formattedLabel}`;
    setFormData((prev) => ({
      ...prev,
      youtubeLabel: formattedLabel,
      youtubeUrl: generatedUrl,
    }));
    setMessage({ type: "success", text: `YouTube URL updated to: ${generatedUrl}` });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      // Clean numbers and URLs
      const cleaned = {
        ...formData,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        whatsappNumber: sanitizePhone(formData.whatsappNumber || formData.phone),
        whatsappUrl: formData.whatsappUrl.trim(),
        whatsappChannelUrl: formData.whatsappChannelUrl.trim(),
        instagramUrl: formData.instagramUrl.trim(),
        instagramLabel: formData.instagramLabel.trim().replace(/^@/, ""),
        youtubeUrl: formData.youtubeUrl.trim(),
        youtubeLabel: formData.youtubeLabel.trim(),
        discordUrl: formData.discordUrl.trim(),
        twitterUrl: formData.twitterUrl.trim(),
        developerWhatsappUrl: formData.developerWhatsappUrl.trim(),
      };

      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          settings: {
            SUPPORT_CONFIG: cleaned,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFormData(cleaned);
        updateSupportConfigCache(cleaned);
        setMessage({ type: "success", text: "Support & Contact configurations saved successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update configurations" });
      }
    } catch (err) {
      console.error("Save error:", err);
      setMessage({ type: "error", text: "Something went wrong while saving" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
        <p className="text-[var(--muted)] text-xs font-semibold animate-pulse">Loading configurations...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 pb-12">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 sm:p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
                <Headphones size={18} />
              </div>
              <h2 className="text-base sm:text-xl font-bold tracking-tight text-[var(--foreground)] truncate">
                Support &amp; Socials Config
              </h2>
            </div>

            {/* Mobile Actions: Refresh & Save */}
            <div className="flex sm:hidden items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={fetchConfig}
                title="Refresh current settings"
                className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] cursor-pointer"
              >
                <RefreshCcw size={14} />
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[var(--accent)] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                <span>Save</span>
              </button>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs text-[var(--muted)]">
            Configure customer care contacts, WhatsApp chat numbers, community links, and social handles.
          </p>
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchConfig}
            title="Refresh current settings"
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--foreground)]/[0.04] transition-all cursor-pointer"
          >
            <RefreshCcw size={15} />
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--accent)] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-[var(--accent)]/20 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ================= ALERTS ================= */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-xs font-medium ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={16} className="shrink-0" />
            ) : (
              <AlertCircle size={16} className="shrink-0" />
            )}
            <span className="flex-1">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSave}>
        {/* ================= UNIFIED MAIN SURFACE ================= */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3.5 sm:p-6 space-y-5 sm:space-y-7 shadow-sm">
          {/* SECTION 1: PRIMARY CUSTOMER CONTACTS */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[var(--accent)]" />
              <h3 className="text-sm font-bold text-[var(--foreground)]">Direct Customer Support</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                Core
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Help Desk Email & Phone Card */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.015] space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-[var(--border)]/60">
                  <Mail size={15} className="text-[var(--accent)]" />
                  <span className="text-xs font-bold text-[var(--foreground)]">Helpline &amp; Email Contacts</span>
                </div>

                {/* Support Email */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--muted)]">Support Email / Gmail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="zynx.anime@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs text-[var(--foreground)] outline-none transition-colors"
                  />
                  <p className="text-[10px] text-[var(--muted)]/70">Displayed on Contact Us page and footer.</p>
                </div>

                {/* Phone Display */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--muted)]">Support Phone Number (Display)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+91 96317 77559"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs text-[var(--foreground)] outline-none transition-colors"
                  />
                  <p className="text-[10px] text-[var(--muted)]/70">Formatted for customer display.</p>
                </div>
              </div>

              {/* WhatsApp Customer Care Card */}
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.015] space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <FaWhatsapp size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold text-[var(--foreground)]">WhatsApp Customer Chat</span>
                  </div>
                  {formData.whatsappUrl && (
                    <a
                      href={formData.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:underline"
                    >
                      <span>Test Chat</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>

                {/* WhatsApp Number */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-[var(--muted)]">WhatsApp Number (with Country Code)</label>
                    <button
                      type="button"
                      onClick={autoGenerateWhatsAppUrl}
                      className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                    >
                      Sync wa.me URL
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                    placeholder="919631777559"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-emerald-500 text-xs text-[var(--foreground)] font-mono outline-none transition-colors"
                  />
                  <p className="text-[10px] text-[var(--muted)]/70">Example: 919631777559</p>
                </div>

                {/* WhatsApp Chat URL */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--muted)]">Direct WhatsApp Chat URL</label>
                  <input
                    type="url"
                    value={formData.whatsappUrl}
                    onChange={(e) => handleChange("whatsappUrl", e.target.value)}
                    placeholder="https://wa.me/919631777559"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-emerald-500 text-xs text-[var(--foreground)] outline-none transition-colors"
                  />
                  <p className="text-[10px] text-[var(--muted)]/70">Used by floating WhatsApp button &amp; support drawer.</p>
                </div>
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="w-full h-[1px] bg-[var(--border)] opacity-60" />

          {/* SECTION 2: COMMUNITY & SERVICES */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <Share2 size={18} className="text-sky-400" />
              <h3 className="text-sm font-bold text-[var(--foreground)]">Community &amp; Services</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* WhatsApp Channel */}
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.015] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaWhatsapp size={15} className="text-emerald-400" />
                    <span className="text-xs font-bold text-[var(--foreground)]">WhatsApp Channel / Group</span>
                  </div>
                  {formData.whatsappChannelUrl && (
                    <a
                      href={formData.whatsappChannelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:underline"
                    >
                      <span>Test</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={formData.whatsappChannelUrl}
                  onChange={(e) => handleChange("whatsappChannelUrl", e.target.value)}
                  placeholder="https://whatsapp.com/channel/..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-emerald-500 text-xs text-[var(--foreground)] outline-none transition-colors"
                />
                <p className="text-[10px] text-[var(--muted)]">Community popups &amp; tournament registrations link.</p>
              </div>

              {/* Developer / Store Software WhatsApp */}
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.015] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-amber-400" />
                    <span className="text-xs font-bold text-[var(--foreground)]">Custom Software / Website Contact</span>
                  </div>
                  {formData.developerWhatsappUrl && (
                    <a
                      href={formData.developerWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:underline"
                    >
                      <span>Test</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={formData.developerWhatsappUrl}
                  onChange={(e) => handleChange("developerWhatsappUrl", e.target.value)}
                  placeholder="https://wa.me/919178521537"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-amber-500 text-xs text-[var(--foreground)] outline-none transition-colors"
                />
                <p className="text-[10px] text-[var(--muted)]">Destination for &quot;Need Your Own Website?&quot; banner links.</p>
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="w-full h-[1px] bg-[var(--border)] opacity-60" />

          {/* SECTION 3: SOCIAL MEDIA HANDLES */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaInstagram size={18} className="text-pink-400" />
                <h3 className="text-sm font-bold text-[var(--foreground)]">Social Media Profiles</h3>
              </div>
              <span className="text-[11px] text-[var(--muted)]">Live store links &amp; handle tags</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Instagram Card */}
              <div className="p-4 rounded-xl border border-pink-500/20 bg-pink-500/[0.02] space-y-3 transition-colors hover:border-pink-500/40">
                <div className="flex items-center justify-between pb-1 border-b border-pink-500/15">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-xs shrink-0">
                      <FaInstagram size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--foreground)]">Instagram</h4>
                      <p className="text-[10px] text-[var(--muted)]">Store handle &amp; profile page</p>
                    </div>
                  </div>
                  {formData.instagramUrl && (
                    <a
                      href={formData.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 transition-all"
                    >
                      <span>Visit</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>

                <div className="space-y-2.5">
                  {/* Handle with Sync URL action */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-[var(--muted)]">Instagram Username / Handle</label>
                      <button
                        type="button"
                        onClick={autoGenerateInstagramUrl}
                        className="text-[10px] font-bold text-pink-400 hover:text-pink-300 hover:underline cursor-pointer"
                        title="Auto-fill profile URL from handle"
                      >
                        Sync URL
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-pink-400">@</span>
                      <input
                        type="text"
                        value={formData.instagramLabel}
                        onChange={(e) => handleChange("instagramLabel", e.target.value.replace(/^@/, ""))}
                        placeholder="tronics_offficial"
                        className="w-full pl-7 pr-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-pink-500 text-xs text-[var(--foreground)] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Profile URL */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[var(--muted)]">Instagram Profile URL</label>
                    <input
                      type="url"
                      value={formData.instagramUrl}
                      onChange={(e) => handleChange("instagramUrl", e.target.value)}
                      placeholder="https://www.instagram.com/tronics_offficial"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-pink-500 text-xs text-[var(--foreground)] outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* YouTube Card */}
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/[0.02] space-y-3 transition-colors hover:border-red-500/40">
                <div className="flex items-center justify-between pb-1 border-b border-red-500/15">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs shrink-0">
                      <FaYoutube size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--foreground)]">YouTube</h4>
                      <p className="text-[10px] text-[var(--muted)]">Channel &amp; video link</p>
                    </div>
                  </div>
                  {formData.youtubeUrl && (
                    <a
                      href={formData.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all"
                    >
                      <span>Visit</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>

                <div className="space-y-2.5">
                  {/* Channel Handle with Sync */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-[var(--muted)]">YouTube Handle / Channel Tag</label>
                      <button
                        type="button"
                        onClick={autoGenerateYoutubeUrl}
                        className="text-[10px] font-bold text-red-400 hover:text-red-300 hover:underline cursor-pointer"
                        title="Auto-fill YouTube URL from handle"
                      >
                        Sync URL
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-red-400">@</span>
                      <input
                        type="text"
                        value={formData.youtubeLabel ? formData.youtubeLabel.replace(/^@/, "") : ""}
                        onChange={(e) => handleChange("youtubeLabel", e.target.value ? `@${e.target.value.replace(/^@/, "")}` : "")}
                        placeholder="tronics"
                        className="w-full pl-7 pr-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-red-500 text-xs text-[var(--foreground)] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Channel URL */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[var(--muted)]">YouTube Channel URL</label>
                    <input
                      type="url"
                      value={formData.youtubeUrl}
                      onChange={(e) => handleChange("youtubeUrl", e.target.value)}
                      placeholder="https://www.youtube.com/@tronics"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-red-500 text-xs text-[var(--foreground)] outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Discord Card */}
              <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.02] space-y-3 transition-colors hover:border-indigo-500/40">
                <div className="flex items-center justify-between pb-1 border-b border-indigo-500/15">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#5865F2] flex items-center justify-center text-white shadow-xs shrink-0">
                      <FaDiscord size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--foreground)]">Discord Community</h4>
                      <p className="text-[10px] text-[var(--muted)]">Gamers chat &amp; announcements</p>
                    </div>
                  </div>
                  {formData.discordUrl && (
                    <a
                      href={formData.discordUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all"
                    >
                      <span>Join</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--muted)]">Discord Server Invite URL</label>
                  <input
                    type="url"
                    value={formData.discordUrl}
                    onChange={(e) => handleChange("discordUrl", e.target.value)}
                    placeholder="https://discord.gg/your-invite-code"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-indigo-500 text-xs text-[var(--foreground)] outline-none transition-colors"
                  />
                  <p className="text-[10px] text-[var(--muted)]">Permanent invite link shown in footer and contact page.</p>
                </div>
              </div>

              {/* X / Twitter Card */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.02] space-y-3 transition-colors hover:border-[var(--foreground)]/30">
                <div className="flex items-center justify-between pb-1 border-b border-[var(--border)]/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-black border border-[var(--border)] flex items-center justify-center text-white shadow-xs shrink-0">
                      <FaXTwitter size={13} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--foreground)]">X (Twitter)</h4>
                      <p className="text-[10px] text-[var(--muted)]">Official announcements handle</p>
                    </div>
                  </div>
                  {formData.twitterUrl && (
                    <a
                      href={formData.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[var(--foreground)] bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20 border border-[var(--border)] transition-all"
                    >
                      <span>Visit</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--muted)]">X (Twitter) Profile URL</label>
                  <input
                    type="url"
                    value={formData.twitterUrl}
                    onChange={(e) => handleChange("twitterUrl", e.target.value)}
                    placeholder="https://x.com/your-store"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--foreground)] text-xs text-[var(--foreground)] outline-none transition-colors"
                  />
                  <p className="text-[10px] text-[var(--muted)]">Direct link to your store account.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl text-xs font-bold text-white bg-[var(--accent)] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-[var(--accent)]/20 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
    </form>
  </div>
);
}
