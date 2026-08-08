export default function DienstCard({
  dienst,
  onClick,
}) {
  // Voorkom crash als er geen dienst is
  if (!dienst) return null;

  const kleuren = {
    Rotterdam: "#16a34a",
    Euromax: "#2563eb",
    RWG: "#9333ea",
    APM: "#ea580c",
    ECT: "#0891b2",
  };

  const achtergrond =
    kleuren[dienst.terminal] || "#64748b";

  return (
    <div
      onClick={() => onClick?.(dienst)}
      style={{
        background: achtergrond,
        color: "#fff",
        borderRadius: "12px",
        padding: "10px",
        cursor: "pointer",
        minHeight: "72px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 4px 10px rgba(0,0,0,.15)",
        transition: "all .2s ease",
      }}
    >
      <div
        style={{
          fontWeight: "700",
          fontSize: "14px",
        }}
      >
        🏭 {dienst.terminal || "-"}
      </div>

      <div
        style={{
          fontSize: "13px",
        }}
      >
        {dienst.functie ||
          dienst.status ||
          "Dienst"}
      </div>

      <div
        style={{
          fontSize: "13px",
          fontWeight: "600",
        }}
      >
        🕒 {dienst.starttijd || "--:--"} - {dienst.eindtijd || "--:--"}
      </div>
    </div>
  );
}