export default function DienstCard({
  dienst,
  onClick,
}) {
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
      onMouseEnter={(e) => {
        e.currentTarget.style.transform =
          "translateY(-2px)";
        e.currentTarget.style.boxShadow =
          "0 8px 20px rgba(0,0,0,.22)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 4px 10px rgba(0,0,0,.15)";
      }}
    >
      <div
        style={{
          fontWeight: "700",
          fontSize: "14px",
        }}
      >
        🏭 {dienst.terminal}
      </div>

      <div
        style={{
          fontSize: "13px",
          opacity: .95,
        }}
      >
        {dienst.functie || dienst.status || "Dienst"}
      </div>

      <div
        style={{
          fontSize: "13px",
          fontWeight: "600",
        }}
      >
        🕒 {dienst.starttijd} - {dienst.eindtijd}
      </div>
    </div>
  );
}