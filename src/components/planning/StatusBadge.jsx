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

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    kleur: "#6b7280",
    icoon: "⚪",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: config.kleur,
        color: "#fff",
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <span>{config.icoon}</span>
      {status}
    </span>
  );
}