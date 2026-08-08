export default function UrenDashboard({
  totaalUren = 0,
  medewerkers = 0,
  registraties = 0,
  terminals = 0,
}) {
  const cards = [
    {
      titel: "Vandaag",
      waarde: `${totaalUren} uur`,
      kleur: "#16a34a",
      icoon: "⏱️",
    },
    {
      titel: "Medewerkers",
      waarde: medewerkers,
      kleur: "#22c55e",
      icoon: "👥",
    },
    {
      titel: "Registraties",
      waarde: registraties,
      kleur: "#15803d",
      icoon: "📋",
    },
    {
      titel: "Terminals",
      waarde: terminals,
      kleur: "#0f766e",
      icoon: "🏭",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(220px,1fr))",
        gap: "20px",
        marginBottom: "25px",
      }}
    >
      {cards.map((card) => (
        <div
          key={card.titel}
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "24px",
            borderLeft: `6px solid ${card.kleur}`,
            boxShadow: "0 8px 18px rgba(0,0,0,.08)",
          }}
        >
          <div
            style={{
              fontSize: "34px",
            }}
          >
            {card.icoon}
          </div>

          <div
            style={{
              marginTop: "15px",
              color: "#64748b",
            }}
          >
            {card.titel}
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: card.kleur,
            }}
          >
            {card.waarde}
          </div>
        </div>
      ))}
    </div>
  );
}