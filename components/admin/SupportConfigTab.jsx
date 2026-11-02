"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  MessageCircle,
  Save,
  RefreshCcw,
  RotateCcw,
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

  const handleResetDefaults = () => {
    if (window.confirm("Reset all contact and support details to default configuration?")) {
      setFormData({
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
      setMessage({ type: "success", text: "Form reset to default values. Click 'Save Changes' to apply." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
              <Headphones size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
              Support & Socials Config
            </h2>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1">
            Configure customer care contacts, WhatsApp chat numbers, community links, and social handles across the store.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            onClick={handleResetDefaults}
            title="Reset to default values"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--muted)] hover:text-amber-400 bg-[var(--card)] border border-[var(--border)] hover:bg-amber-500/10 transition-all cursor-pointer"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Reset Defaults</span>
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

      <form onSubmit={handleSave} className="space-y-5">
        {/* ================= CARD 1: PRIMARY CUSTOMER CONTACTS ================= */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
            <ShieldCheck size={18} className="text-[var(--accent)]" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">Direct Customer Support</h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
              Core
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Support Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                <Mail size={14} className="text-[var(--accent)]" />
                <span>Support Email / Gmail</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="zynx.anime@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs text-[var(--foreground)] outline-none transition-colors"
              />
              <p className="text-[11px] text-[var(--muted)]">Displayed on Contact Us page and footer links.</p>
            </div>

            {/* Support Phone Display */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                <Phone size={14} className="text-emerald-500" />
                <span>Support Phone Number (Display)</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+91 96317 77559"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs text-[var(--foreground)] outline-none transition-colors"
              />
              <p className="text-[11px] text-[var(--muted)]">Formatted with spaces/plus sign for customer display.</p>
            </div>

            {/* WhatsApp Number (Digits only) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <FaWhatsapp size={14} className="text-emerald-500" />
                  <span>WhatsApp Number (Digits with Country Code)</span>
                </label>
                <button
                  type="button"
                  onClick={autoGenerateWhatsAppUrl}
                  className="text-[11px] text-[var(--accent)] hover:underline font-semibold cursor-pointer"
                >
                  Sync URL
                </button>
              </div>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                placeholder="919631777559"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs text-[var(--foreground)] font-mono outline-none transition-colors"
              />
              <p className="text-[11px] text-[var(--muted)]">Example: 919631777559 (Country code + 10-digit number).</p>
            </div>

            {/* WhatsApp Chat URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <MessageCircle size={14} className="text-emerald-500" />
                  <span>Direct WhatsApp Chat URL</span>
                </label>
                {formData.whatsappUrl && (
                  <a
                    href={formData.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
                  >
                    <span>Test Link</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
              <input
                type="url"
                value={formData.whatsappUrl}
                onChange={(e) => handleChange("whatsappUrl", e.target.value)}
                placeholder="https://wa.me/919631777559"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs text-[var(--foreground)] outline-none transition-colors"
              />
              <p className="text-[11px] text-[var(--muted)]">Direct chat link used by floating WhatsApp icon and query tab.</p>
            </div>
          </div>
        </div>

        {/* ================= CARD 2: COMMUNITY & SERVICES ================= */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
            <Share2 size={18} className="text-sky-400" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">Community & Custom Services</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* WhatsApp Channel */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <FaWhatsapp size={14} className="text-emerald-400" />
                  <span>WhatsApp Channel / Community URL</span>
                </label>
                {formData.whatsappChannelUrl && (
                  <a
                    href={formData.whatsappChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
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
                placeholder="https://whatsapp.com/channel/0029VbBZQiRFMqrUsOHKBU0T"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs text-[var(--foreground)] outline-none transition-colors"
              />
              <p className="text-[11px] text-[var(--muted)]">Used in Community Popups and Esports tournament registrations.</p>
            </div>

            {/* Developer / Store Software WhatsApp */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Software Services / Made By WhatsApp</span>
                </label>
                {formData.developerWhatsappUrl && (
                  <a
                    href={formData.developerWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:underline"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs text-[var(--foreground)] outline-none transition-colors"
              />
              <p className="text-[11px] text-[var(--muted)]">Target link for "Need Your Own Website?" banners and services page.</p>
            </div>
          </div>
        </div>

        {/* ================= CARD 3: SOCIAL MEDIA HANDLES ================= */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
            <FaInstagram size={18} className="text-pink-400" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">Social Media Profiles</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Instagram URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <FaInstagram size={14} className="text-pink-400" />
                  <span>Instagram Profile URL</span>
                </label>
                {formData.instagramUrl && (
                  <a
                    href={formData.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-pink-400 hover:underline"
                  >
                    <span>Visit</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
              <input
                type="url"
                value={formData.instagramUrl}
                onChange={(e) => handleChange("instagramUrl", e.target.value)}
                placeholder="https://www.instagram.com/tronics_offficial"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs text-[var(--foreground)] outline-none transition-colors"
              />
            </div>

            {/* Instagram Handle Label */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                <FaInstagram size={14} className="text-pink-400" />
                <span>Instagram Handle (Username)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]">@</span>
                <input
                  type="text"
                  value={formData.instagramLabel}
                  onChange={(e) => handleChange("instagramLabel", e.target.value)}
                  placeholder="tronics_offficial"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs text-[var(--foreground)] outline-none transition-colors"
                />
              </div>
              <p className="text-[11px] text-[var(--muted)]">Displayed inside Support FAQ card and query tab.</p>
            </div>

            {/* YouTube URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <FaYoutube size={14} className="text-red-500" />
                  <span>YouTube Channel URL</span>
                </label>
                {formData.youtubeUrl && (
                  <a
                    href={formData.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-red-400 hover:underline"
                  >
                    <span>Visit</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
              <input
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => handleChange("youtubeUrl", e.target.value)}
                placeholder="https://www.youtube.com/@tronics_offficial"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs text-[var(--foreground)] outline-none transition-colors"
              />
            </div>

            {/* YouTube Handle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                <FaYoutube size={14} className="text-red-500" />
                <span>YouTube Handle / Label</span>
              </label>
              <input
                type="text"
                value={formData.youtubeLabel}
                onChange={(e) => handleChange("youtubeLabel", e.target.value)}
                placeholder="@tronics"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs text-[var(--foreground)] outline-none transition-colors"
              />
            </div>

            {/* Discord URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <FaDiscord size={14} className="text-indigo-400" />
                  <span>Discord Community / Invite URL</span>
                </label>
                {formData.discordUrl && (
                  <a
                    href={formData.discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:underline"
                  >
                    <span>Visit</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
              <input
                type="url"
                value={formData.discordUrl}
                onChange={(e) => handleChange("discordUrl", e.target.value)}
                placeholder="https://discord.gg"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs text-[var(--foreground)] outline-none transition-colors"
              />
            </div>

            {/* Twitter / X URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <FaXTwitter size={14} className="text-[var(--foreground)]" />
                  <span>X (Twitter) Profile URL</span>
                </label>
                {formData.twitterUrl && (
                  <a
                    href={formData.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[var(--accent)] hover:underline"
                  >
                    <span>Visit</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
              <input
                type="url"
                value={formData.twitterUrl}
                onChange={(e) => handleChange("twitterUrl", e.target.value)}
                placeholder="https://twitter.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs text-[var(--foreground)] outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
