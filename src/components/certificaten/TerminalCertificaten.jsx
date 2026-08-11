import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";

export default function TerminalCertificaten() {
  const [terminals, setTerminals] = useState([]);
  const [terminalId, setTerminalId] = useState("");
  const [certificaten, setCertificaten] = useState([]);
  const [nieuwCertificaat, setNieuwCertificaat] =
    useState("");
  const [laden, setLaden] = useState(false);

  useEffect(() => {
    laadTerminals();
  }, []);

  useEffect(() => {
    if (terminalId) {
      laadCertificaten();
    } else {
      setCertificaten([]);
    }
  }, [terminalId]);

  async function laadTerminals() {
    const { data, error } = await supabase
      .from("terminals")
      .select("id, naam")
      .order("naam");

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setTerminals(data || []);
  }

  async function laadCertificaten() {
    setLaden(true);

    const { data, error } = await supabase
      .from("terminal_certificaten")
      .select("*")
      .eq("terminal_id", terminalId)
      .eq("verplicht", true)
      .order("certificaat");

    setLaden(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setCertificaten(data || []);
  }

  async function toevoegen(e) {
    e.preventDefault();

    const naam = nieuwCertificaat.trim();

    if (!naam) {
      alert("Vul een certificaatnaam in.");
      return;
    }

    const bestaat = certificaten.some(
      (cert) =>
        cert.certificaat.toLowerCase() ===
        naam.toLowerCase()
    );

    if (bestaat) {
      alert("Dit certificaat is al verplicht.");
      return;
    }

    const terminal = terminals.find(
      (t) => String(t.id) === String(terminalId)
    );

    if (!terminal) {
      alert("Terminal niet gevonden.");
      return;
    }

    const { error } = await supabase
      .from("terminal_certificaten")
      .insert([
        {
          terminal_id: terminal.id,
          terminal: terminal.naam,
          certificaat: naam,
          verplicht: true,
        },
      ]);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setNieuwCertificaat("");

    await laadCertificaten();

    alert("✅ Certificaat toegevoegd.");
  }

  async function verwijderen(id) {
    const akkoord = window.confirm(
      "Weet je zeker dat je dit verplichte certificaat wilt verwijderen?"
    );

    if (!akkoord) return;

    const { error } = await supabase
      .from("terminal_certificaten")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    await laadCertificaten();

    alert("✅ Certificaat verwijderd.");
  }

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "25px",
        borderRadius: "16px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          color: "#15803d",
        }}
      >
        🏭 Verplichte certificaten per terminal
      </h2>

      <p style={{ color: "#64748b" }}>
        Stel hier in welke certificaten verplicht
        zijn om op een terminal te mogen werken.
      </p>

      <label
        style={{
          display: "block",
          marginBottom: "8px",
          fontWeight: "600",
        }}
      >
        Terminal
      </label>

      <select
        value={terminalId}
        onChange={(e) =>
          setTerminalId(e.target.value)
        }
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
          marginBottom: "20px",
        }}
      >
        <option value="">
          Kies terminal...
        </option>

        {terminals.map((terminal) => (
          <option
            key={terminal.id}
            value={terminal.id}
          >
            {terminal.naam}
          </option>
        ))}
      </select>

      {terminalId && (
        <>
          <h3>Verplichte certificaten</h3>

          {laden ? (
            <p>⏳ Laden...</p>
          ) : certificaten.length === 0 ? (
            <div
              style={{
                padding: "15px",
                background: "#f8fafc",
                borderRadius: "10px",
                color: "#64748b",
              }}
            >
              Nog geen verplichte certificaten
              ingesteld.
            </div>
          ) : (
            <div>
              {certificaten.map((cert) => (
                <div
                  key={cert.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px",
                    marginBottom: "8px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "10px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "600",
                      color: "#166534",
                    }}
                  >
                    🏅 {cert.certificaat}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      verwijderen(cert.id)
                    }
                    style={{
                      border: "none",
                      background: "#fee2e2",
                      color: "#b91c1c",
                      padding: "7px 12px",
                      borderRadius: "7px",
                      cursor: "pointer",
                    }}
                  >
                    🗑 Verwijder
                  </button>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={toevoegen}
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <input
              type="text"
              value={nieuwCertificaat}
              onChange={(e) =>
                setNieuwCertificaat(e.target.value)
              }
              placeholder="Bijv. VCA"
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
              }}
            />

            <button
              type="submit"
              className="new-btn"
            >
              ➕ Toevoegen
            </button>
          </form>
        </>
      )}
    </div>
  );
}