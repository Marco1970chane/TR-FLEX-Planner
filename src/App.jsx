import "./App.css";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Planning from "./pages/Planning";
import Medewerkers from "./pages/Medewerkers";
import Terminals from "./pages/Terminals";
import Rapportages from "./pages/Rapportages";

function App() {
  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <Header />

        <Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/planning" element={<Planning />} />
  <Route path="/medewerkers" element={<Medewerkers />} />
  <Route path="/terminals" element={<Terminals />} />
  <Route path="/rapportages" element={<Rapportages />} />
</Routes>
      </div>
    </div>
  );
}

export default App;