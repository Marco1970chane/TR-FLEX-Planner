import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const dagen = [
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
  "Zaterdag",
  "Zondag",
];

export default function WeekPlanner() {
  const [planning, setPlanning] = useState([]);

  useEffect(() => {
    laadPlanning();
  }, []);

  async function laadPlanning() {
    const { data } = await supabase
      .from("planning")
      .select("*")
      .order("datum");

    if (data) {
      setPlanning(data);
    }
  }

  return (
    <div className="table">
      <h2>📅 Weekplanner</h2>

      <table>
        <thead>
          <tr>
            <th>Terminal</th>

            {dagen.map((dag) => (
              <th key={dag}>{dag}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Wilmar</td>

            {dagen.map((dag) => (
              <td key={dag}></td>
            ))}
          </tr>

          <tr>
            <td>LBC Rotterdam</td>

            {dagen.map((dag) => (
              <td key={dag}></td>
            ))}
          </tr>

          <tr>
            <td>Shell Pernis</td>

            {dagen.map((dag) => (
              <td key={dag}></td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}