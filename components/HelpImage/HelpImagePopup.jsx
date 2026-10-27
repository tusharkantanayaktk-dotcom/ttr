"use client";

import { useState } from "react";
import { FiHelpCircle, FiX } from "react-icons/fi";
import Image from "next/image";

export default function HelpImagePopup() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Question Mark Button */}
      <button
        onClick={() => setOpen(true)}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-[var(--border)]/70 hover:border-[var(--accent)] text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
        aria-label="Where to find Player and Zone ID"
        title="Where to find Player & Zone ID"
      >
        <FiHelpCircle size={15} />
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
          
          {/* Modal */}
          <div className="relative bg-[var(--card)] rounded-xl max-w-md w-full p-4 shadow-xl">
            
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3
                         w-7 h-7 rounded-full
                         bg-black/70 text-white
                         flex items-center justify-center
                         hover:bg-black transition"
            >
              <FiX size={18} />
            </button>

            {/* Image */}
            <Image
              src="https://res.cloudinary.com/dk0sslz1q/image/upload/v1765620596/ID_ele414.png"
              alt="How to find Player ID & Zone ID"
              width={400}
              height={400}
              className="rounded-lg w-full h-auto"
            />
          </div>
        </div>
      )}
    </>
  );
}
