import { NavLink, Outlet } from "react-router-dom";
import "../styles.css"; 

export default function Layout() {
  const linkClass = ({ isActive }) =>
    isActive
      ? "text-blue-600 font-semibold border-b-2 border-blue-600 text-lg sm:text-xl"
      : "text-gray-700 hover:text-blue-600 text-lg sm:text-xl";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 text-gray-800">
      {/* Navbar */}
      <nav className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-10 py-4 sm:py-5 bg-white shadow-md sticky top-0 z-50">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 relative inline-block fire-text">
          Deep Nepse
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-3 sm:mt-0">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/features" className={linkClass}>
            Features
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>
        </div>
      </nav>

      {/* Page Content */}
      <main className="p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}
