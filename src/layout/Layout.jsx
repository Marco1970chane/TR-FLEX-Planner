import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function Layout() {
  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <Header />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}