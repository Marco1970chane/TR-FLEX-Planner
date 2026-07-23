export default function OpenDienstCard({ dienst, onAanbieden }) {
  return (
    <div className="open-dienst-card">
      <div className="open-dienst-header">
        <div>
          <h3>{dienst.datum}</h3>
          <span className="badge-open">OPEN</span>
        </div>
      </div>

      <div className="open-dienst-body">
        <p>
          <strong>🕒 Dienst</strong>
          <br />
          {dienst.dienst}
        </p>

        <p>
          <strong>📍 Terminal</strong>
          <br />
          {dienst.terminal}
        </p>
      </div>

      <button
        className="new-btn"
        onClick={() => onAanbieden(dienst)}
      >
        📱 Dienst aanbieden
      </button>
    </div>
  );
}