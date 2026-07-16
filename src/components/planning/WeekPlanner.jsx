import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import "./WeekPlanner.css";

import {
  startOfWeek,
  addWeeks,
  addDays,
  format,
  isSameDay,
  isWithinInterval,
} from "date-fns";

import { nl } from "date-fns/locale/nl";

export default function WeekPlanner() {
  const [medewerkers, setMedewerkers] = useState([]);
  const [planning, setPlanning] = useState([]);

  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), {
      weekStartsOn: 1,
    })
  );

  useEffect(() => {
    laadMedewerkers();
    laadPlanning();
  }, []);

  async function laadMedewerkers() {
    const { data, error } = await supabase
      .from("medewerkers")
      .select("*")
      .order("naam");

    if (!error) {
      setMedewerkers(data);
    }
  }

  async function laadPlanning() {
    const { data, error } = await supabase
      .from("planning")
      .select("*");

    if (!error) {
      setPlanning(data);
    }
  }

  const weekEinde = addDays(weekStart, 6);

  const planningDezeWeek = planning.filter((p) => {
    const datum = new Date(p.datum);

    return isWithinInterval(datum, {
      start: weekStart,
      end: weekEinde,
    });
  });

  function dienstVanDag(naam, datum) {
    return planningDezeWeek.find((p) => {
      return (
        p.medewerker === naam &&
        isSameDay(new Date(p.datum), datum)
      );
    });
  }

  const dagen = [];

for (let i = 0; i < 7; i++) {
  dagen.push(addDays(weekStart, i));
}

return (

  
    

      
    <div className="weekplanner">
      <div className="planner-header">
        <button
          className="new-btn"
          onClick={() => setWeekStart(addWeeks(weekStart, -1))}
        >
          ◀ Vorige
        </button>

        <h2>
          Week van{" "}
          {format(weekStart, "dd MMMM yyyy", {
            locale: nl,
          })}
        </h2>

        <button
          className="new-btn"
          onClick={() => setWeekStart(addWeeks(weekStart, 1))}
        >
          Volgende ▶
        </button>
      </div>

      <div className="planner-grid">
        <div className="corner"></div>

        {dagen.map((dag) => (
          <div key={dag.toISOString()} className="day-header">
            <div>{format(dag, "EEE", { locale: nl })}</div>
            <strong>{format(dag, "dd-MM")}</strong>
          </div>
        ))}

        {medewerkers.map((m) => (
          <>
            <div key={m.id} className="employee">
              👷 {m.naam}
            </div>

            {dagen.map((dag) => {
              const dienst = dienstVanDag(m.naam, dag);

              return (
                <div
                  key={`${m.id}-${dag.toISOString()}`}
                  className="planner-cell"
                >
                  {dienst && (
                    <div className="dienst-card">
                      <strong>🚢 {dienst.terminal}</strong>

                      <div>🕒 {dienst.dienst}</div>

                      <small>{dienst.status}</small>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}