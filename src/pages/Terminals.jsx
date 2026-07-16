import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import TerminalForm from "../components/TerminalForm";

export default function Terminals() {
  const [terminals, setTerminals] = useState([]);
  const [toonForm, setToonForm] = useState(false);
  const [zoekterm, setZoekterm] = useState("");

  async function laadTerminals() {
    const { data, error } = await supabase
      .from("terminals")
      .select("*")
      .order("naam");

    if (!error) {
      setTerminals(data);
    } else {
      console.log(error);
    }
  }

  useEffect(() => {
    laadTerminals();
  }, []);

  const gefilterdeTerminals = terminals.filter((t) =>
    t.naam.toLowerCase().includes(zoekterm.toLowerCase())
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
          <h2>🏭 Terminals</h2>

          <button
            className="new-btn"
            onClick={() => setToonForm(true)}
          >
            + Nieuwe terminal
          </button>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="🔍 Zoek terminal..."
            value={zoekterm}
            onChange={(e) => setZoekterm(e.target.value)}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>Naam</th>
              <th>Locatie</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {gefilterdeTerminals.map((terminal) => (
              <tr key={terminal.id}>
                <td>{terminal.naam}</td>
                <td>{terminal.locatie}</td>
                <td>{terminal.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toonForm && (
        <div className="modal">
          <div className="modal-content">
            <TerminalForm
              onSaved={() => {
                laadTerminals();
                setToonForm(false);
              }}
            />

            <button
              className="new-btn"
              style={{ marginTop: "15px" }}
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