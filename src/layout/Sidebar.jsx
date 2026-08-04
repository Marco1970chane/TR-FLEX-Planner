// src/components/Sidebar.jsx

import { NavLink } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

export default function Sidebar() {
  const { profile } = useAuthContext();
  const rol = profile?.rol || "medewerker";

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
          {/* Dashboard */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            📊 Dashboard
          </NavLink>

          {/* Planning */}
          <NavLink
            to="/planning"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            📅 Planning
          </NavLink>

          {/* Jaarplanner */}
          <NavLink
            to="/jaarplanner"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            🗓 Jaarplanner
          </NavLink>

          {/* Medewerkers */}
          <NavLink
            to="/medewerkers"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            👷 Medewerkers
          </NavLink>

          {/* Toolboxen */}
          {["admin", "hr", "operations"].includes(rol) && (
            <NavLink
              to="/toolboxen"
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              📦 Toolboxen
            </NavLink>
          )}

          {/* Gebruikersbeheer */}
          {rol === "admin" && (
            <NavLink
              to="/gebruikers"
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              👤 Gebruikersbeheer
            </NavLink>
          )}

          {/* Terminals */}
          {rol === "admin" && (
            <NavLink
              to="/terminals"
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              🏭 Terminals
            </NavLink>
          )}

          {/* Urenregistratie */}
          {["admin", "operations", "planner"].includes(rol) && (
            <NavLink
              to="/urenregistratie"
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              ⏱ Urenregistratie
            </NavLink>
          )}

          {/* Open diensten */}
          <NavLink
            to="/opendiensten"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            📢 Open diensten
          </NavLink>

          {/* Certificaten */}
          {["admin", "operations", "hr"].includes(rol) && (
            <NavLink
              to="/certificaten"
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              🏅 Certificaten
            </NavLink>
          )}

          {/* Rapportages */}
          {["admin", "operations"].includes(rol) && (
            <NavLink
              to="/rapportages"
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              📈 Rapportages
            </NavLink>
          )}
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
        <br />
        <small>Rol: {rol}</small>
      </div>
    </aside>
  );
}