"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaWhatsapp,
  FaInstagram,
  FaYoutube,
  FaShareNodes,
} from "react-icons/fa6";
import { RiChatSmile3Fill, RiCloseFill } from "react-icons/ri";

const socialLinks = [
  {
    name: "WhatsApp",
    icon: FaWhatsapp,
    url: "https://wa.me/919366077306",
    color: "hover:bg-green-500 hover:text-white",
    bgGradient: "from-green-400 to-green-600",
  },
  {
    name: "Instagram",
    icon: FaInstagram,
    url: "https://www.instagram.com/meowjiofficial.mlbb?igsh=a3ZnOXBkNmY2ZDQ0",
    color: "hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:text-white",
    bgGradient: "from-purple-500 to-pink-500",
  },
  {
    name: "YouTube",
    icon: FaYoutube,
    url: "https://www.youtube.com/@whoisfinalboss",
    color: "hover:bg-red-600 hover:text-white",
    bgGradient: "from-red-500 to-red-700",
  },
];

export default function SocialFloat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Only show on home page

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  /* ================= SHOW/HIDE ON SCROLL ================= */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // If user scrolls down and has scrolled more than 100px, hide
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
        setIsOpen(false); // Close menu if scrolling down
      }
      // If user scrolls up, show
      else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= CLOSE ON OUTSIDE CLICK ================= */
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  /* ================= SHARE ================= */
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Meowji Official",
          text: "Check out this awesome site!",
          url: window.location.href,
        });
      } catch { }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  /* ================= ANIMATION VARIANTS ================= */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    hidden: {
      x: 50,
      opacity: 0,
      scale: 0.3,
      rotate: 45
    },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    exit: {
      x: 50,
      opacity: 0,
      scale: 0.3,
      rotate: 45,
      transition: { duration: 0.2 }
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: {
      scale: 1.1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.9 }
  };

  if (pathname !== "/") return null;

  return (
    <motion.div
      ref={containerRef}
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: isVisible ? 0 : 100,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="fixed bottom-6 right-6 z-[90]"
      style={{ pointerEvents: isVisible ? "auto" : "none" }}
    >
      {/* ================= FLOATING MENU ================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute bottom-20 right-0 flex flex-col items-end gap-3"
          >
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <motion.div
                  key={social.name}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.15,
                    x: -5,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group block"
                    aria-label={social.name}
                  >
                    {/* Background Gradient */}
                    <div
                      className={`absolute inset-0 rounded-full bg-gradient-to-br ${social.bgGradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}
                    />

                    <div
                      className={`
                        relative w-12 h-12
                        rounded-full
                        bg-[var(--card)]
                        border border-[var(--border)]
                        flex items-center justify-center
                        text-lg
                        shadow-lg
                        transition-all duration-300
                        group-hover:shadow-xl
                        group-hover:border-transparent
                        ${social.color}
                      `}
                    >
                      <Icon />
                    </div>
                  </Link>
                </motion.div>
              );
            })}

            {/* Divider */}
            <motion.div
              variants={itemVariants}
              className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent w-12 my-1"
            />

            {/* Share */}
            <motion.button
              variants={itemVariants}
              whileHover={{
                scale: 1.15,
                x: -5,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="relative group"
              aria-label="Share"
            >
              <div
                className="
                  relative w-12 h-12
                  rounded-full
                  bg-[var(--card)]
                  border border-[var(--border)]
                  flex items-center justify-center
                  text-lg
                  shadow-lg
                  transition-all duration-300
                  group-hover:shadow-xl
                  group-hover:bg-blue-600 
                  group-hover:text-white
                  group-hover:border-transparent
                "
              >
                <FaShareNodes />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= TOGGLE BUTTON ================= */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        className={`
          relative w-14 h-14
          rounded-full
          text-white
          flex items-center justify-center
          shadow-lg hover:shadow-xl
          transition-colors duration-300
          overflow-hidden
          z-[91]
          ${isOpen ? 'bg-[var(--foreground)]' : 'bg-gradient-to-br from-[var(--accent)] to-purple-600'}
        `}
        aria-label="Toggle social menu"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isOpen ? "close" : "chat"}
            initial={{ scale: 0, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            {isOpen ? (
              <RiCloseFill className="text-3xl" />
            ) : (
              <RiChatSmile3Fill className="text-3xl" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
