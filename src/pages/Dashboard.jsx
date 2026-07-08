export default function Dashboard() {
  return (
    <>
      <div className="cards">
        <div className="card">
          <h3>📅 Open diensten</h3>
          <h2>12</h2>
        </div>

        <div className="card">
          <h3>👷 Beschikbaar</h3>
          <h2>18</h2>
        </div>

        <div className="card">
          <h3>🏭 Terminals</h3>
          <h2>15</h2>
        </div>
      </div>

      <div className="table">
        <h2>Open diensten</h2>

        <table>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Terminal</th>
              <th>Dienst</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>07-07-2026</td>
              <td>LBC Rotterdam</td>
              <td>06:00 - 14:00</td>
              <td>🔴 Open</td>
            </tr>

            <tr>
              <td>07-07-2026</td>
              <td>Wilmar</td>
              <td>14:00 - 22:00</td>
              <td>🟢 Bevestigd</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}