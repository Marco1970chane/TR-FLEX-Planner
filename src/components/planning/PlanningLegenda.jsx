export default function PlanningLegenda() {
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        marginBottom: "20px",
        flexWrap: "wrap",
      }}
    >
      <span>🟢 Dagdienst</span>
      <span>🟠 Avonddienst</span>
      <span>🔵 Nachtdienst</span>
      <span>🟣 Vakantie</span>
      <span>🔴 Ziek</span>
      <span>🟡 Toolbox</span>
      <span>⚪ Vrij</span>
    </div>
  );
}