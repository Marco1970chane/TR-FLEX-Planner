import { format } from "date-fns";
import { nl } from "date-fns/locale";

export default function PlanningHeader({
  currentWeek,
  onPreviousWeek,
  onNextWeek,
  onToday,
  onNieuweDienst,
}) {
  // Zorg altijd voor een geldige datum
  const datum =
    currentWeek instanceof Date &&
    !isNaN(currentWeek.getTime())
      ? currentWeek
      : new Date();

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "18px",
        padding: "25px 30px",
        marginBottom: "20px",
        boxShadow: "0 8px 20px rgba(0,0,0,.08)",
        border: "1px solid #dcfce7",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#15803d",
              fontSize: "32px",
            }}
          >
            📅 Planning
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
              fontSize: "16px",
            }}
          >
            Weekplanning medewerkers
          </p>
        </div>

        <button
          className="new-btn"
          style={{
            background: "#16a34a",
          }}
          onClick={onNieuweDienst}
        >
          + Nieuwe dienst
        </button>
      </div>

      {/* Week navigatie */}
      <div
        style={{
          marginTop: "25px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <button
          className="new-btn"
          style={{
            background: "#22c55e",
          }}
          onClick={onPreviousWeek}
        >
          ◀ Vorige week
        </button>

        <div
          style={{
            fontSize: "22px",
            fontWeight: "700",
            color: "#15803d",
          }}
        >
          {format(datum, "'Week' w • d MMMM yyyy", {
            locale: nl,
          })}
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            className="new-btn"
            style={{
              background: "#15803d",
            }}
            onClick={onToday}
          >
            Vandaag
          </button>

          <button
            className="new-btn"
            style={{
              background: "#22c55e",
            }}
            onClick={onNextWeek}
          >
            Volgende ▶
          </button>
        </div>
      </div>
    </div>
  );
}