import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function Reageren() {
  const { token } = useParams();

  const [aanbieding, setAanbieding] = useState(null);
  const [planning, setPlanning] = useState(null);
  const [loading, setLoading] = useState(true);
  const [klaar, setKlaar] = useState(false);
  const [melding, setMelding] = useState("");

  useEffect(() => {
    laadGegevens();
  }, []);

  async function laadGegevens() {
    const { data: aanbiedingData, error } = await supabase
      .from("dienst_aanbiedingen")
      .select("*")
      .eq("token", token)
      .single();

    if (error || !aanbiedingData) {
      setMelding("Deze uitnodiging is niet gevonden.");
      setLoading(false);
      return;
    }

    setAanbieding(aanbiedingData);

    const { data: planningData } = await supabase
      .from("planning")
      .select("*")
      .eq("id", aanbiedingData.planning_id)
      .single();

    setPlanning(planningData);
    setLoading(false);
  }

  async function accepteer() {
    if (!aanbieding || !planning) return;

    setLoading(true);

    await supabase
      .from("dienst_aanbiedingen")
      .update({
        status: "Geaccepteerd",
        reactie_op: new Date().toISOString(),
      })
      .eq("id", aanbieding.id);

    await supabase
      .from("planning")
      .update({
        medewerker: aanbieding.medewerker,
        status: "Ingepland",
      })
      .eq("id", aanbieding.planning_id);

    await supabase
      .from("dienst_aanbiedingen")
      .update({
        status: "Vervallen",
      })
      .eq("planning_id", aanbieding.planning_id)
      .neq("id", aanbieding.id);

    setMelding("Bedankt! De dienst is aan jou toegewezen.");
    setKlaar(true);
    setLoading(false);
  }

  async function weiger() {
    if (!aanbieding) return;

    setLoading(true);

    await supabase
      .from("dienst_aanbiedingen")
      .update({
        status: "Geweigerd",
        reactie_op: new Date().toISOString(),
      })
      .eq("id", aanbieding.id);

    setMelding("Je hebt de dienst geweigerd.");
    setKlaar(true);
    setLoading(false);
  }

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        Laden...
      </div>
    );
  }

  if (!aanbieding || !planning) {
    return (
      <div style={{ padding: 40 }}>
        {melding}
      </div>
    );
  }

  if (klaar) {
    return (
      <div style={{ maxWidth: 600, margin: "50px auto", textAlign: "center" }}>
        <h2>TR-FLEX Planner</h2>
        <h3>{melding}</h3>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "50px auto",
        padding: 30,
        border: "1px solid #ddd",
        borderRadius: 10,
      }}
    >
      <h2>TR-FLEX Planner</h2>

      <h3>Open Dienst</h3>

      <p>
        <strong>Medewerker:</strong> {aanbieding.medewerker}
      </p>

      <p>
        <strong>Datum:</strong> {planning.datum}
      </p>

      <p>
        <strong>Dienst:</strong> {planning.dienst}
      </p>

      <p>
        <strong>Terminal:</strong> {planning.terminal}
      </p>

      <div
        style={{
          marginTop: 30,
          display: "flex",
          gap: 15,
        }}
      >
        <button
          onClick={accepteer}
          style={{
            flex: 1,
            padding: 15,
            background: "green",
            color: "white",
            border: 0,
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          ✅ Accepteren
        </button>

        <button
          onClick={weiger}
          style={{
            flex: 1,
            padding: 15,
            background: "crimson",
            color: "white",
            border: 0,
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          ❌ Weigeren
        </button>
      </div>
    </div>
  );
}