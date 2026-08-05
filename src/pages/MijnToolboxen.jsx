import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useAuthContext } from "../contexts/AuthContext";

import ToolboxViewer from "../components/toolbox/ToolboxViewer";
import ToolboxQuiz from "../components/toolbox/ToolboxQuiz";

export default function MijnToolboxen() {
  const { profile } = useAuthContext();

  const [loading, setLoading] = useState(true);

  const [toolboxen, setToolboxen] = useState([]);
  const [resultaten, setResultaten] = useState([]);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  const [geselecteerdeToolbox, setGeselecteerdeToolbox] =
    useState(null);

  useEffect(() => {
    if (profile) {
      laadGegevens();
    }
  }, [profile]);

  async function laadGegevens() {
    setLoading(true);

    const [
      { data: toolboxData, error: toolboxError },
      { data: resultaatData, error: resultaatError },
    ] = await Promise.all([
      supabase
        .from("toolboxen")
        .select("*")
        .eq("actief", true)
        .order("titel"),

      supabase
        .from("toolbox_resultaten")
        .select("*")
        .eq("gebruiker_id", profile.id),
    ]);

    if (toolboxError) {
      console.error(toolboxError);
      alert(toolboxError.message);
    }

    if (resultaatError) {
      console.error(resultaatError);
    }

    setToolboxen(toolboxData || []);
    setResultaten(resultaatData || []);

    setLoading(false);
  }

  function bepaalStatus(toolbox) {
    const resultaat = resultaten.find(
      (r) => r.toolbox_id === toolbox.id
    );

    if (!resultaat) {
      return {
        tekst: "🟡 Nog niet gestart",
        kleur: "#FEF3C7",
        tekstKleur: "#92400E",
      };
    }

    if (resultaat.geslaagd) {
      return {
        tekst: "🟢 Afgerond",
        kleur: "#DCFCE7",
        tekstKleur: "#166534",
      };
    }

    if (resultaat.gelezen) {
      return {
        tekst: "🟠 Bezig",
        kleur: "#FED7AA",
        tekstKleur: "#9A3412",
      };
    }

    return {
      tekst: "🔴 Verlopen",
      kleur: "#FEE2E2",
      tekstKleur: "#991B1B",
    };
  }

  function openToolbox(toolbox) {
    setGeselecteerdeToolbox(toolbox);
    setViewerOpen(true);
  }

  if (loading) {
    return (
      <div className="table">
        <h2>📦 Mijn Toolboxen</h2>
        <p>Toolboxen laden...</p>
      </div>
    );
  }

  console.log({
  viewerOpen,
  quizOpen,
  geselecteerdeToolbox,
});
  return (
    <>
      <div className="table">

        <div className="page-header">
          <div>
            <h2>📦 Mijn Toolboxen</h2>
            <p>
              {toolboxen.length} actieve toolboxen
            </p>
          </div>
        </div>

        {toolboxen.length === 0 ? (
          <div className="table-empty">
            <h3>Geen toolboxen gevonden</h3>
            <p>
              Er zijn momenteel geen actieve
              toolboxen.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill,minmax(340px,1fr))",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            {toolboxen.map((toolbox) => {
              const status =
                bepaalStatus(toolbox);

              return (
                <div
                  key={toolbox.id}
                  style={{
                    background: "#fff",
                    borderRadius: "16px",
                    padding: "20px",
                    borderLeft:
                      "5px solid #2563eb",
                    boxShadow:
                      "0 8px 24px rgba(0,0,0,.08)",
                  }}
                >
                  <h3>{toolbox.titel}</h3>

                  <p>
                    <strong>Categorie:</strong>{" "}
                    {toolbox.categorie}
                  </p>

                  <p>
                    <strong>Versie:</strong>{" "}
                    {toolbox.versie}
                  </p>

                  <p>
                    <strong>Geldig:</strong>{" "}
                    {toolbox.geldig_maanden} maanden
                  </p>

                  <p
                    style={{
                      color: "#64748b",
                      minHeight: "70px",
                    }}
                  >
                    {toolbox.omschrijving}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      marginTop: "20px",
                    }}
                  >
                    <span
                      style={{
                        background:
                          status.kleur,
                        color:
                          status.tekstKleur,
                        padding:
                          "6px 12px",
                        borderRadius:
                          "999px",
                        fontWeight:
                          "600",
                        fontSize:
                          "13px",
                      }}
                    >
                      {status.tekst}
                    </span>

                    <button
                      className="new-btn"
                      onClick={() =>
                        openToolbox(
                          toolbox
                        )
                      }
                    >
                      📄 Open Toolbox
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
            {/* Toolbox Viewer */}

      <ToolboxViewer
        open={viewerOpen}
        toolbox={geselecteerdeToolbox}
        onClose={() => {
          setViewerOpen(false);
          setGeselecteerdeToolbox(null);
        }}
       onStartQuiz={(toolbox) => {
  setGeselecteerdeToolbox(toolbox);
  setViewerOpen(false);
  setQuizOpen(true);
}}
      />

      {/* Toolbox Quiz */}

      {quizOpen && (
        <ToolboxQuiz
          toolbox={geselecteerdeToolbox}
          onClose={() => {
            setQuizOpen(false);
            setGeselecteerdeToolbox(null);
            laadGegevens();
          }}
          onGeslaagd={() => {
            setQuizOpen(false);
            setGeselecteerdeToolbox(null);
            laadGegevens();

            alert(
              "🎉 Gefeliciteerd! Je hebt de toolbox succesvol afgerond."
            );
          }}
        />
      )}
    </>
  );
}