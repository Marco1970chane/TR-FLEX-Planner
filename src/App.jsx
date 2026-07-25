import "./App.css";

import { Routes, Route } from "react-router-dom";

import Layout from "./layout/Layout";

import Dashboard from "./pages/Dashboard";
import Planning from "./pages/Planning";
import Medewerkers from "./pages/Medewerkers";
import Terminals from "./pages/Terminals";
import Rapportages from "./pages/Rapportages";
import Urenregistratie from "./pages/Urenregistratie";
import OpenDiensten from "./pages/OpenDiensten";
import Reageren from "./pages/ReagerenPagina";
import Certificaten from "./pages/Certificaten";

export default function App() {
  return (
    <Routes>
      <Route path="/reageren/:token" element={<Reageren />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/planning" element={<Planning />} />
        <Route path="/medewerkers" element={<Medewerkers />} />
        <Route path="/terminals" element={<Terminals />} />
        <Route path="/urenregistratie" element={<Urenregistratie />} />
        <Route path="/opendiensten" element={<OpenDiensten />} />
        <Route path="/certificaten" element={<Certificaten />} />
        <Route path="/rapportages" element={<Rapportages />} />
      </Route>
    </Routes>
  );
}