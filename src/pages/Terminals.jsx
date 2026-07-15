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
    }
  }

  useEffect(() => {
    laadTerminals();
  }, []);

  async function verwijderTerminal(id) {
    if (!confirm("Weet je zeker dat je deze terminal wilt verwijderen?")) {
      return;
    }

    const { error } = await supabase
      .from("terminals")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    laadTerminals();
  }

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
              <th>Acties</th>
            </tr>
          </thead>

          <tbody>
            {terminals
              .filter((t) =>
                t.naam.toLowerCase().includes(zoekterm.toLowerCase())
              )
              .map((t) => (
                <tr key={t.id}>
                  <td>{t.naam}</td>
                  <td>{t.locatie}</td>
                  <td>{t.status}</td>

                  <td>
                    <button className="new-btn">
                      ✏️
                    </button>

                    <button
                      className="new-btn"
                      style={{
                        marginLeft: "10px",
                        background: "#dc3545",
                      }}
                      onClick={() => verwijderTerminal(t.id)}
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