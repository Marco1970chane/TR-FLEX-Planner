export default function Sidebar() {
 return (
    <aside className="sidebar">
      <h2>🚢 TR-FLEX</h2>

      <nav>
        <div className="menu-item active">📊 Dashboard</div>
        <div className="menu-item">📅 Planning</div>
        <div className="menu-item">👷 Medewerkers</div>
        <div className="menu-item">🏭 Terminals</div>
        <div className="menu-item">📋 Aanvragen</div>
        <div className="menu-item">📈 Rapportages</div>
        <div className="menu-item">⚙️ Instellingen</div>
      </nav>
    </aside>
  );
}