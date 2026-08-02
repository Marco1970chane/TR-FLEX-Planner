import PlanningCell from "./PlanningCell";

export default function PlanningGrid({
  medewerkers,
  planning,
  dagen,
  jaar,
  week,
  onCellClick,
}) {
  return (
    <table className="medewerker-table">
      <thead>
        <tr>
          <th>Medewerker</th>

          {dagen.map((dag) => (
            <th key={dag}>{dag}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {medewerkers.map((m) => (
          <tr key={m.id}>
            <td>{m.naam}</td>

            {dagen.map((dag) => {
              const item = planning.find(
                (p) =>
                  p.medewerker_id === m.id &&
                  p.jaar === jaar &&
                  p.week === week &&
                  p.dag === dag
              );

              return (
                <PlanningCell
                  key={dag}
                  waarde={item?.dienst}
                  onClick={() => onCellClick(m, dag)}
                />
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}