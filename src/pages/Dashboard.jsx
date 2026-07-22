import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import StatsCard from "../components/StatsCard";
import DashboardCharts from "../components/DashboardCharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    medewerkers: 0,
    dienstenVandaag: 0,
    terminals: 0,
    beschikbaar: 0,
  });

  const [planningVandaag, setPlanningVandaag] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [terminalData, setTerminalData] = useState([]);

  useEffect(() => {
    laadDashboard();
  }, []);

  async function laadDashboard() {
    const { data: medewerkers } = await supabase
      .from("medewerkers")
      .select("*");

    const { data: planning } = await supabase
      .from("planning")
      .select("*");

    const vandaag = new Date().toISOString().split("T")[0];

    const dienstenVandaag =
      planning?.filter((p) => p.datum === vandaag) || [];

    const uniekeTerminals = [
      ...new Set(
        dienstenVandaag
          .map((p) => p.terminal)
          .filter(Boolean)
      ),
    ];

    const beschikbaar =
      medewerkers?.filter(
        (m) =>
          m.status?.toLowerCase() === "beschikbaar"
      ).length || 0;

    setStats({
      medewerkers: medewerkers?.length || 0,
      dienstenVandaag: dienstenVandaag.length,
      terminals: uniekeTerminals.length,
      beschikbaar,
    });

    setPlanningVandaag(dienstenVandaag);

    const dagTelling = {};

    planning?.forEach((p) => {
      if (!p.datum) return;

      dagTelling[p.datum] =
        (dagTelling[p.datum] || 0) + 1;
    });

    const weekGrafiek = Object.entries(dagTelling)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dag, diensten]) => ({
        dag,
        diensten,
      }));

    setWeekData(weekGrafiek);

    const terminalTelling = {};

    planning?.forEach((p) => {
      if (!p.terminal) return;

      terminalTelling[p.terminal] =
        (terminalTelling[p.terminal] || 0) + 1;
    });

    const terminalGrafiek = Object.entries(
      terminalTelling
    ).map(([terminal, waarde]) => ({
      terminal,
      waarde,
    }));

    setTerminalData(terminalGrafiek);
  }

  return (
    <>
      <div className="cards">
        <StatsCard
          title="Medewerkers"
          value={stats.medewerkers}
          icon="👷"
        />

        <StatsCard
          title="Diensten vandaag"
          value={stats.dienstenVandaag}
          icon="📅"
        />

        <StatsCard
          title="Terminals bezet"
          value={stats.terminals}
          icon="🏭"
        />

        <StatsCard
          title="Beschikbaar"
          value={stats.beschikbaar}
          icon="🟢"
        />
      </div>

      <div className="table">
        <h2>Planning vandaag</h2>

        {planningVandaag.length === 0 ? (
          <p>Er zijn vandaag geen diensten gepland.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Medewerker</th>
                <th>Terminal</th>
                <th>Dienst</th>
              </tr>
            </thead>

            <tbody>
              {planningVandaag.map((dienst) => (
                <tr key={dienst.id}>
                  <td>{dienst.medewerker}</td>
                  <td>{dienst.terminal}</td>
                  <td>{dienst.dienst}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <DashboardCharts
        weekData={weekData}
        terminalData={terminalData}
      />
    </>
  );
}