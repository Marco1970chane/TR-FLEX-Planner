import {
  addDays,
  format,
  startOfWeek,
} from "date-fns";
import { nl } from "date-fns/locale";

import DienstCard from "./DienstCard";

export default function WeekPlanner({
  planning = [],
  currentWeek,
  onEdit,
}) {
  const weekStart = startOfWeek(
    currentWeek || new Date(),
    {
      weekStartsOn: 1,
    }
  );

  const dagen = Array.from({ length: 7 }, (_, i) =>
    addDays(weekStart, i)
  );

  // Alleen diensten van de geselecteerde week
  const planningWeek = planning.filter((p) =>
    dagen.some(
      (dag) =>
        p.datum === format(dag, "yyyy-MM-dd")
    )
  );

  // Unieke medewerkers
  const medewerkers = [
    ...new Set(
      planningWeek.map(
        (p) => p.medewerker || "Open dienst"
      )
    ),
  ];

  function dienstOpDag(medewerker, dag) {
    return planningWeek.find(
      (p) =>
        (p.medewerker || "Open dienst") === medewerker &&
        p.datum === format(dag, "yyyy-MM-dd")
    );
  }

  function berekenUren(diensten) {
    return diensten.reduce((totaal, d) => {
      if (!d.starttijd || !d.eindtijd) return totaal;

      const [sh, sm] = d.starttijd.split(":").map(Number);
      const [eh, em] = d.eindtijd.split(":").map(Number);

      let minuten =
        eh * 60 +
        em -
        (sh * 60 + sm);

      if (minuten < 0) {
        minuten += 24 * 60;
      }

      return totaal + minuten / 60;
    }, 0);
  }

  return (
    <div
      style={{
        overflowX: "auto",
      }}
    >
      <table
        style={{
          width: "100%",
          minWidth: "1200px",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                background: "#15803d",
                color: "#fff",
                padding: "15px",
                width: "220px",
              }}
            >
              Medewerker
            </th>

            {dagen.map((dag) => (
              <th
                key={dag.toISOString()}
                style={{
                  background: "#16a34a",
                  color: "#fff",
                  padding: "15px",
                  textAlign: "center",
                }}
              >
                {format(dag, "EEE d", {
                  locale: nl,
                })}
              </th>
            ))}

            <th
              style={{
                background: "#15803d",
                color: "#fff",
                width: "90px",
              }}
            >
              Uren
            </th>
          </tr>
        </thead>

        <tbody>
          {medewerkers.map((medewerker) => {
            const diensten =
              planningWeek.filter(
                (p) =>
                  (p.medewerker ||
                    "Open dienst") === medewerker
              );

            return (
              <tr key={medewerker}>
                <td
                  style={{
                    padding: "15px",
                    fontWeight: "600",
                    background: "#f0fdf4",
                    border: "1px solid #dcfce7",
                    whiteSpace: "nowrap",
                  }}
                >
                  👤 {medewerker}
                </td>

                {dagen.map((dag) => {
                  const dienst =
                    dienstOpDag(
                      medewerker,
                      dag
                    );

                  return (
                    <td
                      key={dag.toISOString()}
                      style={{
                        border:
                          "1px solid #ecfdf5",
                        height: "95px",
                        padding: "6px",
                        verticalAlign: "top",
                      }}
                    >
                      {dienst && (
                        <DienstCard
                          dienst={dienst}
                          onClick={onEdit}
                        />
                      )}
                    </td>
                  );
                })}

                <td
                  style={{
                    textAlign: "center",
                    fontWeight: "700",
                    color: "#15803d",
                    border:
                      "1px solid #dcfce7",
                  }}
                >
                  {berekenUren(
                    diensten
                  ).toFixed(1)}
                </td>
              </tr>
            );
          })}

          {medewerkers.length === 0 && (
            <tr>
              <td
                colSpan={9}
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                Geen diensten gevonden voor deze week.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}