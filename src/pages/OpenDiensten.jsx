import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import OpenDienstCard from "../components/opendiensten/OpenDienstCard";
import AanbiedModal from "../components/opendiensten/AanbiedModal";

export default function OpenDiensten() {
  const [diensten, setDiensten] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [geselecteerdeDienst, setGeselecteerdeDienst] = useState(null);

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

  function aanbieden(dienst) {
    setGeselecteerdeDienst(dienst);
    setModalOpen(true);
  }

  function sluitModal() {
    setModalOpen(false);
    setGeselecteerdeDienst(null);
  }

  if (loading) {
    return <p>Open diensten laden...</p>;
  }

  return (
    <>
      <div className="table">
        <h2>📢 Open Diensten</h2>

        {diensten.length === 0 ? (
          <p>Er zijn geen open diensten.</p>
        ) : (
          <div className="open-diensten-grid">
            {diensten.map((dienst) => (
              <OpenDienstCard
                key={dienst.id}
                dienst={dienst}
                onAanbieden={aanbieden}
              />
            ))}
          </div>
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