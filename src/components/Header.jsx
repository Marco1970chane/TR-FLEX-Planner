// src/components/Header.jsx

export default function Header() {
  const today = new Date().toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="header-bar">
      <div>
        <h1>TR Planner</h1>
        <p>{today}</p>
      </div>

      <div className="header-right">
        <button className="icon-btn">🔔</button>
        <button className="icon-btn">⚙️</button>

        <div className="user-card">
          <div className="avatar">M</div>

          <div>
            <strong>Marco Visser</strong>
            <div className="user-role">
              Operations Manager
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}