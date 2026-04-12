import HelpImagePopup from "../../../../../components/HelpImage/HelpImagePopup";
import RecentVerifiedPlayers from "../../../../region/RecentVerifiedPlayers";

export default function ValidationStep({
  playerId,
  setPlayerId,
  zoneId,
  setZoneId,
  onValidate,
  loading,
  showZoneId = true,
  label = "Player Check",
  placeholder = "Enter Player ID",
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">{label}</h2>
        <HelpImagePopup />
      </div>

      <input
        value={playerId}
        onChange={(e) => setPlayerId(e.target.value)}
        placeholder={placeholder}
        className="p-3 rounded-lg bg-black/20 border border-gray-700 w-full"
        disabled={loading}
      />

      {showZoneId && (
        <input
          value={zoneId}
          onChange={(e) => setZoneId(e.target.value)}
          placeholder="Enter zone ID"
          className="p-3 rounded-lg bg-black/20 border border-gray-700 w-full"
          disabled={loading}
        />
      )}

      <button
        onClick={onValidate}
        disabled={loading}
        className={`py-3 rounded-lg w-full font-semibold transition
          ${
            loading
              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-[var(--accent)] text-black hover:opacity-90"
          }`}
      >
        {loading ? "Validating…" : "Continue"}
      </button>

      <RecentVerifiedPlayers
        limit={10}
        onSelect={(player) => {
          setPlayerId(player.playerId);
          if (showZoneId) setZoneId(player.zoneId);
        }}
      />
    </div>
  );
}
