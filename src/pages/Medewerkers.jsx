import { useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabase";
import MedewerkerForm from "../components/MedewerkerForm";
import SearchBar from "../components/SearchBar";
import MedewerkerTable from "../components/MedewerkerTable";

export default function Medewerkers() {
  const [medewerkers, setMedewerkers] = useState([]);
  const [toonForm, setToonForm] = useState(false);
  const [zoekterm, setZoekterm] = useState("");
  const [geselecteerdeMedewerker, setGeselecteerdeMedewerker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    laadMedewerkers();
  }, []);

  async function laadMedewerkers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("medewerkers")
      .select("*")
      .order("naam");

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setMedewerkers(data || []);
  }

  async function verwijderMedewerker(id) {
    if (
      !window.confirm(
        "Weet je zeker dat je deze medewerker wilt verwijderen?"
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("medewerkers")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    laadMedewerkers();
  }

  const gefilterdeMedewerkers = useMemo(() => {
    return medewerkers.filter((m) =>
      m.naam?.toLowerCase().includes(zoekterm.toLowerCase())
    );
  }, [medewerkers, zoekterm]);

  return (
    <>
      <div className="table">

        <div className="page-header">

          <div>
            <h2>👷 Medewerkers</h2>
            <p>
              {gefilterdeMedewerkers.length} van {medewerkers.length} medewerkers
            </p>
          </div>

          <button
            className="new-btn"
            onClick={() => {
              setGeselecteerdeMedewerker(null);
              setToonForm(true);
            }}
          >
            + Nieuwe medewerker
          </button>

        </div>

        <div className="stats-row">

          <div className="stat-card">
            <h3>{medewerkers.length}</h3>
            <span>Totaal</span>
          </div>

          <div className="stat-card">
            <h3>{gefilterdeMedewerkers.length}</h3>
            <span>Resultaten</span>
          </div>

        </div>

        <SearchBar
          value={zoekterm}
          onChange={setZoekterm}
        />

        <br />

        {loading ? (
          <div style={{ padding: 30, textAlign: "center" }}>
            Medewerkers laden...
          </div>
        ) : (
          <MedewerkerTable
            medewerkers={gefilterdeMedewerkers}
            onEdit={(medewerker) => {
              setGeselecteerdeMedewerker(medewerker);
              setToonForm(true);
            }}
            onDelete={verwijderMedewerker}
          />
        )}

      </div>

      {toonForm && (
        <div className="modal">
          <div className="modal-content">

            <MedewerkerForm
              medewerker={geselecteerdeMedewerker}
              onSaved={() => {
                laadMedewerkers();
                setToonForm(false);
                setGeselecteerdeMedewerker(null);
              }}
            />

            <button
              className="new-btn"
              style={{ marginTop: 15 }}
              onClick={() => {
                setToonForm(false);
                setGeselecteerdeMedewerker(null);
              }}
            >
              Sluiten
            </button>

          </div>
        </div>
      )}
    </>
  );
}