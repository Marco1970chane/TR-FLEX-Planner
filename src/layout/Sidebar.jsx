// src/components/Sidebar.jsx

import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div>
        <h2>TR Planner</h2>

        <p
          style={{
            opacity: 0.7,
            marginTop: "-15px",
            marginBottom: "30px",
          }}
        >
          Terminal Recruiters
        </p>

        <nav>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            📊 Dashboard
          </NavLink>

          <NavLink
            to="/planning"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            📅 Planning
          </NavLink>

          <NavLink
  to="/jaarplanner"
  className={({ isActive }) =>
    isActive ? "menu-item active" : "menu-item"
  }
>
  🗓 Jaarplanner
</NavLink>

          <NavLink
            to="/medewerkers"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            👷 Medewerkers
          </NavLink>

        
<NavLink
  to="/toolboxen"
  className={({ isActive }) =>
    isActive ? "menu-item active" : "menu-item"
  }
>
  📦 Toolboxen
</NavLink>

<NavLink
  to="/gebruikers"
  className={({ isActive }) =>
    isActive ? "menu-item active" : "menu-item"
  }
>
  👤 Gebruikersbeheer
</NavLink>
          <NavLink
            to="/terminals"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            🏭 Terminals
          </NavLink>

          <NavLink
            to="/urenregistratie"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            ⏱ Urenregistratie
          </NavLink>

          <NavLink
            to="/opendiensten"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            📢 Open diensten
          </NavLink>

          <NavLink
            to="/certificaten"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            🏅 Certificaten
          </NavLink>

          <NavLink
            to="/rapportages"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            📈 Rapportages
          </NavLink>
        </nav>
      </div>

      <div
        style={{
          marginTop: "auto",
          paddingTop: "30px",
          fontSize: "13px",
          opacity: 0.7,
        }}
      >
        TR Planner v2.0
      </div>
    </aside>
  );
}