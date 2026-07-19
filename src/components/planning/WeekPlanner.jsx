import { Fragment, useMemo, useState } from "react";
import "./WeekPlanner.css";
import PlanningCard from "./PlanningCard";

const dagen = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

function beginVanWeek(datum = new Date()) {
  const d = new Date(datum);
  const dag = d.getDay();
  const verschil = dag === 0 ? -6 : 1 - dag;

  d.setDate(d.getDate() + verschil);
  d.setHours(0, 0, 0, 0);

  return d;
}

function formatDatum(d) {
  return d.toISOString().split("T")[0];
}

function getWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );

  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default function WeekPlanner({
  planning,
  onNieuweDienst,
  onEditDienst,
}) {
  const [weekStart, setWeekStart] = useState(beginVanWeek());

  const weekDagen = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const datum = new Date(weekStart);
      datum.setDate(weekStart.getDate() + i);

      return {
        label: dagen[i],
        datum,
        key: formatDatum(datum),
      };
    });
  }, [weekStart]);

  const medewerkers = useMemo(() => {
    return [...new Set(planning.map((p) => p.medewerker))]
      .filter(Boolean)
      .sort();
  }, [planning]);

  const planningMap = useMemo(() => {
    const map = {};

    planning.forEach((dienst) => {
      const key = `${dienst.medewerker}-${dienst.datum}`;

      if (!map[key]) {
        map[key] = [];
      }

      map[key].push(dienst);
    });

    return map;
  }, [planning]);

  const weekNummer = getWeekNumber(weekStart);

  function vorigeWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  }

  function volgendeWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  }

  function vandaag() {
    setWeekStart(beginVanWeek());
  }

  return (
    <div className="weekplanner">
      <div className="planner-header">
        <button className="new-btn" onClick={vorigeWeek}>
          ◀
        </button>

        <button className="new-btn" onClick={vandaag}>
          Vandaag
        </button>

        <h3>
          Week {weekNummer} ·{" "}
          {weekDagen[0].datum.toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "long",
          })}{" "}
          –{" "}
          {weekDagen[6].datum.toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "long",
          })}
        </h3>

        <button className="new-btn" onClick={volgendeWeek}>
          ▶
        </button>
      </div>

      <div className="planner-grid">
        <div className="corner"></div>

        {weekDagen.map((dag) => (
          <div key={dag.key} className="day-header">
            <strong>{dag.label}</strong>
            <br />
            {dag.datum.toLocaleDateString("nl-NL", {
              day: "2-digit",
              month: "2-digit",
            })}
          </div>
        ))}

        {medewerkers.map((medewerker) => (
          <Fragment key={medewerker}>
            <div className="employee">{medewerker}</div>

            {weekDagen.map((dag) => {
              const diensten =
                planningMap[`${medewerker}-${dag.key}`] || [];

              return (
                <div
                  key={`${medewerker}-${dag.key}`}
                  className="planner-cell"
                  onClick={() => {
                    if (diensten.length === 0) {
                      onNieuweDienst(dag.key, medewerker);
                    }
                  }}
                >
                  {diensten.map((dienst) => (
                    <PlanningCard
  key={dienst.id}
  dienst={dienst}
  onClick={() => onEditDienst(dienst)}
/>
                      
                      
                      
                        
                        
                      
                    
                  ))}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}