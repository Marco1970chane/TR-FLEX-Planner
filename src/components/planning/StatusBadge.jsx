// src/components/planning/StatusBadge.jsx

const STATUS_CONFIG = {
  Ingepland: {
    kleur: "#16a34a",
    icoon: "🟢",
  },

  Open: {
    kleur: "#dc2626",
    icoon: "🔴",
  },

  Training: {
    kleur: "#2563eb",
    icoon: "🎓",
  },

  Standby: {
    kleur: "#7c3aed",
    icoon: "🟣",
  },

  Ziek: {
    kleur: "#f59e0b",
    icoon: "🤒",
  },

  Vakantie: {
    kleur: "#0ea5e9",
    icoon: "🌴",
  },

  Verlof: {
    kleur: "#64748b",
    icoon: "🏖️",
  },
};

export default function StatusBadge({
  status,
}) {
  const origineleStatus =
    status || "Open";

  // Zorg dat bijvoorbeeld "open"
  // ook als "Open" wordt herkend.
  const gevondenStatus =
    Object.keys(
      STATUS_CONFIG
    ).find(
      (key) =>
        key.toLowerCase() ===
        String(
          origineleStatus
        )
          .toLowerCase()
          .trim()
    );

  const config =
    STATUS_CONFIG[
      gevondenStatus ||
        origineleStatus
    ] || {
      kleur: "#6b7280",
      icoon: "⚪",
    };

  const weergegevenStatus =
    gevondenStatus ||
    origineleStatus;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent:
          "center",
        gap: "6px",
        background:
          config.kleur,
        color: "#ffffff",
        padding:
          "6px 12px",
        borderRadius:
          "999px",
        fontSize: "13px",
        fontWeight: "700",
        whiteSpace:
          "nowrap",
      }}
    >
      <span>
        {config.icoon}
      </span>

      <span>
        {weergegevenStatus}
      </span>
    </span>
  );
}