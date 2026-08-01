export default function GebruikersStats({ gebruikers }) {
  return (
    <div className="stats-row">
      <div className="stat-card">
        <h3>{gebruikers.length}</h3>
        <span>Totaal</span>
      </div>

      <div className="stat-card">
        <h3>{gebruikers.filter((g) => g.actief).length}</h3>
        <span>Actief</span>
      </div>

      <div className="stat-card">
        <h3>{gebruikers.filter((g) => !g.actief).length}</h3>
        <span>Inactief</span>
      </div>

      <div className="stat-card">
        <h3>
          {gebruikers.filter((g) => g.rol === "admin").length}
        </h3>
        <span>Admins</span>
      </div>
    </div>
  );
}