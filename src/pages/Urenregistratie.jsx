import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import UrenregistratieForm from "../components/UrenregistratieForm";

export default function Urenregistratie() {
  const [uren, setUren] = useState([]);

  useEffect(() => {
    laadUren();
  }, []);

  async function laadUren() {
    const { data, error } = await supabase
      .from("urenregistratie")
      .select("*")
      .order("datum", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setUren(data || []);
  }

  return (
    <>
      <UrenregistratieForm onSaved={laadUren} />

      <div className="table">
        <h2>Geregistreerde uren</h2>

        <table>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Medewerker</th>
              <th>Terminal</th>
              <th>Van</th>
              <th>Tot</th>
              <th>Pauze</th>
              <th>Uren</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {uren.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: "center" }}
                >
                  Nog geen uren geregistreerd.
                </td>
              </tr>
            ) : (
              uren.map((u) => (
                <tr key={u.id}>
                  <td>{u.datum}</td>
                  <td>{u.medewerker}</td>
                  <td>{u.terminal}</td>
                  <td>{u.begintijd}</td>
                  <td>{u.eindtijd}</td>
                  <td>{u.pauze} min</td>
                  <td>{u.uren}</td>
                  <td>{u.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}