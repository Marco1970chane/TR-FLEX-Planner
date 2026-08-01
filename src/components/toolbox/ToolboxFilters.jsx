export default function ToolboxFilters({
  zoekterm,
  setZoekterm,
}) {
  return (
    <div className="filters">
      <input
        className="search-input"
        type="text"
        placeholder="🔍 Zoek toolbox..."
        value={zoekterm}
        onChange={(e) => setZoekterm(e.target.value)}
      />
    </div>
  );
}