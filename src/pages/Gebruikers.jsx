import { useEffect, useMemo, useState } from "react";
import { supabase, inviteUser } from "../services/supabase";

import GebruikersStats from "../components/gebruikers/GebruikersStats";
import GebruikersFilters from "../components/gebruikers/GebruikersFilters";
import GebruikersTabel from "../components/gebruikers/GebruikersTabel";
import NieuweGebruikerModal from "../components/gebruikers/NieuweGebruikerModal";
import { resetPassword } from "../services/supabase";

export default function Gebruikers() {
  const [gebruikers, setGebruikers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [zoekterm, setZoekterm] = useState("");
  const [rolFilter, setRolFilter] = useState("alle");
  const [statusFilter, setStatusFilter] = useState("alle");

  const [popupOpen, setPopupOpen] = useState(false);

  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("medewerker");

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

  async function wijzigRol(id, nieuweRol) {
    const { error } = await supabase
      .from("profiles")
      .update({ rol: nieuweRol })
      .eq("id", id);

    if (!error) laadGebruikers();
  }

  async function wijzigStatus(id, actief) {
    const { error } = await supabase
      .from("profiles")
      .update({ actief })
      .eq("id", id);

    if (!error) laadGebruikers();
  }

  async function nieuweGebruiker() {
    try {
      const result = await inviteUser({
        naam,
        email,
        rol,
      });

      alert(result.message);

      setNaam("");
      setEmail("");
      setRol("medewerker");

      setPopupOpen(false);

      laadGebruikers();
    } catch (err) {
      alert(err.message);
    }
  }
  async function resetWachtwoord(email) {
  try {
    const result = await resetPassword(email);
    alert(result.message);
  } catch (err) {
    alert(err.message);
  }
}

  const gefilterdeGebruikers = useMemo(() => {
    return gebruikers.filter((g) => {
      const zoek =
        (g.naam || "").toLowerCase().includes(zoekterm.toLowerCase()) ||
        (g.email || "").toLowerCase().includes(zoekterm.toLowerCase());

      const rolOk =
        rolFilter === "alle" || g.rol === rolFilter;

      const statusOk =
        statusFilter === "alle" ||
        (statusFilter === "actief" && g.actief) ||
        (statusFilter === "inactief" && !g.actief);

      return zoek && rolOk && statusOk;
    });
  }, [gebruikers, zoekterm, rolFilter, statusFilter]);

  return (
    <div className="table">
      <div className="page-header">
        <div>
          <h2>👤 Gebruikersbeheer</h2>
          <p>{gebruikers.length} gebruikers</p>
        </div>

        <button
          className="new-btn"
          onClick={() => setPopupOpen(true)}
        >
          + Nieuwe gebruiker
        </button>
      </div>

      <GebruikersStats gebruikers={gebruikers} />

      <GebruikersFilters
        zoekterm={zoekterm}
        setZoekterm={setZoekterm}
        rolFilter={rolFilter}
        setRolFilter={setRolFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {loading ? (
        <p>Gebruikers laden...</p>
      ) : (
        <GebruikersTabel
          gebruikers={gefilterdeGebruikers}
          wijzigRol={wijzigRol}
          wijzigStatus={wijzigStatus}
           onResetPassword={resetWachtwoord}
        />
      )}

      <NieuweGebruikerModal
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        onSave={nieuweGebruiker}
        naam={naam}
        setNaam={setNaam}
        email={email}
        setEmail={setEmail}
        rol={rol}
        setRol={setRol}
      />
    </div>
  );
}
