import { NavLink, Outlet } from "react-router-dom";
import "./styles.css";
import FireText from "./components/FireText.jsx";

export default function Layout() {
  const linkClass = ({ isActive }) =>
    isActive
      ? "text-blue-600 font-semibold border-b-2 border-blue-600 text-lg sm:text-xl"
      : "text-gray-700 hover:text-blue-600 text-lg sm:text-xl";

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 text-gray-800">
      {/* Navbar */}
      <nav className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-10 py-4 sm:py-5 bg-white shadow-md sticky top-0 z-50">
        <FireText>Deep Nepse</FireText>

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
      <main className="flex-grow p-4 sm:p-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-inner mt-4 py-6 text-center text-gray-600">
        <p>© {new Date().getFullYear()} Deep Nepse. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500"
          >
            Twitter
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-700"
          >
            LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
}
