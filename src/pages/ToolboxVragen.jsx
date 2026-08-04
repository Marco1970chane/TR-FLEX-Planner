import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

import ToolboxVraagTabel from "../components/toolbox/ToolboxVraagTabel";
import ToolboxVraagModal from "../components/toolbox/ToolboxVraagModal";

export default function ToolboxVragen() {
  const [vragen, setVragen] = useState([]);
  const [toolboxen, setToolboxen] = useState([]);

  const [loading, setLoading] = useState(true);

  const [zoekterm, setZoekterm] = useState("");

  const [popupOpen, setPopupOpen] = useState(false);

  const [editVraag, setEditVraag] = useState(null);

  useEffect(() => {
    laadGegevens();
  }, []);

  async function laadGegevens() {
    setLoading(true);

    const [
      { data: toolboxData, error: toolboxError },
      { data: vraagData, error: vraagError },
    ] = await Promise.all([
      supabase
        .from("toolboxen")
        .select("id,titel")
        .order("titel"),

      supabase
        .from("toolbox_vragen")
        .select("*")
        .order("toolbox_id")
        .order("volgorde"),
    ]);

    if (toolboxError) {
      alert(toolboxError.message);
    }

    if (vraagError) {
      alert(vraagError.message);
    }

    setToolboxen(toolboxData || []);
    setVragen(vraagData || []);

    setLoading(false);
  }

  async function verwijderVraag(id) {
    if (!window.confirm("Vraag verwijderen?")) {
      return;
    }

    const { error } = await supabase
      .from("toolbox_vragen")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    laadGegevens();
  }

  const gefilterdeVragen = vragen.filter((vraag) => {
    const toolbox = toolboxen.find(
      (t) => t.id === vraag.toolbox_id
    );

    const zoek = zoekterm.toLowerCase();

    return (
      vraag.vraag?.toLowerCase().includes(zoek) ||
      toolbox?.titel?.toLowerCase().includes(zoek)
    );
  });

  return (
    <div className="table">

      <div className="page-header">
        <div>
          <h2>❓ Toolbox Vragen</h2>
          <p>{vragen.length} vragen</p>
        </div>

        <button
          className="new-btn"
          onClick={() => {
            setEditVraag(null);
            setPopupOpen(true);
          }}
        >
          + Nieuwe vraag
        </button>
      </div>

      <input
        className="search-input"
        type="text"
        placeholder="🔍 Zoek vraag..."
        value={zoekterm}
        onChange={(e) =>
          setZoekterm(e.target.value)
        }
      />

      <br />
      <br />

      {loading ? (
        <p>Vragen laden...</p>
      ) : (
        <ToolboxVraagTabel
          vragen={gefilterdeVragen}
          toolboxen={toolboxen}
          onEdit={(vraag) => {
            setEditVraag(vraag);
            setPopupOpen(true);
          }}
          onDelete={verwijderVraag}
        />
      )}

      <ToolboxVraagModal
        open={popupOpen}
        toolboxen={toolboxen}
        vraag={editVraag}
        onClose={() => {
          setPopupOpen(false);
          setEditVraag(null);
        }}
        onSaved={() => {
          setPopupOpen(false);
          setEditVraag(null);
          laadGegevens();
        }}
      />

    </div>
  );
}