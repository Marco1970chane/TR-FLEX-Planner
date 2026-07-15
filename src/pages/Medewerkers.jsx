import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import MedewerkerForm from "../components/MedewerkerForm";

export default function Medewerkers() {
  const [medewerkers, setMedewerkers] = useState([]);
  const [toonForm, setToonForm] = useState(false);
  const [zoekterm, setZoekterm] = useState("");

  async function laadMedewerkers() {
    const { data, error } = await supabase
      .from("medewerkers")
      .select("*")
      .order("naam");

    if (!error) {
      setMedewerkers(data);
    }
  }

  useEffect(() => {
    laadMedewerkers();
  }, []);

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
            onClick={() => setToonForm(true)}
          >
            + Nieuwe medewerker
          </button>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="🔍 Zoek medewerker..."
            value={zoekterm}
            onChange={(e) => setZoekterm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>Naam</th>
              <th>Functie</th>
              <th>Terminal</th>
              <th>Status</th>
              <th>Acties</th>
            </tr>
          </thead>

          <tbody>
            {medewerkers
              .filter((m) =>
                m.naam.toLowerCase().includes(zoekterm.toLowerCase())
              )
              .map((m) => (
                <tr key={m.id}>
                  <td>{m.naam}</td>
                  <td>{m.functie}</td>
                  <td>{m.terminal}</td>
                  <td>{m.status}</td>

                  <td>
                    <button className="new-btn">✏️</button>

                    <button
                      className="new-btn"
                      style={{
                        marginLeft: "10px",
                        background: "#d9534f",
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {toonForm && (
        <div className="modal">
          <div className="modal-content">
            <MedewerkerForm
              onSaved={() => {
                laadMedewerkers();
                setToonForm(false);
              }}
            />

            <button
              className="new-btn"
              onClick={() => setToonForm(false)}
            >
              Sluiten
            </button>
          </div>
        </div>
      )}
    </>
  );
}