// Feature flags configuration
export const FEATURE_FLAGS = {
  // Set to true to enable maintenance mode
  MAINTENANCE_MODE: false,
};

// Helper to sanitize phone numbers for wa.me / tel:
const sanitizePhone = (phone = "") => phone.replace(/[^0-9]/g, "");

// Support and contact configuration
export const SUPPORT_CONFIG = {
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

// General app config
export const CONFIG = {
  APP_NAME: process.env.NEXT_PUBLIC_BRAND_NAME || "Mewji",
  SUPPORT: SUPPORT_CONFIG,
};

export default CONFIG;
