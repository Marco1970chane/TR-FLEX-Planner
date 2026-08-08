import { useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabase";

import UrenregistratieForm from "../components/UrenregistratieForm";
import UrenDashboard from "../components/uren/UrenDashboard";

export default function Urenregistratie() {
  const [uren, setUren] = useState([]);
  const [zoekterm, setZoekterm] = useState("");
  const [toonForm, setToonForm] = useState(false);

  useEffect(() => {
    laadUren();
  }, []);

  async function laadUren() {
    const { data, error } = await supabase
      .from("urenregistratie")
      .select("*")
      .order("datum", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setUren(data || []);
  }

  const gefilterd = uren.filter((u) => {
    const zoek = zoekterm.toLowerCase();

    return (
      (u.medewerker || "")
        .toLowerCase()
        .includes(zoek) ||
      (u.terminal || "")
        .toLowerCase()
        .includes(zoek)
    );
  });

  const totaalUren = useMemo(() => {
    return uren.reduce(
      (t, u) => t + Number(u.uren || 0),
      0
    );
  }, [uren]);

  const totaalMedewerkers = useMemo(() => {
    return new Set(
      uren.map((u) => u.medewerker)
    ).size;
  }, [uren]);

  const totaalTerminals = useMemo(() => {
    return new Set(
      uren.map((u) => u.terminal)
    ).size;
  }, [uren]);

  return (
    <>
      <div
        style={{
          background: "#f8fafc",
          minHeight: "100vh",
          padding: "25px",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "25px 30px",
            borderRadius: "18px",
            marginBottom: "20px",
            boxShadow:
              "0 8px 20px rgba(0,0,0,.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  color: "#15803d",
                }}
              >
                🕒 Urenregistratie
              </h1>

              <p
                style={{
                  color: "#64748b",
                }}
              >
                Registratie van gewerkte uren
              </p>
            </div>

            <button
              className="new-btn"
              style={{
                background: "#16a34a",
              }}
              onClick={() => setToonForm(true)}
            >
              + Nieuwe registratie
            </button>
          </div>
        </div>

        <UrenDashboard
          totaalUren={totaalUren.toFixed(1)}
          medewerkers={totaalMedewerkers}
          registraties={uren.length}
          terminals={totaalTerminals}
        />

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "20px",
            boxShadow:
              "0 8px 20px rgba(0,0,0,.08)",
          }}
        >
          <input
            type="text"
            placeholder="🔍 Zoek medewerker of terminal..."
            value={zoekterm}
            onChange={(e) =>
              setZoekterm(e.target.value)
            }
            style={{
              width: "100%",
              marginBottom: "20px",
            }}
          />

          <table>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Medewerker</th>
                <th>Terminal</th>
                <th>Van</th>
                <th>Tot</th>
                <th>Pauze</th>
                <th>Uren</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {gefilterd.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                    }}
                  >
                    Geen registraties gevonden.
                  </td>
                </tr>
              ) : (
                gefilterd.map((u) => (
                  <tr key={u.id}>
                    <td>{u.datum}</td>
                    <td>{u.medewerker}</td>
                    <td>{u.terminal}</td>
                    <td>{u.begintijd}</td>
                    <td>{u.eindtijd}</td>
                    <td>{u.pauze} min</td>
                    <td>{u.uren}</td>
                    <td>{u.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toonForm && (
        <div className="modal">
          <div
            className="modal-content"
            style={{
              maxWidth: "700px",
            }}
          >
            <UrenregistratieForm
              onSaved={() => {
                laadUren();
                setToonForm(false);
              }}
            />

            <button
              className="new-btn"
              style={{
                marginTop: "20px",
                width: "100%",
                background: "#16a34a",
              }}
              onClick={() =>
                setToonForm(false)
              }
            >
              Sluiten
            </button>
          </div>
        </div>
      )}
    </>
  );
}