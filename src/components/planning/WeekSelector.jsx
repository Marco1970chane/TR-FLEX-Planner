export default function WeekSelector({
  week,
  setWeek,
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
      }}
    >
      <button
        className="new-btn"
        onClick={() =>
          setWeek((w) => (w > 1 ? w - 1 : 52))
        }
      >
        ◀ Vorige
      </button>

      <button
        className="new-btn"
        onClick={() =>
          setWeek((w) => (w < 52 ? w + 1 : 1))
        }
      >
        Volgende ▶
      </button>
    </div>
  );
}