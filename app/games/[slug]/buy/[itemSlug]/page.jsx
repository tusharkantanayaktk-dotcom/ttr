"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import AuthGuard from "../../../../../components/AuthGuard";
import ValidationStep from "./ValidationStep";
import ReviewAndPaymentStep from "./ReviewAndPaymentStep";
import { saveVerifiedPlayer } from "@/utils/storage/verifiedPlayerStorage";

export default function BuyFlowPage() {
  const { slug, itemSlug } = useParams();
  const params = useSearchParams();

  /* ================= FLOW STATE ================= */
  const [step, setStep] = useState(1);
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [reviewData, setReviewData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ================= USER DATA ================= */
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);

  /* ================= VERIFIED ITEM DATA ================= */
  const [item, setItem] = useState(null);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const [error, setError] = useState("");
  const [game, setGame] = useState(null);

  /* ================= FALLBACK (UI ONLY) ================= */
  const fallbackName = params.get("name");
  const fallbackImage = params.get("image");

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;
        setUserEmail(data.user.email);
        setUserPhone(data.user.phone);
        setWalletBalance(data.user.wallet || 0);
      });
  }, []);

  /* ================= FETCH GAME & VERIFY ITEM PRICE ================= */
  useEffect(() => {
    if (!slug || !itemSlug) return;

    const token = localStorage.getItem("token");

    fetch(`/api/games/${slug}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then(res => res.json())
      .then(data => {
        const gameData = data?.data;
        if (!gameData) return;
        setGame(gameData);

        const foundItem = gameData.itemId?.find(
          (i) => i.itemSlug === itemSlug
        );

        if (!foundItem) {
          setError("Invalid item selected");
          return;
        }

        const sellingPrice = Number(foundItem.sellingPrice);
        const dummyPrice = Number(foundItem.dummyPrice || 0);
        const calculatedDiscount =
          dummyPrice > sellingPrice ? dummyPrice - sellingPrice : 0;

        setItem(foundItem);
        setPrice(sellingPrice);
        setDiscount(calculatedDiscount);
        setTotalPrice(sellingPrice);
      })
      .catch(() => {
        setError("Failed to load item price");
      });
  }, [slug, itemSlug]);

  /* ================= GAME CONFIG ================= */
  const isMLBB = slug?.toLowerCase().includes("mlbb") || slug?.toLowerCase().includes("mobile-legends") || slug?.toLowerCase().includes("mobile-legens") || slug?.toLowerCase().includes("weeklymonthly-bundle") || slug?.toLowerCase().includes("legends988");
  const isBGMI = slug?.toLowerCase().includes("pubg") || slug?.toLowerCase().includes("bgmi");
  const isOTT = slug?.toLowerCase().includes("netflix") || slug?.toLowerCase().includes("youtube");
  const isMembership = slug?.toLowerCase().includes("membership");

  const needsZoneId = isMLBB; // Only MLBB needs Zone ID for now
  const isVerificationBypass = isOTT || isMembership || game?.isValidationRequired === false;

  /* ================= VALIDATE PLAYER ================= */
  const handleValidate = async () => {
    setError(""); // reset error
    if (!playerId || (needsZoneId && !zoneId)) {
      setError(`Please enter your Player ID${needsZoneId ? " and Zone ID" : ""}`);
      return;
    }

    setLoading(true);

    // Determine if MLBB based on slug and name for robust validation
    const name = game?.gameName?.toLowerCase() || "";
    const isMLBB_local = slug.includes("mlbb") || name.includes("mlbb") || slug.includes("legends988") || slug.includes("weeklymonthly-bundle");

    if (isVerificationBypass) {
      saveVerifiedPlayer({
        playerId,
        zoneId: zoneId || "NA",
        username: isBGMI ? "BGMI Player" : (isOTT ? "OTT User" : (isMembership ? "Member" : "Player")),
        region: "Global",
        savedAt: Date.now(),
      });

      setReviewData({
        userName: isBGMI ? "BGMI Player" : (isOTT ? "OTT User" : (isMembership ? "Member" : "Player")),
        region: "Global",
        playerId,
        zoneId: zoneId || "NA",
      });

      setLoading(false);
      setStep(2);
      return;
    }

    try {
      let username = "Unknown";
      let region = "Global";
      let isValid = false;

      // 1. Always check name for ALL games (including MLBB)
      // For MLBB variants, we use a standard gameId to ensure name check works across all regions
      const baseGameId = isMLBB_local ? "mobile-legends988" : (game?.gameId || slug);
      const productId = `${baseGameId}_${item?.itemId || itemSlug}`;

      const nameRes = await fetch("/api/check-region/namecheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          playerId,
          zoneId: zoneId || "NA",
        }),
      });
      const nameData = await nameRes.json();

      if (
        (nameData?.success === 200 || nameData?.success === true) &&
        (nameData?.data?.username || nameData?.data?.name) &&
        nameData?.data?.valid !== false
      ) {
        username = nameData?.data?.username || nameData?.data?.name || "Unknown";
        region = nameData?.data?.region || "Global";
        isValid = true;
      }

      if (isValid) {
        saveVerifiedPlayer({
          playerId,
          zoneId,
          username,
          region,
          savedAt: Date.now(),
        });

        setReviewData({
          userName: username,
          region,
          playerId,
          zoneId,
        });

        setLoading(false);
        setStep(2);
      } else {
        // If we got here and it's not valid, use the error from nameData
        const serverMsg = nameData?.message || "Player not found";
        setError(serverMsg.toLowerCase().includes("success") ? "Player ID not found." : serverMsg);
        setLoading(false);
      }
    } catch (err) {
      console.error("Complete Validation Error:", err);
      setError("Validation failed. Please try again.");
      setLoading(false);
    }
  };

  /* ================= PAYMENT ================= */
  const handlePayment = async () => {
    // Backend MUST re-verify price again
    setTimeout(() => setShowSuccess(true), 500);
  };

  return (
    <AuthGuard>
      <section className="px-6 py-8 max-w-3xl mx-auto">

        {/* ================= STEP INDICATOR ================= */}
        <div className="relative flex items-center justify-between mb-10">
          <div className="absolute top-[31%] left-[15%] w-[70%] h-[3px] bg-gray-700 -z-0 rounded-full">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-500 rounded-full"
              style={{
                width:
                  step === 1 ? "0%" :
                    step === 2 ? "50%" :
                      step === 3 ? "100%" : "0%",
              }}
            />
          </div>

          {[1, 2, 3].map((num) => (
            <div key={num} className="relative z-10 flex flex-col items-center w-1/3">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-semibold text-sm
                ${step >= num
                    ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                    : "border-gray-600 bg-[var(--card)] text-gray-400"}`}
              >
                {num}
              </div>

              <p className={`text-sm mt-2 ${step >= num ? "text-[var(--accent)]" : "text-gray-500"}`}>
                {num === 1 ? "Validate" : num === 2 ? "Review" : "Payment"}
              </p>
            </div>
          ))}
        </div>

        {/* ================= SUCCESS ================= */}
        {showSuccess && (
          <div className="bg-green-600/20 border border-green-600 text-green-500 p-6 rounded-xl text-center shadow-lg">
            <h2 className="text-xl font-bold">Payment Successful ✔</h2>
            <p className="text-sm mt-2 opacity-80">Your order has been placed.</p>
          </div>
        )}

        {!showSuccess && (
          <>
            {/* STEP 1 */}
            {step === 1 && (
              <ValidationStep
                playerId={playerId}
                setPlayerId={setPlayerId}
                zoneId={zoneId}
                setZoneId={setZoneId}
                onValidate={handleValidate}
                loading={loading}
                error={error}
                showZoneId={needsZoneId}
                label={isBGMI ? "Character Verification" : "Player Check"}
                placeholder={isBGMI ? "Enter Character ID" : "Enter Player ID"}
              />
            )}

            {/* STEP 2 & 3 */}
            {(step === 2 || step === 3) && reviewData && (
              <ReviewAndPaymentStep
                step={step}
                setStep={setStep}
                itemName={item?.itemName || fallbackName}
                itemImage={item?.itemImageId?.image || fallbackImage}
                price={price}
                discount={discount}
                totalPrice={totalPrice}
                userEmail={userEmail}
                userPhone={userPhone}
                reviewData={reviewData}
                walletBalance={walletBalance}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                onPaymentComplete={handlePayment}
                slug={slug}
                itemSlug={itemSlug}
              />
            )}
          </>
        )}
      </section>
    </AuthGuard>
  );
}
