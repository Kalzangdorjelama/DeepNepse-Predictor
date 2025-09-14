import { NavLink, Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const { pathname } = useLocation();

  const footerBg = pathname === "/features" ? "bg-gray-50" : "bg-gray-100";
  return (
    <div className="bg-gradient-to-b from-blue-50 to-gray-50 text-gray-800 min-h-screen">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-5 bg-white shadow-md sticky top-0 z-50">
        <h1 className="text-2xl font-extrabold text-blue-700">DeepNepse</h1>

        <div className="hidden md:flex space-x-8 font-medium text-xl">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "text-blue-600 font-bold" : "hover:text-blue-600"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/features"
            className={({ isActive }) =>
              isActive ? "text-blue-600 font-bold" : "hover:text-blue-600"
            }
          >
            Features
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "text-blue-600 font-bold" : "hover:text-blue-600"
            }
          >
            About
          </NavLink>
        </div>

        <button className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 cursor-pointer">
          Get Started
        </button>
      </nav>

      {/* Page content */}
      <Outlet />

      {/* Footer */}
      <footer className={`py-8 text-center text-gray-500 ${footerBg} mt-10`}>
        © 2025 DeepNepse – AI Stock Prediction System. All rights reserved.
      </footer>
    </div>
  );
}
