import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#ea580c",
  "#0f766e",
];

export default function DashboardCharts({
  weekData,
  terminalData,
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(350px,1fr))",
        gap: "20px",
        marginTop: "25px",
      }}
    >
      <div className="table">
        <h2>Diensten per dag</h2>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dag" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="diensten" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="table">
        <h2>Bezetting per terminal</h2>

        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={terminalData}
              dataKey="waarde"
              nameKey="terminal"
              outerRadius={110}
              label
            >
              {terminalData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}