import MedewerkerForm from "../components/MedewerkerForm";

export default function Medewerkers() {
  return (
    <div className="table">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>👷 Medewerkers</h2>

        <button className="new-btn">
          + Nieuwe medewerker
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Naam</th>
            <th>Functie</th>
            <th>Terminal</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {medewerkers.map((m) => (
            <tr key={m.id}>
              <td>{m.naam}</td>
              <td>{m.functie}</td>
              <td>{m.terminal}</td>
              <td>{m.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
<MedewerkerForm />
