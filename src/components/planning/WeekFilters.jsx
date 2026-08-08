export default function WeekFilters({
  zoekterm,
  setZoekterm,
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "18px",
        padding: "20px",
        marginBottom: "20px",
        display: "flex",
        gap: "15px",
        flexWrap: "wrap",
        alignItems: "center",
        boxShadow: "0 6px 18px rgba(0,0,0,.08)",
        border: "1px solid #dcfce7",
      }}
    >
      <input
        type="text"
        placeholder="🔍 Zoek medewerker..."
        value={zoekterm}
        onChange={(e) => setZoekterm(e.target.value)}
        style={{
          flex: 1,
          minWidth: "240px",
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid #d1d5db",
          fontSize: "15px",
        }}
      />

      <select
        style={{
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid #d1d5db",
          minWidth: "180px",
        }}
      >
        <option>🏭 Alle terminals</option>
      </select>

      <select
        style={{
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid #d1d5db",
          minWidth: "180px",
        }}
      >
        <option>👥 Alle teams</option>
      </select>

      <select
        style={{
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid #d1d5db",
          minWidth: "180px",
        }}
      >
        <option>📂 Alle afdelingen</option>
      </select>
    </div>
  );
}