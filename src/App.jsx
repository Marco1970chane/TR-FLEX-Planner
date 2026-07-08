import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <Header />

        <Dashboard />
      </div>
    </div>
  );
}

export default App;