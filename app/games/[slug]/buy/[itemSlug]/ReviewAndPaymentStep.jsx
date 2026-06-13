"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import logo from "@/public/logo.png";
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
      alert("We are currently not accepting new orders.");
      return;
    }

    if (!paymentMethod) {
      alert("Please choose a payment method.");
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
      <div className="bg-[var(--card)] p-8 rounded-2xl border border-[var(--border)] text-center animate-in zoom-in duration-300">
        <h3 className="text-xl font-bold mb-2">Scan & Pay</h3>
        <p className="text-sm text-[var(--muted)] mb-6">Scan this QR code in any UPI app to pay.</p>

        <div className="relative w-56 h-56 mx-auto bg-white p-4 rounded-2xl shadow-2xl border-4 border-[var(--accent)]">
          {upiQR ? (
            <Image src={upiQR} alt="UPI QR" fill className="p-4" />
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
          <div className="bg-[var(--card)] p-3 rounded-2xl border border-[var(--border)] shadow-xl flex items-center gap-4">
            <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-white/10 shadow-lg">
              <Image src={itemImage || logo} alt={itemName} fill className="object-cover" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">{itemName}</h3>
              <p className="text-sm text-[var(--muted)] flex items-center gap-1.5">
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
          className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all duration-500 group ${paymentMethod === "upi"
            ? "border-[var(--accent)] bg-[var(--accent)]/[0.05] shadow-lg shadow-[var(--accent)]/5"
            : "border-[var(--border)] bg-[var(--foreground)]/[0.02] hover:border-[var(--accent)]/30"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-500 ${paymentMethod === 'upi' ? 'bg-[var(--accent)] text-black shadow-md shadow-[var(--accent)]/20' : 'bg-[var(--foreground)]/[0.05] text-[var(--muted)]'
            }`}>
              <FiCreditCard size={18} />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-tight italic">UPI Gateway</p>
              <p className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-60">GPay, PhonePe, Paytm</p>
            </div>
          </div>
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${paymentMethod === 'upi' ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border)]'}`}>
            {paymentMethod === 'upi' && <FiCheck size={10} className="text-black" strokeWidth={4} />}
          </div>
        </button>

        {/* Wallet Button */}
        <button
          onClick={() => {
            if (walletBalance < totalPrice) return;
            setPaymentMethod("wallet");
          }}
          className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all duration-500 group ${paymentMethod === "wallet"
            ? "border-[var(--accent)] bg-[var(--accent)]/[0.05] shadow-lg shadow-[var(--accent)]/5"
            : "border-[var(--border)] bg-[var(--foreground)]/[0.02] hover:border-[var(--accent)]/30"
          } ${walletBalance < totalPrice ? "opacity-40 cursor-not-allowed grayscale" : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-500 ${paymentMethod === 'wallet' ? 'bg-[var(--accent)] text-black shadow-md shadow-[var(--accent)]/20' : 'bg-[var(--foreground)]/[0.05] text-[var(--muted)]'
            }`}>
              <FiActivity size={18} />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-tight italic">My Wallet</p>
              <p className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-60">Balance: ₹{walletBalance.toFixed(2)}</p>
            </div>
          </div>
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${paymentMethod === 'wallet' ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border)]'}`}>
            {paymentMethod === 'wallet' && <FiCheck size={10} className="text-black" strokeWidth={4} />}
          </div>
        </button>

        {walletBalance < totalPrice && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
             <p className="text-[8px] font-black text-red-500 uppercase tracking-widest">Insufficient balance</p>
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
              <FiShield className="shrink-0" />
              We are currently not accepting new orders.
            </p>
          </div>
        )}

        <button
          onClick={handleProceed}
          disabled={stopOrders || isRedirecting || !paymentMethod || (paymentMethod === "wallet" && walletBalance < totalPrice)}
          className="w-full py-3.5 rounded-xl bg-[var(--accent)] text-black font-black uppercase tracking-[0.2em] italic shadow-2xl shadow-[var(--accent)]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-sm"
        >
          {isRedirecting ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-3 border-black border-t-transparent rounded-full" />
          ) : (
            <>Buy Now <FiZap /></>
          )}
        </button>
      </div>
    </div>
  );
}
