import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function Reageren() {
  const { token } = useParams();

  const [aanbieding, setAanbieding] = useState(null);
  const [planning, setPlanning] = useState(null);
  const [urenregistratie, setUrenregistratie] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actieLoading, setActieLoading] = useState(false);
  const [urenLoading, setUrenLoading] = useState(false);

  const [klaar, setKlaar] = useState(false);
  const [melding, setMelding] = useState("");
  const [fout, setFout] = useState("");

  // Uren
  const [starttijd, setStarttijd] = useState("");
  const [eindtijd, setEindtijd] = useState("");
  const [pauze, setPauze] = useState("30");
  const [opmerking, setOpmerking] = useState("");

  useEffect(() => {
    if (token) {
      laadGegevens();
    }
  }, [token]);

  async function laadGegevens() {
    setLoading(true);
    setFout("");

    try {
      // ----------------------------------------
      // AANBIEDING OPHALEN
      // ----------------------------------------

      const {
        data: aanbiedingData,
        error: aanbiedingError,
      } = await supabase
        .from("dienst_aanbiedingen")
        .select("*")
        .eq("token", token)
        .maybeSingle();

      if (aanbiedingError) {
        console.error(
          "Fout bij laden aanbieding:",
          aanbiedingError
        );

        setFout(
          "Er is een fout opgetreden bij het laden van de uitnodiging."
        );

        setLoading(false);
        return;
      }

      if (!aanbiedingData) {
        setFout(
          "Deze uitnodiging is niet gevonden of bestaat niet meer."
        );

        setLoading(false);
        return;
      }

      setAanbieding(aanbiedingData);

      // ----------------------------------------
      // PLANNING OPHALEN
      // ----------------------------------------

      const {
        data: planningData,
        error: planningError,
      } = await supabase
        .from("planning")
        .select("*")
        .eq("id", aanbiedingData.planning_id)
        .maybeSingle();

      if (planningError) {
        console.error(
          "Fout bij laden planning:",
          planningError
        );

        setFout(
          "De bijbehorende dienst kon niet worden geladen."
        );

        setLoading(false);
        return;
      }

      if (!planningData) {
        setFout(
          "De bijbehorende dienst bestaat niet meer."
        );

        setLoading(false);
        return;
      }

      setPlanning(planningData);

      // ----------------------------------------
      // BESTAANDE URENREGISTRATIE OPHALEN
      // ----------------------------------------

      const {
        data: urenData,
        error: urenError,
      } = await supabase
        .from("urenregistratie")
        .select("*")
        .eq("planning_id", aanbiedingData.planning_id)
        .eq("medewerker", aanbiedingData.medewerker)
        .order("ingediend_op", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (urenError) {
        console.error(
          "Fout bij laden urenregistratie:",
          urenError
        );
      }

      if (urenData) {
        setUrenregistratie(urenData);

        setStarttijd(
          urenData.starttijd
            ? String(urenData.starttijd).substring(0, 5)
            : ""
        );

        setEindtijd(
          urenData.eindtijd
            ? String(urenData.eindtijd).substring(0, 5)
            : ""
        );

        setPauze(
          urenData.pauze_minuten != null
            ? String(urenData.pauze_minuten)
            : "30"
        );

        setOpmerking(
          urenData.opmerking || ""
        );
      }

      // ----------------------------------------
      // STATUS CONTROLEREN
      // ----------------------------------------

      if (
        aanbiedingData.status ===
        "Geaccepteerd"
      ) {
        setMelding(
          "Deze dienst is door jou geaccepteerd."
        );
      }

      if (
        aanbiedingData.status ===
        "Geweigerd"
      ) {
        setMelding(
          "Je hebt deze dienst al geweigerd."
        );

        setKlaar(true);
      }

      if (
        aanbiedingData.status ===
        "Vervallen"
      ) {
        setMelding(
          "Deze dienst is inmiddels door iemand anders ingevuld."
        );

        setKlaar(true);
      }

      if (
        planningData.status === "Ingepland" &&
        aanbiedingData.status !==
          "Geaccepteerd"
      ) {
        setMelding(
          `Deze dienst is inmiddels door ${planningData.medewerker || "een andere medewerker"} ingevuld.`
        );

        setKlaar(true);
      }
    } catch (error) {
      console.error(
        "Onverwachte fout:",
        error
      );

      setFout(
        "Er is een onverwachte fout opgetreden."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // DIENST ACCEPTEREN
  // ============================================================

  async function accepteer() {
    if (!aanbieding || !planning) {
      return;
    }

    if (actieLoading) {
      return;
    }

    if (
      aanbieding.status !== "Verzonden"
    ) {
      setMelding(
        "Deze aanbieding kan niet meer worden geaccepteerd."
      );

      return;
    }

    setActieLoading(true);
    setFout("");

    try {
      // ----------------------------------------
      // ACTUELE PLANNING CONTROLEREN
      // ----------------------------------------

      const {
        data: actuelePlanning,
        error: planningCheckError,
      } = await supabase
        .from("planning")
        .select("*")
        .eq("id", aanbieding.planning_id)
        .single();

      if (planningCheckError) {
        throw planningCheckError;
      }

      if (
        actuelePlanning.status ===
          "Ingepland" &&
        actuelePlanning.medewerker
      ) {
        setMelding(
          `Helaas, deze dienst is inmiddels al ingevuld door ${actuelePlanning.medewerker}.`
        );

        setKlaar(true);
        return;
      }

      // ----------------------------------------
      // AANBIEDING ACCEPTEREN
      // ----------------------------------------

      const {
        data: updateAanbieding,
        error: aanbiedingError,
      } = await supabase
        .from("dienst_aanbiedingen")
        .update({
          status: "Geaccepteerd",
          reactie_op:
            new Date().toISOString(),
        })
        .eq("id", aanbieding.id)
        .eq("status", "Verzonden")
        .select()
        .maybeSingle();

      if (aanbiedingError) {
        throw aanbiedingError;
      }

      if (!updateAanbieding) {
        setMelding(
          "Deze aanbieding is inmiddels al verwerkt."
        );

        return;
      }

      // ----------------------------------------
      // PLANNING BIJWERKEN
      // ----------------------------------------

      const {
        error: planningError,
      } = await supabase
        .from("planning")
        .update({
          medewerker:
            aanbieding.medewerker,
          status: "Ingepland",
        })
        .eq("id", aanbieding.planning_id);

      if (planningError) {
        throw planningError;
      }

      // ----------------------------------------
      // ANDERE AANBIEDINGEN VERVALLEN
      // ----------------------------------------

      const {
        error: vervallenError,
      } = await supabase
        .from("dienst_aanbiedingen")
        .update({
          status: "Vervallen",
        })
        .eq(
          "planning_id",
          aanbieding.planning_id
        )
        .neq("id", aanbieding.id)
        .eq("status", "Verzonden");

      if (vervallenError) {
        console.error(
          "Fout bij vervallen andere aanbiedingen:",
          vervallenError
        );
      }

      // ----------------------------------------
      // STATE BIJWERKEN
      // ----------------------------------------

      setAanbieding({
        ...aanbieding,
        status: "Geaccepteerd",
      });

      setPlanning({
        ...planning,
        medewerker:
          aanbieding.medewerker,
        status: "Ingepland",
      });

      setMelding(
        "Bedankt! De dienst is aan jou toegewezen."
      );
    } catch (error) {
      console.error(
        "Fout bij accepteren:",
        error
      );

      setFout(
        "De dienst kon niet worden geaccepteerd. Probeer het opnieuw."
      );
    } finally {
      setActieLoading(false);
    }
  }

  // ============================================================
  // DIENST WEIGEREN
  // ============================================================

  async function weiger() {
    if (!aanbieding) {
      return;
    }

    if (actieLoading) {
      return;
    }

    if (
      aanbieding.status !== "Verzonden"
    ) {
      setMelding(
        "Deze aanbieding is al verwerkt."
      );

      return;
    }

    setActieLoading(true);
    setFout("");

    try {
      const {
        data: updateAanbieding,
        error,
      } = await supabase
        .from("dienst_aanbiedingen")
        .update({
          status: "Geweigerd",
          reactie_op:
            new Date().toISOString(),
        })
        .eq("id", aanbieding.id)
        .eq("status", "Verzonden")
        .select()
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!updateAanbieding) {
        setMelding(
          "Deze aanbieding is inmiddels al verwerkt."
        );

        return;
      }

      setAanbieding({
        ...aanbieding,
        status: "Geweigerd",
      });

      setMelding(
        "Je hebt de dienst geweigerd."
      );

      setKlaar(true);
    } catch (error) {
      console.error(
        "Fout bij weigeren:",
        error
      );

      setFout(
        "De dienst kon niet worden geweigerd. Probeer het opnieuw."
      );
    } finally {
      setActieLoading(false);
    }
  }

  // ============================================================
  // GEWERKTE UREN BEREKENEN
  // ============================================================

  function berekenUren() {
    if (!starttijd || !eindtijd) {
      return 0;
    }

    const [startUur, startMinuut] =
      starttijd.split(":").map(Number);

    const [eindUur, eindMinuut] =
      eindtijd.split(":").map(Number);

    let start =
      startUur * 60 + startMinuut;

    let einde =
      eindUur * 60 + eindMinuut;

    // Nachtdienst
    if (einde <= start) {
      einde += 24 * 60;
    }

    const pauzeMinuten =
      Number(pauze) || 0;

    const totaalMinuten =
      einde -
      start -
      pauzeMinuten;

    if (totaalMinuten <= 0) {
      return 0;
    }

    return (
      Math.round(
        (totaalMinuten / 60) * 100
      ) / 100
    );
  }

  const gewerkteUren =
    berekenUren();

  // ============================================================
  // UREN INDIENEN
  // ============================================================

  async function dienUrenIn() {
    if (!aanbieding || !planning) {
      return;
    }

    if (urenLoading) {
      return;
    }

    if (!starttijd || !eindtijd) {
      alert(
        "Vul zowel de starttijd als eindtijd in."
      );
      return;
    }

    if (gewerkteUren <= 0) {
      alert(
        "Het aantal gewerkte uren moet groter zijn dan 0."
      );
      return;
    }

    setUrenLoading(true);
    setFout("");

    try {
      // ----------------------------------------
      // BESTAANDE REGISTRATIE CONTROLEREN
      // ----------------------------------------

      const {
        data: bestaandeUren,
        error: bestaandeError,
      } = await supabase
        .from("urenregistratie")
        .select("*")
        .eq(
          "planning_id",
          planning.id
        )
        .eq(
          "medewerker",
          aanbieding.medewerker
        )
        .maybeSingle();

      if (bestaandeError) {
        console.error(
          "Fout bij controleren uren:",
          bestaandeError
        );
      }

      // ----------------------------------------
      // UPDATE BESTAANDE REGISTRATIE
      // ----------------------------------------

      if (bestaandeUren) {
        const {
          data,
          error,
        } = await supabase
          .from("urenregistratie")
          .update({
            datum:
              planning.datum,
            starttijd,
            eindtijd,
            pauze_minuten:
              Number(pauze) || 0,
            gewerkte_uren:
              gewerkteUren,
            opmerking:
              opmerking.trim() || null,
            status: "Ingediend",
            ingediend_op:
              new Date().toISOString(),
          })
          .eq("id", bestaandeUren.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        setUrenregistratie(data);

        alert(
          "De gewerkte uren zijn bijgewerkt."
        );

        return;
      }

      // ----------------------------------------
      // NIEUWE REGISTRATIE
      // ----------------------------------------

      const {
        data,
        error,
      } = await supabase
        .from("urenregistratie")
        .insert({
          planning_id:
            planning.id,

          medewerker:
            aanbieding.medewerker,

          datum:
            planning.datum,

          starttijd,

          eindtijd,

          pauze_minuten:
            Number(pauze) || 0,

          gewerkte_uren:
            gewerkteUren,

          opmerking:
            opmerking.trim() || null,

          status:
            "Ingediend",

          ingediend_op:
            new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setUrenregistratie(data);

      alert(
        "De gewerkte uren zijn succesvol ingediend."
      );
    } catch (error) {
      console.error(
        "Fout bij indienen uren:",
        error
      );

      setFout(
        "De gewerkte uren konden niet worden opgeslagen. Probeer het opnieuw."
      );
    } finally {
      setUrenLoading(false);
    }
  }

  // ============================================================
  // LADEN
  // ============================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.logo}>
            TR-FLEX
          </div>

          <div style={styles.loader}>
            ⏳
          </div>

          <h2 style={styles.title}>
            Uitnodiging laden...
          </h2>

          <p style={styles.text}>
            Even geduld.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // FOUT
  // ============================================================

  if (fout && !aanbieding) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.logo}>
            TR-FLEX
          </div>

          <div style={styles.errorIcon}>
            ❌
          </div>

          <h2 style={styles.title}>
            Er is iets misgegaan
          </h2>

          <p style={styles.text}>
            {fout}
          </p>
        </div>
      </div>
    );
  }

  if (!aanbieding || !planning) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.logo}>
            TR-FLEX
          </div>

          <div style={styles.errorIcon}>
            ❌
          </div>

          <h2 style={styles.title}>
            Uitnodiging niet gevonden
          </h2>

          <p style={styles.text}>
            Deze uitnodiging is niet beschikbaar.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // GEWEIGERD / VERVALLEN
  // ============================================================

  if (klaar) {
    const geaccepteerd =
      aanbieding.status ===
      "Geaccepteerd";

    return (
      <div style={styles.page}>
        <div style={styles.card}>

          <div style={styles.logo}>
            TR-FLEX
          </div>

          <div
            style={
              geaccepteerd
                ? styles.successIcon
                : styles.resultIcon
            }
          >
            {geaccepteerd
              ? "✅"
              : aanbieding.status ===
                "Geweigerd"
              ? "❌"
              : "ℹ️"}
          </div>

          <h2 style={styles.title}>
            {geaccepteerd
              ? "Dienst bevestigd"
              : "Reactie ontvangen"}
          </h2>

          <p style={styles.text}>
            {melding}
          </p>

          {geaccepteerd && (
            <>
              <div style={styles.confirmation}>
                <strong>
                  {planning.datum}
                </strong>

                <span>
                  {planning.dienst}
                </span>

                <span>
                  📍 {planning.terminal}
                </span>
              </div>

              {/* URENREGISTRATIE */}
              {renderUrenForm()}
            </>
          )}

          <p style={styles.footer}>
            Terminal Recruiters
          </p>

        </div>
      </div>
    );
  }

  // ============================================================
  // HOOFDSCHERM
  // ============================================================

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logo}>
          TR-FLEX
        </div>

        <h1 style={styles.title}>
          Open dienst
        </h1>

        <p style={styles.intro}>
          Hallo {aanbieding.medewerker},
          <br />
          er is een dienst aan jou aangeboden.
        </p>

        <div style={styles.infoBox}>

          <div style={styles.infoRow}>
            <span>📅</span>

            <div>
              <small style={styles.label}>
                Datum
              </small>

              <strong style={styles.value}>
                {planning.datum || "-"}
              </strong>
            </div>
          </div>

          <div style={styles.infoRow}>
            <span>🕒</span>

            <div>
              <small style={styles.label}>
                Dienst
              </small>

              <strong style={styles.value}>
                {planning.dienst || "-"}
              </strong>
            </div>
          </div>

          <div style={styles.infoRow}>
            <span>📍</span>

            <div>
              <small style={styles.label}>
                Terminal
              </small>

              <strong style={styles.value}>
                {planning.terminal || "-"}
              </strong>
            </div>
          </div>

        </div>

        <p style={styles.question}>
          Kun je deze dienst werken?
        </p>

        {fout && (
          <div style={styles.errorMessage}>
            {fout}
          </div>
        )}

        <div style={styles.buttons}>

          <button
            type="button"
            onClick={accepteer}
            disabled={actieLoading}
            style={{
              ...styles.acceptButton,
              opacity:
                actieLoading ? 0.6 : 1,
            }}
          >
            {actieLoading
              ? "⏳ Bezig..."
              : "✅ Dienst aannemen"}
          </button>

          <button
            type="button"
            onClick={weiger}
            disabled={actieLoading}
            style={{
              ...styles.rejectButton,
              opacity:
                actieLoading ? 0.6 : 1,
            }}
          >
            ❌ Dienst weigeren
          </button>

        </div>

        <p style={styles.footer}>
          Terminal Recruiters
        </p>

      </div>
    </div>
  );

  // ============================================================
  // URENFORMULIER
  // ============================================================

  function renderUrenForm() {
    const reedsIngediend =
      urenregistratie &&
      (
        urenregistratie.status ===
          "Ingediend" ||
        urenregistratie.status ===
          "Goedgekeurd"
      );

    return (
      <div style={styles.urenBox}>

        <h3 style={styles.urenTitle}>
          ⏱️ Gewerkte uren
        </h3>

        <p style={styles.urenIntro}>
          Vul hieronder je daadwerkelijk
          gewerkte tijden in.
        </p>

        {urenregistratie &&
          urenregistratie.status ===
            "Goedgekeurd" && (
            <div style={styles.approvedBox}>
              ✅ Deze uren zijn goedgekeurd.
            </div>
          )}

        {urenregistratie &&
          urenregistratie.status ===
            "Ingediend" && (
            <div style={styles.submittedBox}>
              🟠 Deze uren zijn ingediend en
              wachten op goedkeuring.
            </div>
          )}

        <div style={styles.timeGrid}>

          <div>
            <label style={styles.inputLabel}>
              Starttijd
            </label>

            <input
              type="time"
              value={starttijd}
              onChange={(e) =>
                setStarttijd(e.target.value)
              }
              disabled={
                urenregistratie?.status ===
                "Goedgekeurd"
              }
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.inputLabel}>
              Eindtijd
            </label>

            <input
              type="time"
              value={eindtijd}
              onChange={(e) =>
                setEindtijd(e.target.value)
              }
              disabled={
                urenregistratie?.status ===
                "Goedgekeurd"
              }
              style={styles.input}
            />
          </div>

        </div>

        <div style={styles.field}>
          <label style={styles.inputLabel}>
            Pauze in minuten
          </label>

          <input
            type="number"
            min="0"
            step="5"
            value={pauze}
            onChange={(e) =>
              setPauze(e.target.value)
            }
            disabled={
              urenregistratie?.status ===
              "Goedgekeurd"
            }
            style={styles.input}
          />
        </div>

        {/* AUTOMATISCHE BEREKENING */}
        <div style={styles.totalBox}>

          <span>
            Gewerkte uren
          </span>

          <strong>
            {gewerkteUren.toFixed(2)} uur
          </strong>

        </div>

        <div style={styles.field}>
          <label style={styles.inputLabel}>
            Opmerking
          </label>

          <textarea
            value={opmerking}
            onChange={(e) =>
              setOpmerking(e.target.value)
            }
            placeholder="Eventuele bijzonderheden..."
            rows="3"
            disabled={
              urenregistratie?.status ===
              "Goedgekeurd"
            }
            style={styles.textarea}
          />
        </div>

        {urenregistratie?.status !==
          "Goedgekeurd" && (
          <button
            type="button"
            onClick={dienUrenIn}
            disabled={urenLoading}
            style={{
              ...styles.hoursButton,
              opacity:
                urenLoading ? 0.6 : 1,
            }}
          >
            {urenLoading
              ? "⏳ Uren opslaan..."
              : reedsIngediend
              ? "💾 Uren bijwerken"
              : "💾 Uren indienen"}
          </button>
        )}

      </div>
    );
  }
}


