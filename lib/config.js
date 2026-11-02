// Feature flags configuration
export const FEATURE_FLAGS = {
  // Set to true to enable maintenance mode
  MAINTENANCE_MODE: false,
};

// Helper to sanitize phone numbers for wa.me / tel:
export const sanitizePhone = (phone = "") => String(phone).replace(/[^0-9]/g, "");

// Default support and contact configuration
export const DEFAULT_SUPPORT_CONFIG = {
  // Support Email / Gmail
  email:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
    process.env.NEXT_PUBLIC_SUPPORT_GMAIL ||
    "zynx.anime@gmail.com",
  gmail:
    process.env.NEXT_PUBLIC_SUPPORT_GMAIL ||
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
    "zynx.anime@gmail.com",

  // Support Phone
  phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+91 96317 77559",
  phoneRaw: sanitizePhone(process.env.NEXT_PUBLIC_SUPPORT_PHONE || "919631777559"),
  phoneTel:
    process.env.NEXT_PUBLIC_SUPPORT_PHONE_TEL ||
    `tel:+${sanitizePhone(process.env.NEXT_PUBLIC_SUPPORT_PHONE || "919631777559")}`,

  // WhatsApp Support Links & Channels
  whatsappNumber: sanitizePhone(process.env.NEXT_PUBLIC_SUPPORT_PHONE || "919631777559"),
  whatsappUrl:
    process.env.NEXT_PUBLIC_WHATSAPP_URL && process.env.NEXT_PUBLIC_WHATSAPP_URL.trim()
      ? process.env.NEXT_PUBLIC_WHATSAPP_URL.replace(/\s+/g, "")
      : `https://wa.me/${sanitizePhone(process.env.NEXT_PUBLIC_SUPPORT_PHONE || "919631777559")}`,
  whatsappChannelUrl:
    process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL ||
    process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_URL ||
    "https://whatsapp.com/channel/0029VbBZQiRFMqrUsOHKBU0T",

  // Social & Community Links
  instagramUrl:
    process.env.NEXT_PUBLIC_SUPPORT_INSTAGRAM_URL ||
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
    "https://www.instagram.com/tronics_offficial",
  instagramLabel: process.env.NEXT_PUBLIC_SUPPORT_INSTAGRAM_LABEL || "tronics_offficial",
  youtubeUrl:
    process.env.NEXT_PUBLIC_SUPPORT_YOUTUBE_URL ||
    process.env.NEXT_PUBLIC_YOUTUBE_URL ||
    "https://www.youtube.com/@tronics_offficial",
  youtubeLabel: process.env.NEXT_PUBLIC_SUPPORT_YOUTUBE_LABEL || "@tronics",
  discordUrl: process.env.NEXT_PUBLIC_SUPPORT_DISCORD_URL || "https://discord.gg",
  twitterUrl: process.env.NEXT_PUBLIC_SUPPORT_TWITTER_URL || "https://twitter.com",

  // Developer / Services WhatsApp Link
  developerWhatsappUrl:
    process.env.NEXT_PUBLIC_MADE_BY_URL || "https://wa.me/919178521537",

  // Dynamic helper to build WhatsApp URL with pre-filled message
  getWhatsAppChatUrl(customMessage = "") {
    const rawNumber = sanitizePhone(process.env.NEXT_PUBLIC_SUPPORT_PHONE || "919631777559");
    const base = `https://wa.me/${rawNumber}`;
    return customMessage ? `${base}?text=${encodeURIComponent(customMessage)}` : base;
  },
};

// Formatter to sanitize and derive missing attributes
export function formatSupportConfig(custom = {}) {
  const email = (custom.email || custom.gmail || DEFAULT_SUPPORT_CONFIG.email || "").trim();
  const phone = (custom.phone || DEFAULT_SUPPORT_CONFIG.phone || "").trim();
  const rawNumber = sanitizePhone(custom.whatsappNumber || phone || DEFAULT_SUPPORT_CONFIG.whatsappNumber);
  const phoneRaw = sanitizePhone(phone || DEFAULT_SUPPORT_CONFIG.phoneRaw);
  const phoneTel = phoneRaw ? `tel:+${phoneRaw}` : DEFAULT_SUPPORT_CONFIG.phoneTel;

  const whatsappNumber = rawNumber;
  let whatsappUrl = custom.whatsappUrl ? custom.whatsappUrl.trim() : "";
  if (!whatsappUrl && whatsappNumber) {
    whatsappUrl = `https://wa.me/${whatsappNumber}`;
  } else if (!whatsappUrl) {
    whatsappUrl = DEFAULT_SUPPORT_CONFIG.whatsappUrl;
  }

  const whatsappChannelUrl = (custom.whatsappChannelUrl || DEFAULT_SUPPORT_CONFIG.whatsappChannelUrl || "").trim();
  const instagramUrl = (custom.instagramUrl || DEFAULT_SUPPORT_CONFIG.instagramUrl || "").trim();
  const instagramLabel = (custom.instagramLabel || DEFAULT_SUPPORT_CONFIG.instagramLabel || "").trim();
  const youtubeUrl = (custom.youtubeUrl || DEFAULT_SUPPORT_CONFIG.youtubeUrl || "").trim();
  const youtubeLabel = (custom.youtubeLabel || DEFAULT_SUPPORT_CONFIG.youtubeLabel || "").trim();
  const discordUrl = (custom.discordUrl || DEFAULT_SUPPORT_CONFIG.discordUrl || "").trim();
  const twitterUrl = (custom.twitterUrl || DEFAULT_SUPPORT_CONFIG.twitterUrl || "").trim();
  const developerWhatsappUrl = (custom.developerWhatsappUrl || DEFAULT_SUPPORT_CONFIG.developerWhatsappUrl || "").trim();

  return {
    email,
    gmail: email,
    phone,
    phoneRaw,
    phoneTel,
    whatsappNumber,
    whatsappUrl,
    whatsappChannelUrl,
    instagramUrl,
    instagramLabel,
    youtubeUrl,
    youtubeLabel,
    discordUrl,
    twitterUrl,
    developerWhatsappUrl,
    getWhatsAppChatUrl(customMessage = "") {
      const base = whatsappUrl.startsWith("http") ? whatsappUrl : `https://wa.me/${whatsappNumber}`;
      return customMessage ? `${base}${base.includes("?") ? "&" : "?"}text=${encodeURIComponent(customMessage)}` : base;
    },
  };
}

// Current support config initialized with defaults
export const SUPPORT_CONFIG = formatSupportConfig();

// General app config
export const CONFIG = {
  APP_NAME: process.env.NEXT_PUBLIC_BRAND_NAME || "Mewji",
  SUPPORT: SUPPORT_CONFIG,
};

export default CONFIG;
