export default function SearchBar({ value, onChange }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="🔍 Zoek medewerker..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #d1d5db",
          fontSize: "16px",
          background: "#fff",
        }}
      />
    </div>
  );
}