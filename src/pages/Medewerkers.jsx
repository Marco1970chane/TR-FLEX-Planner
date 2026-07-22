import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import MedewerkerForm from "../components/MedewerkerForm";
import SearchBar from "../components/SearchBar";
import MedewerkerTable from "../components/MedewerkerTable";

export default function Medewerkers() {
  const [medewerkers, setMedewerkers] = useState([]);
  const [toonForm, setToonForm] = useState(false);
  const [zoekterm, setZoekterm] = useState("");
  const [geselecteerdeMedewerker, setGeselecteerdeMedewerker] = useState(null);

  useEffect(() => {
    laadMedewerkers();
  }, []);

  async function laadMedewerkers() {
    const { data, error } = await supabase
      .from("medewerkers")
      .select("*")
      .order("naam");

    if (error) {
      alert(error.message);
      return;
    }

    setMedewerkers(data);
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

  const gefilterdeMedewerkers = medewerkers.filter((m) =>
    m.naam?.toLowerCase().includes(zoekterm.toLowerCase())
  );

  return (
    <>
      <div className="table">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2>👷 Medewerkers</h2>

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

        <SearchBar
          value={zoekterm}
          onChange={setZoekterm}
        />

        <br />

        <MedewerkerTable
          medewerkers={gefilterdeMedewerkers}
          onEdit={(medewerker) => {
            setGeselecteerdeMedewerker(medewerker);
            setToonForm(true);
          }}
          onDelete={verwijderMedewerker}
        />
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
              style={{ marginTop: "15px" }}
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