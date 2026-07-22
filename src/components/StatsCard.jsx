export default function StatsCard({ title, value, icon }) {
  return (
    <div className="card">
      <div
        style={{
          fontSize: "34px",
          marginBottom: "12px",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontSize: "16px",
          color: "#6b7280",
          fontWeight: "600",
          marginBottom: "10px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "34px",
          fontWeight: "700",
          color: "#2563eb",
        }}
      >
        {value}
      </div>
    </div>
  );
}