import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>🚢 TR-FLEX</h2>

      <nav>
        <NavLink to="/" end className="menu-item">
          📊 Dashboard
        </NavLink>

        <NavLink to="/planning" className="menu-item">
          📅 Planning
        </NavLink>

        <NavLink to="/medewerkers" className="menu-item">
          👷 Medewerkers
        </NavLink>

        <NavLink to="/terminals" className="menu-item">
          🏭 Terminals
        </NavLink>

        <NavLink to="/rapportages" className="menu-item">
          📈 Rapportages
        </NavLink>
      </nav>
    </aside>
  );
}