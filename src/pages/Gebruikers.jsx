import { useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabase";

export default function Gebruikers() {
  const [gebruikers, setGebruikers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [zoekterm, setZoekterm] = useState("");
  const [rolFilter, setRolFilter] = useState("alle");
  const [statusFilter, setStatusFilter] = useState("alle");

  useEffect(() => {
    laadGebruikers();
  }, []);

  async function laadGebruikers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("naam");

    if (error) {
      alert(error.message);
    } else {
      setGebruikers(data || []);
    }

    setLoading(false);
  }

  const gefilterdeGebruikers = useMemo(() => {
    return gebruikers.filter((g) => {
      const zoek =
        (g.naam || "").toLowerCase().includes(zoekterm.toLowerCase()) ||
        (g.email || "").toLowerCase().includes(zoekterm.toLowerCase());

      const rol =
        rolFilter === "alle" || g.rol === rolFilter;

      const status =
        statusFilter === "alle" ||
        (statusFilter === "actief" && g.actief) ||
        (statusFilter === "inactief" && !g.actief);

      return zoek && rol && status;
    });
  }, [gebruikers, zoekterm, rolFilter, statusFilter]);

  return (
    <div className="table">

      <div className="page-header">
        <div>
          <h2>👤 Gebruikersbeheer</h2>
          <p>{gebruikers.length} gebruikers</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <h3>{gebruikers.length}</h3>
          <span>Totaal</span>
        </div>

        <div className="stat-card">
          <h3>{gebruikers.filter(g => g.actief).length}</h3>
          <span>Actief</span>
        </div>

        <div className="stat-card">
          <h3>{gebruikers.filter(g => !g.actief).length}</h3>
          <span>Inactief</span>
        </div>

        <div className="stat-card">
          <h3>{gebruikers.filter(g => g.rol === "admin").length}</h3>
          <span>Admins</span>
        </div>
      </div>

      <div className="filters">
        <input
          className="search-input"
          type="text"
          placeholder="🔍 Zoek op naam of e-mail..."
          value={zoekterm}
          onChange={(e) => setZoekterm(e.target.value)}
        />

        <select
          value={rolFilter}
          onChange={(e) => setRolFilter(e.target.value)}
        >
          <option value="alle">Alle rollen</option>
          <option value="admin">Admin</option>
          <option value="operations">Operations</option>
          <option value="planner">Planner</option>
          <option value="hr">HR</option>
          <option value="medewerker">Medewerker</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="alle">Alle statussen</option>
          <option value="actief">Actief</option>
          <option value="inactief">Inactief</option>
        </select>
      </div>

      {loading ? (
        <p>Gebruikers laden...</p>
      ) : (
        <table className="medewerker-table">
          <thead>
            <tr>
              <th>Naam</th>
              <th>E-mail</th>
              <th>Rol</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {gefilterdeGebruikers.map((g) => (
              <tr key={g.id}>
                <td>{g.naam}</td>
                <td>{g.email}</td>
                <td>
  <span className={`role-badge role-${g.rol}`}>
    {g.rol}
  </span>
</td>
                <td>
                  {g.actief ? (
                    <span className="badge-active">🟢 Actief</span>
                  ) : (
                    <span className="badge-inactive">⚫ Inactief</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}