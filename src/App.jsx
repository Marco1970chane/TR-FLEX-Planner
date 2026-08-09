import "./App.css";

import { Routes, Route } from "react-router-dom";

import Layout from "./layout/Layout";

// Beveiliging
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleGuard from "./components/auth/RoleGuard";

// Pagina's
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


export default function App() {
  return (
    <Routes>
      {/* ===========================
          Publieke routes
      ============================ */}

      <Route path="/login" element={<Login />} />

      <Route
        path="/set-password"
        element={<SetPassword />}
      />

      <Route
        path="/reageren/:token"
        element={<Reageren />}
      />

      {/* ===========================
          Beveiligde applicatie
      ============================ */}

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route
          path="/"
          element={<Dashboard />}
        />

        {/* Planning */}
        <Route
          path="/planning"
          element={<Planning />}
        />

        {/* Jaarplanner */}
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

        {/* Medewerkers */}
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

        {/* Toolboxen */}
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

        {/* Mijn Toolboxen */}
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

        {/* Gebruikersbeheer */}
        <Route
          path="/gebruikers"
          element={
            <RoleGuard roles={["admin"]}>
              <Gebruikers />
            </RoleGuard>
          }
        />

        {/* Terminals */}
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

        {/* Urenregistratie */}
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

        {/* Open diensten */}
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

        {/* Certificaten */}
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

        {/* Rapportages */}
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

      {/* ===========================
          404
      ============================ */}

      <Route
        path="*"
        element={
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              fontSize: "22px",
            }}
          >
            Pagina niet gevonden
          </div>
        }
      />
    </Routes>
  );
}