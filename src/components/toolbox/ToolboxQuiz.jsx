import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import { useAuthContext } from "../../contexts/AuthContext";

export default function ToolboxQuiz({
  toolbox,
  onGeslaagd,
  onClose,
}) {
  const { profile } = useAuthContext();

  const [vragen, setVragen] = useState([]);
  const [index, setIndex] = useState(0);
  const [antwoorden, setAntwoorden] = useState({});
  const [klaar, setKlaar] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (toolbox) {
      laadVragen();
    }
  }, [toolbox]);

  async function laadVragen() {
    setLoading(true);

    const { data, error } = await supabase
      .from("toolbox_vragen")
      .select("*")
      .eq("toolbox_id", toolbox.id)
      .order("volgorde");

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setVragen(data || []);
    setLoading(false);
  }

  function kiesAntwoord(letter) {
    setAntwoorden((prev) => ({
      ...prev,
      [vragen[index].id]: letter,
    }));
  }

  async function slaResultaatOp(percentage) {
    if (!profile) return false;

    const geldigTot = new Date();
    geldigTot.setMonth(
      geldigTot.getMonth() + (toolbox.geldig_maanden || 12)
    );

    const { error } = await supabase
      .from("toolbox_resultaten")
      .upsert(
        {
          toolbox_id: toolbox.id,
          gebruiker_id: profile.id,
          gelezen: true,
          score: percentage,
          geslaagd: percentage >= 80,
          afgerond_op: new Date().toISOString(),
          geldig_tot: geldigTot
            .toISOString()
            .split("T")[0],
        },
        {
          onConflict: "toolbox_id,gebruiker_id",
        }
      );

    if (error) {
      console.error(error);
      alert(error.message);
      return false;
    }

    return true;
  }

  async function berekenScore() {
    let goed = 0;

    vragen.forEach((vraag) => {
      if (antwoorden[vraag.id] === vraag.juist) {
        goed++;
      }
    });

    const percentage = Math.round(
      (goed / vragen.length) * 100
    );

    setScore(percentage);

    const opgeslagen =
      await slaResultaatOp(percentage);

    if (!opgeslagen) return;

    setKlaar(true);

    if (percentage >= 80 && onGeslaagd) {
      onGeslaagd(percentage);
    }
  }

  function volgende() {
    if (index < vragen.length - 1) {
      setIndex(index + 1);
    } else {
      berekenScore();
    }
  }

  if (!toolbox) return null;

  if (loading) {
    return (
      <div className="modal">
        <div className="modal-content">
          <h2>Vragen laden...</h2>
        </div>
      </div>
    );
  }

  if (vragen.length === 0) {
    return (
      <div className="modal">
        <div className="modal-content">
          <h2>Geen vragen gevonden</h2>

          <p>
            Voor deze toolbox zijn nog geen
            toetsvragen aangemaakt.
          </p>

          <button
            className="new-btn"
            onClick={onClose}
          >
            Sluiten
          </button>
        </div>
      </div>
    );
  }

  if (klaar) {
    return (
      <div className="modal">
        <div
          className="modal-content"
          style={{
            maxWidth: "600px",
            textAlign: "center",
          }}
        >
          <h2>Resultaat</h2>

          <h1
            style={{
              fontSize: "60px",
              color:
                score >= 80
                  ? "#16a34a"
                  : "#dc2626",
            }}
          >
            {score}%
          </h1>

          {score >= 80 ? (
            <p
              style={{
                color: "#16a34a",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              🎉 Gefeliciteerd! Je bent geslaagd.
            </p>
          ) : (
            <p
              style={{
                color: "#dc2626",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              Helaas, je bent niet geslaagd.
              <br />
              Je kunt de toets opnieuw maken.
            </p>
          )}

          <button
            className="new-btn"
            onClick={onClose}
          >
            Sluiten
          </button>
        </div>
      </div>
    );
  }

  const vraag = vragen[index];

  return (
    <div className="modal">
      <div
        className="modal-content"
        style={{
          maxWidth: "700px",
        }}
      >
        <h2>
          Vraag {index + 1} van {vragen.length}
        </h2>

        <div
          style={{
            width: "100%",
            height: "8px",
            background: "#e5e7eb",
            borderRadius: "999px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              width: `${
                ((index + 1) /
                  vragen.length) *
                100
              }%`,
              height: "100%",
              background: "#2563eb",
              borderRadius: "999px",
            }}
          />
        </div>

        <h3>{vraag.vraag}</h3>

        {["A", "B", "C", "D"].map((letter) => {
          const tekst =
            vraag[
              `antwoord_${letter.toLowerCase()}`
            ];

          if (!tekst) return null;

          return (
            <label
              key={letter}
              style={{
                display: "block",
                padding: "12px",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                marginBottom: "12px",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="antwoord"
                checked={
                  antwoorden[vraag.id] ===
                  letter
                }
                onChange={() =>
                  kiesAntwoord(letter)
                }
              />

              {"  "}
              <strong>{letter}.</strong>{" "}
              {tekst}
            </label>
          );
        })}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "25px",
          }}
        >
          <button
            className="new-btn"
            disabled={index === 0}
            onClick={() =>
              setIndex(index - 1)
            }
          >
            ← Vorige
          </button>

          <button
            className="new-btn"
            disabled={
              !antwoorden[vraag.id]
            }
            onClick={volgende}
          >
            {index === vragen.length - 1
              ? "Toets afronden"
              : "Volgende →"}
          </button>
        </div>
      </div>
    </div>
  );
}