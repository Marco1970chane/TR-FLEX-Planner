import "./WeekPlanner.css";

const dagen = [
  "Ma",
  "Di",
  "Wo",
  "Do",
  "Vr",
  "Za",
  "Zo",
];

const medewerkers = [
  "Dennis",
  "Hakim",
  "Tanju",
  "Ramiro",
  "Szymon",
  "Marco",
];

export default function WeekPlanner() {
  return (
    <div className="weekplanner">

      <div className="planner-header">
        <h2>📅 Weekplanner</h2>

        <div className="planner-buttons">
          <button className="new-btn">◀ Vorige</button>
          <button className="new-btn">Vandaag</button>
          <button className="new-btn">Volgende ▶</button>
        </div>
      </div>

      <div className="planner-grid">

        <div className="corner"></div>

        {dagen.map((dag) => (
          <div key={dag} className="day-header">
            {dag}
          </div>
        ))}

        {medewerkers.map((medewerker) => (
          <>
            <div className="employee">
              👷 {medewerker}
            </div>

            {dagen.map((dag) => (
              <div
                key={medewerker + dag}
                className="planner-cell"
              >
              </div>
            ))}
          </>
        ))}

      </div>

    </div>
  );
}