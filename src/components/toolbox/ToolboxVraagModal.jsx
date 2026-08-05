import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";

export default function ToolboxVraagModal({
  open,
  onClose,
  onSaved,
  toolboxen,
  vraag,
}) {
  const [toolboxId, setToolboxId] = useState("");
  const [vraagTekst, setVraagTekst] = useState("");
  const [antwoordA, setAntwoordA] = useState("");
  const [antwoordB, setAntwoordB] = useState("");
  const [antwoordC, setAntwoordC] = useState("");
  const [antwoordD, setAntwoordD] = useState("");
  const [juist, setJuist] = useState("A");
  const [volgorde, setVolgorde] = useState(1);

  useEffect(() => {
    if (!open) return;

    if (vraag) {
      setToolboxId(vraag.toolbox_id || "");
      setVraagTekst(vraag.vraag || "");
      setAntwoordA(vraag.antwoord_a || "");
      setAntwoordB(vraag.antwoord_b || "");
      setAntwoordC(vraag.antwoord_c || "");
      setAntwoordD(vraag.antwoord_d || "");
      setJuist(vraag.juist || "A");
      setVolgorde(vraag.volgorde || 1);
    } else {
      setToolboxId(toolboxen?.[0]?.id || "");
      setVraagTekst("");
      setAntwoordA("");
      setAntwoordB("");
      setAntwoordC("");
      setAntwoordD("");
      setJuist("A");
      setVolgorde(1);
    }
  }, [open, vraag, toolboxen]);

  async function opslaan() {
    if (!toolboxId) {
      alert("Selecteer een toolbox.");
      return;
    }

    if (!vraagTekst.trim()) {
      alert("Voer een vraag in.");
      return;
    }

    const gegevens = {
      toolbox_id: toolboxId,
      vraag: vraagTekst,
      antwoord_a: antwoordA,
      antwoord_b: antwoordB,
      antwoord_c: antwoordC,
      antwoord_d: antwoordD,
      juist,
      volgorde,
    };

    let error;

    if (vraag) {
      ({ error } = await supabase
        .from("toolbox_vragen")
        .update(gegevens)
        .eq("id", vraag.id));
    } else {
      ({ error } = await supabase
        .from("toolbox_vragen")
        .insert([gegevens]));
    }

    if (error) {
      alert(error.message);
      return;
    }

    onSaved();
  }

  if (!open) return null;

  return (
    <div className="modal">
      <div
        className="modal-content"
        style={{ maxWidth: "700px" }}
      >
        <h2>
          {vraag
            ? "✏️ Vraag bewerken"
            : "➕ Nieuwe vraag"}
        </h2>

        <label>Toolbox</label>

        <select
          value={toolboxId}
          onChange={(e) =>
            setToolboxId(e.target.value)
          }
        >
          {toolboxen.map((tb) => (
            <option
              key={tb.id}
              value={tb.id}
            >
              {tb.titel}
            </option>
          ))}
        </select>

        <label>Vraag</label>

        <textarea
          value={vraagTekst}
          onChange={(e) =>
            setVraagTekst(e.target.value)
          }
        />

        <label>Antwoord A</label>

        <input
          value={antwoordA}
          onChange={(e) =>
            setAntwoordA(e.target.value)
          }
        />

        <label>Antwoord B</label>

        <input
          value={antwoordB}
          onChange={(e) =>
            setAntwoordB(e.target.value)
          }
        />

        <label>Antwoord C</label>

        <input
          value={antwoordC}
          onChange={(e) =>
            setAntwoordC(e.target.value)
          }
        />

        <label>Antwoord D</label>

        <input
          value={antwoordD}
          onChange={(e) =>
            setAntwoordD(e.target.value)
          }
        />

        <label>Juiste antwoord</label>

        <select
          value={juist}
          onChange={(e) =>
            setJuist(e.target.value)
          }
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>

        <label>Volgorde</label>

        <input
          type="number"
          value={volgorde}
          onChange={(e) =>
            setVolgorde(Number(e.target.value))
          }
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <button
            className="new-btn"
            style={{
              background: "#6b7280",
            }}
            onClick={onClose}
          >
            Annuleren
          </button>

          <button
            className="new-btn"
            onClick={opslaan}
          >
            💾 Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}