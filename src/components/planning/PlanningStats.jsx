export default function PlanningStats({ planning }) {
  const totaal = planning.length;

  const open = planning.filter(
    (p) => p.status === "Open"
  ).length;

  const ingepland = planning.filter(
    (p) => p.status === "Ingepland"
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

  return (
    <div className="planning-stats">

      <div className="planning-stat-card">
        <span className="planning-stat-icon">📅</span>
        <h2>{totaal}</h2>
        <p>Diensten</p>
      </div>

      <div className="planning-stat-card">
        <span className="planning-stat-icon">📢</span>
        <h2>{open}</h2>
        <p>Open diensten</p>
      </div>

      <div className="planning-stat-card">
        <span className="planning-stat-icon">✅</span>
        <h2>{ingepland}</h2>
        <p>Ingepland</p>
      </div>

      <div className="planning-stat-card">
        <span className="planning-stat-icon">👷</span>
        <h2>{medewerkers}</h2>
        <p>Operators</p>
      </div>

      <div className="planning-stat-card">
        <span className="planning-stat-icon">🏭</span>
        <h2>{terminals}</h2>
        <p>Terminals</p>
      </div>

    </div>
  );
}