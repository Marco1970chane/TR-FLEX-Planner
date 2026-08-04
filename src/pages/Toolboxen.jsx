import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useAuthContext } from "../contexts/AuthContext";

import ToolboxStats from "../components/toolbox/ToolboxStats";
import ToolboxFilters from "../components/toolbox/ToolboxFilters";
import ToolboxTabel from "../components/toolbox/ToolboxTabel";
import NieuweToolboxModal from "../components/toolbox/NieuweToolboxModal";
import ToolboxViewer from "../components/toolbox/ToolboxViewer";

export default function Toolboxen() {
  const { profile } = useAuthContext();

  const magBeheren =
    profile?.rol === "admin" ||
    profile?.rol === "operations" ||
    profile?.rol === "hr";

  const [toolboxen, setToolboxen] = useState([]);
  const [loading, setLoading] = useState(true);

  const [zoekterm, setZoekterm] = useState("");

  const [popupOpen, setPopupOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedToolbox, setSelectedToolbox] = useState(null);

  const [titel, setTitel] = useState("");
  const [omschrijving, setOmschrijving] = useState("");
  const [categorie, setCategorie] = useState("Veiligheid");
  const [pdfUrl, setPdfUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [versie, setVersie] = useState("1.0");
  const [geldigMaanden, setGeldigMaanden] = useState(12);
  const [actief, setActief] = useState(true);

  useEffect(() => {
    laadToolboxen();
  }, []);

  async function laadToolboxen() {
    setLoading(true);

    const { data, error } = await supabase
      .from("toolboxen")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
    } else {
      setToolboxen(data || []);
    }

    setLoading(false);
  }

  async function opslaanToolbox() {
    let error;

    if (editId) {
      ({ error } = await supabase
        .from("toolboxen")
        .update({
          titel,
          omschrijving,
          categorie,
          pdf_url: pdfUrl,
          video_url: videoUrl,
          versie,
          geldig_maanden: geldigMaanden,
          actief,
        })
        .eq("id", editId));
    } else {
      ({ error } = await supabase
        .from("toolboxen")
        .insert([
          {
            titel,
            omschrijving,
            categorie,
            pdf_url: pdfUrl,
            video_url: videoUrl,
            versie,
            geldig_maanden: geldigMaanden,
            actief,
          },
        ]));
    }

    if (error) {
      alert(error.message);
      return;
    }

    resetForm();
    setPopupOpen(false);
    laadToolboxen();
  }

  async function verwijderToolbox(id) {
    if (!window.confirm("Toolbox verwijderen?")) return;

    const { error } = await supabase
      .from("toolboxen")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    laadToolboxen();
  }

  function bewerkToolbox(toolbox) {
    setEditId(toolbox.id);

    setTitel(toolbox.titel || "");
    setOmschrijving(toolbox.omschrijving || "");
    setCategorie(toolbox.categorie || "Veiligheid");
    setPdfUrl(toolbox.pdf_url || "");
    setVideoUrl(toolbox.video_url || "");
    setVersie(toolbox.versie || "1.0");
    setGeldigMaanden(toolbox.geldig_maanden || 12);
    setActief(toolbox.actief);

    setPopupOpen(true);
  }

  function resetForm() {
    setEditId(null);
    setTitel("");
    setOmschrijving("");
    setCategorie("Veiligheid");
    setPdfUrl("");
    setVideoUrl("");
    setVersie("1.0");
    setGeldigMaanden(12);
    setActief(true);
  }

  const gefilterd = toolboxen.filter((t) =>
    (t.titel || "")
      .toLowerCase()
      .includes(zoekterm.toLowerCase())
  );

  return (
    <div className="table">
      <div className="page-header">
        <div>
          <h2>📦 Toolboxen</h2>
          <p>{toolboxen.length} toolboxen</p>
        </div>

        {magBeheren && (
          <button
            className="new-btn"
            onClick={() => {
              resetForm();
              setPopupOpen(true);
            }}
          >
            + Nieuwe toolbox
          </button>
        )}
      </div>

      <ToolboxStats toolboxen={toolboxen} />

      <ToolboxFilters
        zoekterm={zoekterm}
        setZoekterm={setZoekterm}
      />

      {loading ? (
        <p>Toolboxen laden...</p>
      ) : (
        <ToolboxTabel
          toolboxen={gefilterd}
          onView={(toolbox) => {
            setSelectedToolbox(toolbox);
            setViewerOpen(true);
          }}
          onEdit={magBeheren ? bewerkToolbox : undefined}
          onDelete={magBeheren ? verwijderToolbox : undefined}
        />
      )}

      {magBeheren && (
        <NieuweToolboxModal
          open={popupOpen}
          onClose={() => setPopupOpen(false)}
          onSave={opslaanToolbox}
          titel={titel}
          setTitel={setTitel}
          omschrijving={omschrijving}
          setOmschrijving={setOmschrijving}
          categorie={categorie}
          setCategorie={setCategorie}
          pdfUrl={pdfUrl}
          setPdfUrl={setPdfUrl}
          videoUrl={videoUrl}
          setVideoUrl={setVideoUrl}
          versie={versie}
          setVersie={setVersie}
          geldigMaanden={geldigMaanden}
          setGeldigMaanden={setGeldigMaanden}
          actief={actief}
          setActief={setActief}
        />
      )}

      <ToolboxViewer
        open={viewerOpen}
        toolbox={selectedToolbox}
        onClose={() => {
          setViewerOpen(false);
          setSelectedToolbox(null);
        }}
      />
    </div>
  );
}