import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import FireText from "./components/FireText.jsx";

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    isActive
      ? "relative text-purple-400 font-semibold text-lg sm:text-xl after:content-[''] after:block after:h-[3px] after:w-full after:bg-purple-500 after:rounded-full after:mt-1"
      : "text-gray-200 hover:text-purple-400 text-lg sm:text-xl transition-all duration-300 hover:scale-105";

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-200">
      {/* ================= NAVBAR ================= */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="flex justify-between items-center px-6 sm:px-10 py-4 sm:py-5 
          sticky top-0 z-50
          border border-gray-800/40
          bg-gradient-to-r from-gray-900/70 via-gray-800/60 to-gray-900/70 
          backdrop-blur-2xl 
        
          shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
      >
        {/* Logo */}
        <FireText className="text-white text-2xl sm:text-3xl font-extrabold drop-shadow-[0_2px_10px_rgba(168,85,247,0.7)]">
          Deep Nepse
        </FireText>

        {/* Desktop Links */}
        <div className="hidden sm:flex gap-8 items-center">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/features" className={linkClass}>
            Features
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>

          {/* CTA Button */}
          <button className="ml-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold shadow-[0_4px_20px_rgba(139,92,246,0.5)] hover:scale-105 hover:shadow-[0_6px_25px_rgba(139,92,246,0.7)] transition-transform duration-300">
            Get Started
          </button>
        </div>

        {/* Hamburger (Mobile) */}
        <button
          className="sm:hidden p-2 rounded-lg hover:bg-gray-800/70 cursor-pointer text-gray-300 shadow-md"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </motion.nav>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sm:hidden flex flex-col items-center gap-4 py-6 
            bg-gradient-to-b from-gray-900/95 to-gray-800/90 
            border-b border-gray-700/50 shadow-xl backdrop-blur-xl rounded-b-2xl"
        >
          <NavLink
            to="/"
            className={linkClass}
            end
            onClick={() => setMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/features"
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            Features
          </NavLink>
          <NavLink
            to="/about"
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            About
          </NavLink>

          <button
            onClick={() => setMenuOpen(false)}
            className="mt-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold shadow-[0_4px_15px_rgba(139,92,246,0.6)] hover:scale-105 hover:shadow-[0_6px_25px_rgba(139,92,246,0.8)] transition-transform duration-300"
          >
            Get Started
          </button>
        </motion.div>
      )}

      {/* ================= PAGE CONTENT ================= */}
      <main className="mb-10">
        <Outlet />
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 border-t border-gray-800 py-6 text-center text-gray-400 shadow-inner">
        <p>© {new Date().getFullYear()} Deep Nepse. All rights reserved.</p>
      </footer>
    </div>
  );
}
