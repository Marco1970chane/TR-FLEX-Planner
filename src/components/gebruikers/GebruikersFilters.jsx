export default function GebruikersFilters({
  zoekterm,
  setZoekterm,
  rolFilter,
  setRolFilter,
  statusFilter,
  setStatusFilter,
}) {
  return (
    <div className="filters">
      <input
        className="search-input"
        type="text"
        placeholder="🔍 Zoek op naam of e-mail..."
        value={zoekterm}
        onChange={(e) => setZoekterm(e.target.value)}
      />

      <select
        value={rolFilter}
        onChange={(e) => setRolFilter(e.target.value)}
      >
        <option value="alle">Alle rollen</option>
        <option value="admin">Admin</option>
        <option value="operations">Operations</option>
        <option value="planner">Planner</option>
        <option value="hr">HR</option>
        <option value="medewerker">Medewerker</option>
      </select>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="alle">Alle statussen</option>
        <option value="actief">Actief</option>
        <option value="inactief">Inactief</option>
      </select>
    </div>
  );
}