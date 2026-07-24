import PlanningRow from "./PlanningRow";

export default function PlanningTable({
  planning,
  onEdit,
  onDelete,
}) {
  if (!planning.length) {
    return (
      <div className="table-empty">
        <h3>📅 Geen planning gevonden</h3>
        <p>Er zijn geen diensten die aan de huidige filters voldoen.</p>
      </div>
    );
  }

  return (
    <table className="planning-table">
      <thead>
        <tr>
          <th>Datum</th>
          <th>Terminal</th>
          <th>Dienst</th>
          <th>Operator</th>
          <th>Status</th>
          <th style={{ width: "180px" }}>Acties</th>
        </tr>
      </thead>

      <tbody>
        {planning.map((p) => (
          <PlanningRow
            key={p.id}
            planning={p}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  );
}