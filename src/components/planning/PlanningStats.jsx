// src/components/planning/PlanningStats.jsx

export default function PlanningStats({
  planning = [],
}) {
  // ==========================================
  // TOTALEN
  // ==========================================

  const totaal = planning.length;

  const open = planning.filter(
    (p) =>
      (p.status || "")
        .toLowerCase()
        .trim() === "open"
  ).length;

  const ingepland = planning.filter(
    (p) =>
      (p.status || "")
        .toLowerCase()
        .trim() === "ingepland"
  ).length;

  const medewerkers = new Set(
    planning
      .filter((p) => p.medewerker)
      .map((p) => p.medewerker)
  ).size;

  const terminals = new Set(
    planning
      .filter((p) => p.terminal)
      .map((p) => p.terminal)
  ).size;

  // ==========================================
  // KAARTEN
  // ==========================================

  const kaarten = [
    {
      icon: "📅",
      titel: "Diensten",
      waarde: totaal,
      kleur: "#15803d",
      achtergrond: "#f0fdf4",
      rand: "#bbf7d0",
    },
    {
      icon: "📢",
      titel: "Open diensten",
      waarde: open,
      kleur: "#c2410c",
      achtergrond: "#fff7ed",
      rand: "#fed7aa",
    },
    {
      icon: "✅",
      titel: "Ingepland",
      waarde: ingepland,
      kleur: "#166534",
      achtergrond: "#dcfce7",
      rand: "#bbf7d0",
    },
    {
      icon: "👷",
      titel: "Operators",
      waarde: medewerkers,
      kleur: "#1d4ed8",
      achtergrond: "#eff6ff",
      rand: "#bfdbfe",
    },
    {
      icon: "🏭",
      titel: "Terminals",
      waarde: terminals,
      kleur: "#0f766e",
      achtergrond: "#f0fdfa",
      rand: "#99f6e4",
    },
  ];

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(5, minmax(0, 1fr))",
        gap: "14px",
        marginTop: "20px",
        marginBottom: "20px",
      }}
    >
      {kaarten.map((kaart) => (
        <div
          key={kaart.titel}
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "18px",
            border: `1px solid ${kaart.rand}`,
            boxShadow:
              "0 5px 15px rgba(15,23,42,.06)",
            minWidth: 0,
            boxSizing: "border-box",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* KLEURBALK */}

          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "4px",
              background: kaart.kleur,
            }}
          />

          {/* BOVENSTE RIJ */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "11px",
                background:
                  kaart.achtergrond,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                flexShrink: 0,
              }}
            >
              {kaart.icon}
            </div>

            <div
              style={{
                color: kaart.kleur,
                fontSize: "12px",
                fontWeight: "700",
                textAlign: "right",
              }}
            >
              {kaart.titel}
            </div>
          </div>

          {/* GETAL */}

          <div
            style={{
              marginTop: "12px",
            }}
          >
            <strong
              style={{
                display: "block",
                color: kaart.kleur,
                fontSize: "28px",
                lineHeight: "1",
                fontWeight: "800",
              }}
            >
              {kaart.waarde}
            </strong>

            <span
              style={{
                display: "block",
                marginTop: "6px",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              {kaart.titel}
            </span>
          </div>
        </div>
      ))}

      {/* ======================================
          RESPONSIVE STYLING
      ======================================= */}

      <style>
        {`
          @media (max-width: 1100px) {
            .planning-stats {
              grid-template-columns:
                repeat(3, minmax(0, 1fr));
            }
          }

          @media (max-width: 700px) {
            .planning-stats {
              grid-template-columns:
                repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 450px) {
            .planning-stats {
              grid-template-columns:
                1fr;
            }
          }
        `}
      </style>
    </div>
  );
}