import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import AanbiedModal from "../components/AanbiedModal";

export default function OpenDiensten() {
  const [diensten, setDiensten] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [geselecteerdeDienst, setGeselecteerdeDienst] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    laadOpenDiensten();
  }, []);

  async function laadOpenDiensten() {
    setLoading(true);

    const { data, error } = await supabase
      .from("planning")
      .select("*")
      .eq("status", "Open")
      .order("datum", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setDiensten(data || []);
    }

    setLoading(false);
  }

  function openModal(dienst) {
    setGeselecteerdeDienst(dienst);
    setModalOpen(true);
  }

  function sluitModal() {
    setModalOpen(false);
    setGeselecteerdeDienst(null);
  }

  return (
    <>
      <div className="table">
        <h2>📢 Open Diensten</h2>

        {loading ? (
          <p>Open diensten laden...</p>
        ) : diensten.length === 0 ? (
          <p>Er zijn momenteel geen open diensten.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Dienst</th>
                <th>Terminal</th>
                <th>Status</th>
                <th>Actie</th>
              </tr>
            </thead>

            <tbody>
              {diensten.map((dienst) => (
                <tr key={dienst.id}>
                  <td>{dienst.datum}</td>
                  <td>{dienst.dienst}</td>
                  <td>{dienst.terminal}</td>
                  <td>{dienst.status}</td>
                  <td>
                    <button
                      className="new-btn"
                      onClick={() => openModal(dienst)}
                    >
                      📱 Aanbieden
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AanbiedModal
        open={modalOpen}
        dienst={geselecteerdeDienst}
        onClose={sluitModal}
        onVerzonden={laadOpenDiensten}
      />
    </>
  );
}