// src/App.jsx

import "./App.css";

import { Routes, Route } from "react-router-dom";

import Layout from "./layout/Layout";

// ============================================================
// BEVEILIGING
// ============================================================

import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleGuard from "./components/auth/RoleGuard";

// ============================================================
// PAGINA'S
// ============================================================

import Login from "./pages/Auth/Login";
import SetPassword from "./pages/Auth/SetPassword";

import Dashboard from "./pages/Dashboard";
import Planning from "./pages/Planning";
import JaarPlanner from "./pages/JaarPlanner";
import Medewerkers from "./pages/Medewerkers";
import Terminals from "./pages/Terminals";
import Rapportages from "./pages/Rapportages";
import Urenregistratie from "./pages/Urenregistratie";
import OpenDiensten from "./pages/OpenDiensten";
import Reageren from "./pages/ReagerenPagina";
import Certificaten from "./pages/Certificaten";
import Gebruikers from "./pages/Gebruikers";
import Toolboxen from "./pages/Toolboxen";
import MijnToolboxen from "./pages/MijnToolboxen";
import ToolboxVragen from "./pages/ToolboxVragen";
import ImportExport from "./pages/ImportExport";

// ============================================================
// NIEUW
// ZZP FACTUREN
// ============================================================

import ZZPFacturen from "./pages/ZZPFacturen";

// ============================================================
// APP
// ============================================================

export default function App() {
  return (
    <Routes>
      {/* ======================================================
          PUBLIEKE ROUTES
      ======================================================= */}

      {/* Login */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* Wachtwoord instellen */}
      <Route
        path="/set-password"
        element={<SetPassword />}
      />

      {/* Reageren op open dienst */}
      <Route
        path="/reageren/:token"
        element={<Reageren />}
      />

      {/* ======================================================
          BEVEILIGDE APPLICATIE
      ======================================================= */}

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* ====================================================
            DASHBOARD
        ===================================================== */}

        <Route
          path="/"
          element={<Dashboard />}
        />

        {/* ====================================================
            PLANNING
        ===================================================== */}

        <Route
          path="/planning"
          element={<Planning />}
        />

        {/* ====================================================
            JAARPLANNER
        ===================================================== */}

        <Route
          path="/jaarplanner"
          element={
            <RoleGuard
              roles={[
                "admin",
                "planner",
                "operations",
              ]}
            >
              <JaarPlanner />
            </RoleGuard>
          }
        />

        {/* ====================================================
            MEDEWERKERS
        ===================================================== */}

        <Route
          path="/medewerkers"
          element={
            <RoleGuard
              roles={[
                "admin",
                "planner",
                "operations",
                "hr",
              ]}
            >
              <Medewerkers />
            </RoleGuard>
          }
        />

        {/* ====================================================
            TOOLBOXEN
        ===================================================== */}

        <Route
          path="/toolboxen"
          element={
            <RoleGuard
              roles={[
                "admin",
                "operations",
                "hr",
                "planner",
                "medewerker",
              ]}
            >
              <Toolboxen />
            </RoleGuard>
          }
        />

        {/* ====================================================
            MIJN TOOLBOXEN
        ===================================================== */}

        <Route
          path="/mijntoolboxen"
          element={
            <RoleGuard
              roles={[
                "admin",
                "operations",
                "hr",
                "planner",
                "medewerker",
              ]}
            >
              <MijnToolboxen />
            </RoleGuard>
          }
        />

        {/* ====================================================
            TOOLBOX VRAGEN
        ===================================================== */}

        <Route
          path="/toolboxvragen"
          element={
            <RoleGuard
              roles={[
                "admin",
                "operations",
                "hr",
              ]}
            >
              <ToolboxVragen />
            </RoleGuard>
          }
        />

        {/* ====================================================
            GEBRUIKERSBEHEER
        ===================================================== */}

        <Route
          path="/gebruikers"
          element={
            <RoleGuard
              roles={["admin"]}
            >
              <Gebruikers />
            </RoleGuard>
          }
        />

        {/* ====================================================
            TERMINALS
        ===================================================== */}

        <Route
          path="/terminals"
          element={
            <RoleGuard
              roles={[
                "admin",
                "operations",
              ]}
            >
              <Terminals />
            </RoleGuard>
          }
        />

        {/* ====================================================
            URENREGISTRATIE
        ===================================================== */}

        <Route
          path="/urenregistratie"
          element={
            <RoleGuard
              roles={[
                "admin",
                "operations",
                "planner",
              ]}
            >
              <Urenregistratie />
            </RoleGuard>
          }
        />

        {/* ====================================================
            ZZP FACTUREN
        ===================================================== */}

        <Route
          path="/zzp-facturen"
          element={
            <RoleGuard
              roles={[
                "admin",
                "operations",
              ]}
            >
              <ZZPFacturen />
            </RoleGuard>
          }
        />

        {/* ====================================================
            IMPORT / EXPORT
        ===================================================== */}

        <Route
          path="/import-export"
          element={
            <RoleGuard
              roles={[
                "admin",
                "operations",
                "planner",
              ]}
            >
              <ImportExport />
            </RoleGuard>
          }
        />

        {/* ====================================================
            OPEN DIENSTEN
        ===================================================== */}

        <Route
          path="/opendiensten"
          element={
            <RoleGuard
              roles={[
                "admin",
                "operations",
                "planner",
                "medewerker",
              ]}
            >
              <OpenDiensten />
            </RoleGuard>
          }
        />

        {/* ====================================================
            CERTIFICATEN
        ===================================================== */}

        <Route
          path="/certificaten"
          element={
            <RoleGuard
              roles={[
                "admin",
                "operations",
                "hr",
              ]}
            >
              <Certificaten />
            </RoleGuard>
          }
        />

        {/* ====================================================
            RAPPORTAGES
        ===================================================== */}

        <Route
          path="/rapportages"
          element={
            <RoleGuard
              roles={[
                "admin",
                "operations",
              ]}
            >
              <Rapportages />
            </RoleGuard>
          }
        />
      </Route>

      {/* ======================================================
          404
      ======================================================= */}

      <Route
        path="*"
        element={
          <div
            style={{
              minHeight:
                "100vh",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              padding:
                "40px",
              textAlign:
                "center",
              fontSize:
                "22px",
              color:
                "#334155",
              background:
                "#f8fafc",
            }}
          >
            <div>
              <div
                style={{
                  fontSize:
                    "50px",
                  marginBottom:
                    "15px",
                }}
              >
                ❓
              </div>

              <strong>
                Pagina niet gevonden
              </strong>

              <div
                style={{
                  marginTop:
                    "8px",
                  fontSize:
                    "14px",
                  color:
                    "#64748b",
                }}
              >
                De opgevraagde pagina
                bestaat niet.
              </div>
            </div>
          </div>
        }
      />
    </Routes>
  );
}