import StatsCard from "../components/StatsCard";

export default function Dashboard() {
  return (
    <>
      <div className="cards">
        <StatsCard
          title="Open diensten"
          value="12"
          icon="📅"
        />

        <StatsCard
          title="Beschikbaar"
          value="18"
          icon="👷"
        />

        <StatsCard
          title="Terminals"
          value="15"
          icon="🏭"
        />

        <StatsCard
          title="Certificaten"
          value="84"
          icon="📄"
        />
      </div>

      <div className="table">
        <h2>Welkom bij de TR-FLEX Planner</h2>

        <p>
          Gebruik het menu links om naar Planning,
          Medewerkers of Terminals te gaan.
        </p>
      </div>
    </>
  );
}