/*
|--------------------------------------------------------------------------
| STYLING
|--------------------------------------------------------------------------
*/

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f3f6f9, #e7edf2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "560px",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "32px",
    boxSizing: "border-box",
    boxShadow:
      "0 10px 35px rgba(0,0,0,0.12)",
    textAlign: "center",
  },

  logo: {
    fontSize: "22px",
    fontWeight: "800",
    letterSpacing: "1px",
    marginBottom: "20px",
  },

  title: {
    margin: "0 0 10px",
    fontSize: "28px",
    color: "#1f2937",
  },

  intro: {
    color: "#6b7280",
    lineHeight: "1.6",
    marginBottom: "25px",
  },

  text: {
    color: "#6b7280",
    lineHeight: "1.6",
  },

  infoBox: {
    background: "#f7f9fb",
    borderRadius: "14px",
    padding: "10px 18px",
    textAlign: "left",
    marginBottom: "25px",
  },

  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px 0",
    borderBottom:
      "1px solid #e5e7eb",
  },

  label: {
    display: "block",
    color: "#6b7280",
    fontSize: "12px",
    marginBottom: "4px",
  },

  value: {
    display: "block",
    color: "#111827",
    fontSize: "17px",
  },

  question: {
    fontWeight: "700",
    fontSize: "18px",
    color: "#1f2937",
    marginBottom: "20px",
  },

  buttons: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  acceptButton: {
    width: "100%",
    padding: "17px",
    border: "none",
    borderRadius: "12px",
    background: "#16a34a",
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: "700",
    cursor: "pointer",
  },

  rejectButton: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "12px",
    background: "#dc2626",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
  },

  confirmation: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    background: "#f0fdf4",
    borderRadius: "12px",
    padding: "18px",
    marginTop: "20px",
    color: "#166534",
  },

  // ------------------------------------------
  // UREN
  // ------------------------------------------

  urenBox: {
    marginTop: "25px",
    background: "#f8fafc",
    border:
      "1px solid #e2e8f0",
    borderRadius: "15px",
    padding: "20px",
    textAlign: "left",
  },

  urenTitle: {
    margin:
      "0 0 6px",
    fontSize: "20px",
    color: "#1f2937",
  },

  urenIntro: {
    margin:
      "0 0 18px",
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.5",
  },

  timeGrid: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "12px",
    marginBottom: "15px",
  },

  field: {
    marginBottom: "15px",
  },

  inputLabel: {
    display: "block",
    fontSize: "13px",
    fontWeight: "700",
    color: "#374151",
    marginBottom: "6px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border:
      "1px solid #cbd5e1",
    borderRadius: "9px",
    fontSize: "16px",
    background: "#ffffff",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border:
      "1px solid #cbd5e1",
    borderRadius: "9px",
    fontSize: "15px",
    resize: "vertical",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  totalBox: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    background: "#e0f2fe",
    borderRadius: "10px",
    padding: "14px",
    marginBottom: "15px",
    color: "#075985",
  },

  approvedBox: {
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "9px",
    padding: "11px",
    marginBottom: "15px",
    fontSize: "14px",
    fontWeight: "600",
  },

  submittedBox: {
    background: "#fef3c7",
    color: "#92400e",
    borderRadius: "9px",
    padding: "11px",
    marginBottom: "15px",
    fontSize: "14px",
    fontWeight: "600",
  },

  hoursButton: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
  },

  successIcon: {
    fontSize: "60px",
    marginBottom: "15px",
  },

  resultIcon: {
    fontSize: "55px",
    marginBottom: "15px",
  },

  errorIcon: {
    fontSize: "55px",
    marginBottom: "15px",
  },

  loader: {
    fontSize: "45px",
    marginBottom: "15px",
  },

  errorMessage: {
    background: "#fef2f2",
    color: "#991b1b",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "15px",
    fontSize: "14px",
  },

  footer: {
    marginTop: "25px",
    color: "#9ca3af",
    fontSize: "13px",
  },
};