export default function ToolboxStats({ toolboxen }) {
  const actief = toolboxen.filter((t) => t.actief).length;
  const inactief = toolboxen.filter((t) => !t.actief).length;

  return (
    <div className="stats-row">
      <div className="stat-card">
        <h3>{toolboxen.length}</h3>
        <span>Totaal</span>
      </div>

      <div className="stat-card">
        <h3>{actief}</h3>
        <span>Actief</span>
      </div>

      <div className="stat-card">
        <h3>{inactief}</h3>
        <span>Inactief</span>
      </div>
    </div>
  );
}