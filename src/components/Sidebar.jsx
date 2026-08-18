// src/components/Sidebar.jsx

import { NavLink } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

export default function Sidebar() {
  const { profile } = useAuthContext();

  // Rol altijd naar kleine letters om problemen met
  // "Admin", "ADMIN" of "admin" te voorkomen.
  const rol = String(
    profile?.rol || "medewerker"
  )
    .trim()
    .toLowerCase();

  const isAdmin = rol === "admin";
  const isPlanner = rol === "planner";
  const isOperations = rol === "operations";
  const isHR = rol === "hr";

  function menuClass({ isActive }) {
    return isActive
      ? "menu-item active"
      : "menu-item";
  }

  return (
    <aside className="sidebar">
      <div>
        {/* =====================================================
            LOGO
        ====================================================== */}

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
          {/* ===================================================
              DASHBOARD
          ==================================================== */}

          <NavLink
            to="/"
            end
            className={menuClass}
          >
            📊 Dashboard
          </NavLink>

          {/* ===================================================
              PLANNING
          ==================================================== */}

          <NavLink
            to="/planning"
            className={menuClass}
          >
            📅 Planning
          </NavLink>

          {/* ===================================================
              JAARPLANNER
          ==================================================== */}

          {(isAdmin ||
            isPlanner ||
            isOperations) && (
            <NavLink
              to="/jaarplanner"
              className={menuClass}
            >
              🗓 Jaarplanner
            </NavLink>
          )}

          {/* ===================================================
              MEDEWERKERS
          ==================================================== */}

          {(isAdmin ||
            isPlanner ||
            isOperations ||
            isHR) && (
            <NavLink
              to="/medewerkers"
              className={menuClass}
            >
              👷 Medewerkers
            </NavLink>
          )}

          {/* ===================================================
              TOOLBOXEN
          ==================================================== */}

          <NavLink
            to="/toolboxen"
            className={menuClass}
          >
            📦 Toolboxen
          </NavLink>

          {/* ===================================================
              TOOLBOX VRAGEN
          ==================================================== */}

          {(isAdmin ||
            isHR ||
            isOperations) && (
            <NavLink
              to="/toolboxvragen"
              className={menuClass}
            >
              ❓ Toolbox Vragen
            </NavLink>
          )}

          {/* ===================================================
              MIJN TOOLBOXEN
          ==================================================== */}

          <NavLink
            to="/mijntoolboxen"
            className={menuClass}
          >
            🎓 Mijn Toolboxen
          </NavLink>

          {/* ===================================================
              GEBRUIKERSBEHEER
          ==================================================== */}

          {isAdmin && (
            <NavLink
              to="/gebruikers"
              className={menuClass}
            >
              👤 Gebruikersbeheer
            </NavLink>
          )}

          {/* ===================================================
              TERMINALS
          ==================================================== */}

          {(isAdmin ||
            isOperations) && (
            <NavLink
              to="/terminals"
              className={menuClass}
            >
              🏭 Terminals
            </NavLink>
          )}

          {/* ===================================================
              URENREGISTRATIE
          ==================================================== */}

          {(isAdmin ||
            isPlanner ||
            isOperations) && (
            <NavLink
              to="/urenregistratie"
              className={menuClass}
            >
              ⏱ Urenregistratie
            </NavLink>
          )}

          {/* ===================================================
              ZZP FACTUREN
              ADMIN + OPERATIONS
          ==================================================== */}

          {(isAdmin ||
            isOperations) && (
            <NavLink
              to="/zzp-facturen"
              className={menuClass}
            >
              💶 ZZP Facturen
            </NavLink>
          )}

          {/* ===================================================
              IMPORT / EXPORT
          ==================================================== */}

          {(isAdmin ||
            isPlanner ||
            isOperations) && (
            <NavLink
              to="/import-export"
              className={menuClass}
            >
              📥 Import / Export
            </NavLink>
          )}

          {/* ===================================================
              OPEN DIENSTEN
          ==================================================== */}

          <NavLink
            to="/opendiensten"
            className={menuClass}
          >
            📢 Open diensten
          </NavLink>

          {/* ===================================================
              CERTIFICATEN
          ==================================================== */}

          {(isAdmin ||
            isOperations ||
            isHR) && (
            <NavLink
              to="/certificaten"
              className={menuClass}
            >
              🏅 Certificaten
            </NavLink>
          )}

          {/* ===================================================
              RAPPORTAGES
          ==================================================== */}

          {(isAdmin ||
            isOperations) && (
            <NavLink
              to="/rapportages"
              className={menuClass}
            >
              📈 Rapportages
            </NavLink>
          )}
        </nav>
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}

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

        <small>
          Rol: {rol}
        </small>
      </div>
    </aside>
  );
}