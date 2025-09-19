import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSymbols } from "../api/api.js";
import { motion } from "framer-motion";
import "../index.css";
import { LoadingSpinner } from "../index.js";

function Home() {
  const [symbols, setSymbols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function loadSymbols() {
      try {
        const data = await fetchSymbols();
        if (isMounted) setSymbols(data.symbols || []);
      } catch (err) {
        console.error("Error fetching symbols:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSymbols();
    return () => (isMounted = false);
  }, []);

  const handlePredict = () => {
    if (symbol) navigate(`/stock/${symbol.toUpperCase()}`);
  };

  const tryPredictionsNow = () => {
    const section = document.getElementById("prediction-section");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  // Motion variants
  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, type: "spring", stiffness: 80 },
    },
  };

  return (
    <div className="bg-gray-950 text-gray-200 min-h-screen">
      {/* Hero Section */}
      <motion.section
        id="prediction-section"
        className="relative text-center py-20 px-6 lg:px-12 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={container}
      >
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-purple-700 rounded-full blur-3xl opacity-20"></div>

        <motion.div className="relative z-10" variants={item}>
          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight"
            variants={item}
          >
            NEPSE Predictions <br />
            with <span className="text-purple-500">AI Insights</span>
          </motion.h2>

          <motion.p
            className="mt-6 text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto"
            variants={item}
          >
            Stay ahead in the Nepal Stock Exchange with real-time AI-powered
            forecasts. Make decisions with confidence.
          </motion.p>
        </motion.div>
      </motion.section>

      {/* Stock Selector Card */}

      {/* Dropdown + Button Wrapper */}
      <div className="-mt-10 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-0 relative">
        {/* Dropdown */}
        {loading ? (
          // Show spinner while fetching
          <div className="flex justify-center items-center w-72 sm:w-80 h-[60px] bg-gray-800 rounded-lg border border-gray-700">
            <LoadingSpinner />
          </div>
        ) : (
          <select
            disabled={!symbols.length}
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-72 sm:w-80 px-4 py-4 bg-gray-800 text-white rounded-lg sm:rounded-l-lg sm:rounded-r-none cursor-pointer text-lg sm:text-xl font-mono border border-gray-700"
          >
            <option value="">Select a Stock</option>
            {symbols.map((s, i) => (
              <option key={i} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}

        {/* Predict Button */}
        <button
          onClick={handlePredict}
          disabled={!symbol || loading}
          className={`w-72 sm:w-auto px-6 py-4 font-semibold rounded-lg sm:rounded-r-lg sm:rounded-l-none text-lg transition-colors duration-200 cursor-pointer ${
            !loading && symbol
              ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
        >
          Predict
        </button>
      </div>

      {/* Call to Action */}
      <motion.section
        className="mt-20 sm:mt-28 py-16 text-center bg-gray-900 border border-gray-800 text-gray-100 mx-4 sm:mx-10 rounded-xl shadow-lg"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <motion.h3
          className="text-3xl sm:text-4xl md:text-5xl font-bold"
          variants={item}
        >
          Trade Smarter with AI-Powered Insights
        </motion.h3>
        <motion.p
          className="mt-4 text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-gray-400"
          variants={item}
        >
          Analyze NEPSE like a pro. Reduce risks, save time, and grow your
          investments with powerful stock predictions.
        </motion.p>

        <motion.button
          onClick={tryPredictionsNow}
          className="mt-8 px-8 py-4 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-lg shadow-md cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          Try Predictions Now
        </motion.button>
      </motion.section>
    </div>
  );
}

export default Home;
