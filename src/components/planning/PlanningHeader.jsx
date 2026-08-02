export default function PlanningHeader({ jaar, week }) {
  return (
    <div className="page-header">
      <div>
        <h2>🗓 Jaarplanner</h2>
        <p>
          Jaar {jaar} • Week {week}
        </p>
      </div>
    </div>
  );
}