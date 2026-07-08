export default function Planning() {
  return (
    <div className="table">
      <h2>📅 Planning</h2>

      <button className="new-btn">+ Nieuwe dienst</button>

      <table>
        <thead>
          <tr>
            <th>Datum</th>
            <th>Terminal</th>
            <th>Dienst</th>
            <th>Operator</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>08-07-2026</td>
            <td>LBC Rotterdam</td>
            <td>06:00 - 14:00</td>
            <td>Dennis Aalbersberg</td>
            <td>🟢 Ingepland</td>
          </tr>

          <tr>
            <td>08-07-2026</td>
            <td>Wilmar</td>
            <td>14:00 - 22:00</td>
            <td>OPEN</td>
            <td>🔴 Open</td>
          </tr>

          <tr>
            <td>08-07-2026</td>
            <td>Shell Pernis</td>
            <td>06:00 - 18:00</td>
            <td>Tanju Dede</td>
            <td>🟢 Ingepland</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}