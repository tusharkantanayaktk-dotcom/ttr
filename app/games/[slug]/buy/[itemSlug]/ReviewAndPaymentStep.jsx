"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "qrcode";
const logo = "/logo.svg";
import { FiActivity, FiShield, FiZap, FiCreditCard, FiCheck } from "react-icons/fi";
import { motion } from "framer-motion";

export default function ReviewAndPaymentStep({
  step,
  setStep,
  itemName,
  itemImage,
  price,
  discount,
  totalPrice,
  userEmail,
  userPhone,
  reviewData,
  walletBalance,
  paymentMethod,
  setPaymentMethod,
  onPaymentComplete,
  slug,
  itemSlug,
  isUnified = false,
}) {
  const [upiQR, setUpiQR] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [stopOrders, setStopOrders] = useState(false);

  // Check if orders are being accepted
  useEffect(() => {
    fetch("/api/system/order-status")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStopOrders(data.stopAcceptingOrders);
        }
      })
      .catch(err => console.error("Failed to check order status", err));
  }, []);

  // Generate UPI QR
  const handleUPI = async () => {
    setPaymentMethod("upi");
    const upiId = "mewji@upi"; // Fallback or dynamic
    const upiString = `upi://pay?pa=${upiId}&pn=Tronics Store&am=${totalPrice}&cu=INR`;
    const qr = await QRCode.toDataURL(upiString);
    setUpiQR(qr);
  };

  // Handle proceed to payment
  const handleProceed = async () => {
    if (stopOrders) {
      alert("Orders are temporarily paused. Please try again shortly.");
      return;
    }

    if (!paymentMethod) {
      alert("Please select a payment method (UPI or Wallet).");
      return;
    }

    setIsRedirecting(true);

    try {
      const storedPhone = userPhone || localStorage.getItem("phone");
      const token = localStorage.getItem("token");

      const orderPayload = {
        gameSlug: slug,
        itemSlug,
        itemName,
        playerId: reviewData.playerId,
        zoneId: reviewData.zoneId,
        paymentMethod,
        email: userEmail || null,
        phone: storedPhone,
        currency: "INR",
      };

      const res = await fetch("/api/order/create-gateway-order", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Order failed: " + data.message);
        setIsRedirecting(false);
        return;
      }

      if (data.paidViaWallet) {
        localStorage.setItem("pending_topup_order", data.orderId);
        window.location.href = "/payment/topup-complete";
        return;
      }

      localStorage.setItem("pending_topup_order", data.orderId);
      window.location.href = data.paymentUrl;
    } catch (err) {
      alert("Something went wrong. Please try again.");
      setIsRedirecting(false);
    }
  };

  if (step === 3 && paymentMethod === "upi") {
    return (
      <div className="bg-[var(--card)] p-6 sm:p-8 rounded-2xl border border-[var(--border)] text-center animate-in zoom-in duration-300">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-black uppercase tracking-wider mb-2">
          {/* UPI SVG Badge */}
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
            <path d="M14.2 3.5L8.5 13.5H13L10.5 20.5L18.5 9.5H13.8L16 3.5H14.2Z" fill="url(#qrUpiGrad)" />
            <defs>
              <linearGradient id="qrUpiGrad" x1="8.5" y1="3.5" x2="18.5" y2="20.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F97316" />
                <stop offset="0.5" stopColor="#EAB308" />
                <stop offset="1" stopColor="#22C55E" />
              </linearGradient>
            </defs>
          </svg>
          <span>UPI Instant Payment</span>
        </div>
        <h3 className="text-xl font-bold mb-1">Scan & Pay</h3>
        <p className="text-xs text-[var(--muted)] mb-5">Open PhonePe, Paytm, or any UPI app and scan to pay</p>

        {/* QR Code Container with High-Tech Corner Reticle SVGs */}
        <div className="relative w-56 h-56 mx-auto bg-white p-3 rounded-2xl shadow-xl border-2 border-[var(--border)]">
          {/* Reticle Top Left */}
          <svg className="absolute -top-2.5 -left-2.5 w-6 h-6 text-[var(--accent)] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 2H4a2 2 0 0 0-2 2v5" />
          </svg>
          {/* Reticle Top Right */}
          <svg className="absolute -top-2.5 -right-2.5 w-6 h-6 text-[var(--accent)] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 2h5a2 2 0 0 1 2 2v5" />
          </svg>
          {/* Reticle Bottom Left */}
          <svg className="absolute -bottom-2.5 -left-2.5 w-6 h-6 text-[var(--accent)] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 22H4a2 2 0 0 1-2-2v-5" />
          </svg>
          {/* Reticle Bottom Right */}
          <svg className="absolute -bottom-2.5 -right-2.5 w-6 h-6 text-[var(--accent)] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 22h5a2 2 0 0 0 2-2v-5" />
          </svg>

          {upiQR ? (
            <Image src={upiQR} alt="UPI QR" fill className="p-3 object-contain" />
          ) : (
            <div className="h-full flex items-center justify-center animate-pulse text-[var(--muted)] text-xs">Creating QR...</div>
          )}
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={onPaymentComplete}
            className="w-full py-4 rounded-xl bg-[var(--accent)] text-black font-bold shadow-lg"
          >
            I have paid
          </button>
          <button
            onClick={() => {
                if (setStep) setStep(2);
            }}
            className="w-full py-3 rounded-xl border border-[var(--border)] text-[var(--muted)] font-medium text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {!isUnified && (
        <>
          {/* ITEM SUMMARY */}
          <div className="bg-[var(--card)] p-3.5 rounded-2xl border border-[var(--border)] flex items-center gap-4">
            <div className="relative h-12 w-12 shrink-0 flex items-center justify-center">
              <Image src={itemImage || logo} alt={itemName} fill className="object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">{itemName}</h3>
              <p className="text-xs text-[var(--muted)] flex items-center gap-1.5">
                <FiZap className="text-yellow-400" /> Fast delivery
              </p>
            </div>
          </div>

          {/* PLAYER & CONTACT DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="bg-[var(--card)]/50 p-4 rounded-2xl border border-[var(--border)]">
              <h4 className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
                <FiShield className="text-indigo-400" /> Account Details
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">Name</span>
                  <span className="font-semibold">{reviewData?.userName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">User ID</span>
                  <span className="font-semibold text-[var(--accent)]">{reviewData?.playerId}</span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--card)]/50 p-4 rounded-2xl border border-[var(--border)]">
              <h4 className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-2 flex items-center gap-2">
                <FiZap className="text-emerald-400" /> Contact Info
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">Email</span>
                  <span className="font-semibold truncate max-w-[120px]">{userEmail || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">Phone</span>
                  <span className="font-semibold">{userPhone || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* PAYMENT OPTIONS */}
      <div className="space-y-2">
        {/* UPI Button */}
        <button
          onClick={handleUPI}
          className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all duration-300 group cursor-pointer ${paymentMethod === "upi"
            ? "border-[var(--accent)] bg-[var(--accent)]/[0.05]"
            : "border-[var(--border)] bg-[var(--foreground)]/[0.02] hover:border-[var(--accent)]/30"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-xs ${paymentMethod === 'upi' ? 'bg-[var(--accent)] text-black' : 'bg-[var(--foreground)]/[0.05] text-[var(--foreground)]'
            }`}>
              {/* Modern UPI Dual Lightning / Chevron Vector */}
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <path d="M14.2 3.5L8.5 13.5H13L10.5 20.5L18.5 9.5H13.8L16 3.5H14.2Z" fill={paymentMethod === 'upi' ? "#000000" : "url(#upiGradLight)"} />
                <defs>
                  <linearGradient id="upiGradLight" x1="8.5" y1="3.5" x2="18.5" y2="20.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F97316" />
                    <stop offset="0.5" stopColor="#EAB308" />
                    <stop offset="1" stopColor="#22C55E" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-black text-sm uppercase tracking-tight italic">Pay with UPI</p>
                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Instant</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {/* PhonePe mini brand pill */}
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#5F259F]/15 border border-[#5F259F]/30 text-[#a855f7] text-[8.5px] font-bold">
                  PhonePe
                </span>
                {/* Paytm mini brand pill */}
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#002970]/20 border border-[#00BAF2]/30 text-[#00BAF2] text-[8.5px] font-bold">
                  Paytm
                </span>
                {/* UPI pill */}
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[var(--foreground)]/[0.05] border border-[var(--border)]/60 text-[8.5px] font-bold text-[var(--muted)]">
                  BHIM / Any UPI
                </span>
              </div>
            </div>
          </div>
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${paymentMethod === 'upi' ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border)]'}`}>
            {paymentMethod === 'upi' && <FiCheck size={10} className="text-black" strokeWidth={4} />}
          </div>
        </button>

        {/* Wallet Button */}
        <button
          onClick={() => {
            if (walletBalance < totalPrice) return;
            setPaymentMethod("wallet");
          }}
          className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all duration-300 group cursor-pointer ${paymentMethod === "wallet"
            ? "border-[var(--accent)] bg-[var(--accent)]/[0.05]"
            : "border-[var(--border)] bg-[var(--foreground)]/[0.02] hover:border-[var(--accent)]/30"
          } ${walletBalance < totalPrice ? "opacity-40 cursor-not-allowed grayscale" : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-xs ${paymentMethod === 'wallet' ? 'bg-[var(--accent)] text-black' : 'bg-[var(--foreground)]/[0.05] text-[var(--muted)]'
            }`}>
              {/* Sleek Digital Wallet / Coin SVG Vector */}
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="13" rx="2.5" />
                <path d="M16 12h5v4h-5a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2z" fill={paymentMethod === 'wallet' ? "currentColor" : "currentColor"} fillOpacity="0.25" />
                <circle cx="18" cy="14" r="1" fill="currentColor" />
                <path d="M5 6V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" strokeDasharray="1.5 2" />
              </svg>
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-tight italic">Pay with Wallet</p>
              <p className="text-[8.5px] font-bold text-[var(--muted)] uppercase tracking-wider mt-0.5">Balance: ₹{walletBalance.toFixed(2)}</p>
            </div>
          </div>
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${paymentMethod === 'wallet' ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border)]'}`}>
            {paymentMethod === 'wallet' && <FiCheck size={10} className="text-black" strokeWidth={4} />}
          </div>
        </button>

        {walletBalance < totalPrice && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
             <p className="text-[8px] font-black text-red-500 uppercase tracking-widest">Not enough wallet balance</p>
          </div>
        )}
      </div>

      {/* PRICE SUMMARY & ACTIONS */}
      <div className="pt-4 border-t border-[var(--border)]/40 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
            <span>Subtotal</span>
            <span>₹{price}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-emerald-500">
              <span>Discount</span>
              <span>-₹{discount}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-1">
            <span className="text-lg font-black uppercase tracking-tight italic">Total Price</span>
            <span className="text-2xl font-black text-[var(--accent)]">₹{totalPrice}</span>
          </div>
        </div>

        {stopOrders && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center justify-center text-center animate-in fade-in zoom-in duration-300">
            <p className="text-sm font-bold text-red-500 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              We are currently not accepting new orders.
            </p>
          </div>
        )}

        <button
          onClick={handleProceed}
          disabled={stopOrders || isRedirecting || !paymentMethod || (paymentMethod === "wallet" && walletBalance < totalPrice)}
          className="w-full py-3.5 rounded-xl bg-[var(--accent)] text-black font-black uppercase tracking-[0.2em] italic hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer shadow-md"
        >
          {isRedirecting ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-3 border-black border-t-transparent rounded-full" />
          ) : (
            <span className="flex items-center gap-2">
              <span>Buy Now</span>
              {/* Lightning Bolt SVG */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
