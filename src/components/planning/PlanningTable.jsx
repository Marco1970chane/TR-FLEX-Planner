import PlanningRow from "./PlanningRow";

export default function PlanningTable({
  planning,
  onEdit,
  onDelete,
}) {
  return (
    <table>
      <thead>
        <tr>
          <th>Datum</th>
          <th>Terminal</th>
          <th>Dienst</th>
          <th>Operator</th>
          <th>Status</th>
          <th>Acties</th>
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