import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import DienstModal from "../components/planning/DienstModal";
import PlanningHeader from "../components/planning/PlanningHeader";
import PlanningGrid from "../components/planning/PlanningGrid";
import WeekSelector from "../components/planning/WeekSelector";
import PlanningLegenda from "../components/planning/PlanningLegenda";

export default function JaarPlanner() {
  const [week, setWeek] = useState(1);
  const [jaar, setJaar] = useState(new Date().getFullYear());

  const [medewerkers, setMedewerkers] = useState([]);
  const [planning, setPlanning] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [geselecteerdeMedewerker, setGeselecteerdeMedewerker] = useState(null);
  const [geselecteerdeDag, setGeselecteerdeDag] = useState(null);

  const [dienst, setDienst] = useState("");
  const [terminal, setTerminal] = useState("");

  const dagen = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
  const [geselecteerdePlanning, setGeselecteerdePlanning] = useState(null);

  useEffect(() => {
  laadPlanning();
}, [week, jaar]);

useEffect(() => {
  laadMedewerkers();
}, []);

  async function laadMedewerkers() {
    const { data, error } = await supabase
      .from("medewerkers")
      .select("id, naam")
      .order("naam");

    if (error) {
      alert(error.message);
      return;
    }

    setMedewerkers(data || []);
  }

  async function laadPlanning() {
  const { data, error } = await supabase
    .from("planning")
    .select("*")
    .eq("jaar", jaar)
    .eq("week", week);

  if (error) {
    alert(error.message);
    return;
  }

  setPlanning(data || []);
}



  function openPlanner(medewerker, dag) {
  const bestaandePlanning = planning.find(
    (p) =>
      p.medewerker_id === medewerker.id &&
      p.jaar === jaar &&
      p.week === week &&
      p.dag === dag
  );

  setGeselecteerdeMedewerker(medewerker);
  setGeselecteerdeDag(dag);

  if (bestaandePlanning) {
    setGeselecteerdePlanning(bestaandePlanning);
    setDienst(bestaandePlanning.dienst);
    setTerminal(bestaandePlanning.terminal);
  } else {
    setGeselecteerdePlanning(null);
    setDienst("");
    setTerminal("");
  }

  setModalOpen(true);
}

 async function opslaanPlanning() {
  if (!geselecteerdeMedewerker) {
    alert("Geen medewerker geselecteerd.");
    return;
  }

  if (!dienst) {
    alert("Kies een dienst.");
    return;
  }

  if (!terminal) {
    alert("Vul een terminal in.");
    return;
  }

  let error;

  if (geselecteerdePlanning) {
    ({ error } = await supabase
      .from("planning")
      .update({
        dienst,
        terminal,
      })
      .eq("id", geselecteerdePlanning.id));
  } else {
    ({ error } = await supabase
      .from("planning")
      .insert({
        medewerker: geselecteerdeMedewerker.naam,
        medewerker_id: geselecteerdeMedewerker.id,

        jaar,
        week,
        dag: geselecteerdeDag,

        datum: new Date().toISOString().split("T")[0],

        dienst,
        terminal,

        status: "Open",

        starttijd: "08:00",
        eindtijd: "17:00",

        opmerking: "",
      }));
  }

  if (error) {
    alert(error.message);
    return;
  }

  await laadPlanning();

  alert(
    geselecteerdePlanning
      ? "✅ Dienst bijgewerkt."
      : "✅ Dienst opgeslagen."
  );

  setModalOpen(false);
  setGeselecteerdePlanning(null);

  setDienst("");
  setTerminal("");
}

 return (
  <div className="table">
    <PlanningHeader
      jaar={jaar}
      week={week}
    />

    <WeekSelector
      week={week}
      setWeek={setWeek}
    />

    <PlanningLegenda />

    <PlanningGrid
      medewerkers={medewerkers}
      planning={planning}
      dagen={dagen}
      jaar={jaar}
      week={week}
      onCellClick={openPlanner}
    />

    <DienstModal
      open={modalOpen}
      onClose={() => {
  setModalOpen(false);
  setGeselecteerdePlanning(null);
  setDienst("");
  setTerminal("");
}}
      onSave={opslaanPlanning}
      dienst={dienst}
      setDienst={setDienst}
      terminal={terminal}
      setTerminal={setTerminal}
    />
  </div>
);  
}