// src/components/Sidebar.jsx

import { NavLink } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

export default function Sidebar() {
  const { profile } = useAuthContext();

  const rol = profile?.rol || "medewerker";

  const isAdmin = rol === "admin";
  const isPlanner = rol === "planner";
  const isOperations = rol === "operations";
  const isHR = rol === "hr";

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
          {(isAdmin || isPlanner || isOperations) && (
            <NavLink
              to="/jaarplanner"
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              🗓 Jaarplanner
            </NavLink>
          )}

          {/* Medewerkers */}
          {(isAdmin || isPlanner || isOperations || isHR) && (
            <NavLink
              to="/medewerkers"
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              👷 Medewerkers
            </NavLink>
          )}

          {/* Toolboxen */}
          <NavLink
            to="/toolboxen"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            📦 Toolboxen
          </NavLink>

          {/* Toolbox Vragen */}
          {(isAdmin || isHR || isOperations) && (
            <NavLink
              to="/toolboxvragen"
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              ❓ Toolbox Vragen
            </NavLink>
          )}

          {/* Mijn Toolboxen */}
          <NavLink
            to="/mijntoolboxen"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            🎓 Mijn Toolboxen
          </NavLink>

          {/* Gebruikersbeheer */}
          {isAdmin && (
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
          {(isAdmin || isOperations) && (
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
          {(isAdmin || isPlanner || isOperations) && (
            <NavLink
              to="/urenregistratie"
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              ⏱ Urenregistratie
            </NavLink>
          )}

          {/* Import / Export */}
          {(isAdmin || isPlanner || isOperations) && (
            <NavLink
              to="/import-export"
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              📥 Import / Export
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
          {(isAdmin || isOperations || isHR) && (
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
          {(isAdmin || isOperations) && (
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
        <strong>TR Planner v2.0</strong>
        <br />
        <small>Rol: {rol}</small>
      </div>
    </aside>
  );
}