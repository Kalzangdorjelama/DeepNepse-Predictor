import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSymbols } from "../api";
import { motion } from "framer-motion";
import "../index.css";

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
    <div className="bg-gradient-to-b from-blue-50 to-gray-50 text-gray-800 min-h-screen">
      {/* Hero Section */}
      <motion.section
        id="prediction-section"
        className="relative text-center py-24 px-6 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={container}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-100 to-transparent rounded-full blur-3xl opacity-40"></div>

        <motion.div className="relative z-10" variants={item}>
          <motion.h2
            className="text-5xl font-extrabold text-gray-900 leading-tight"
            variants={item}
          >
            Smarter Stock Predictions <br />
            with <span className="text-blue-600">AI Insights</span>
          </motion.h2>

          <motion.p
            className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto"
            variants={item}
          >
            Stay ahead in the NEPSE market with AI-powered predictions. Plan
            better, invest smarter, and reduce risks.
          </motion.p>
        </motion.div>

        {/* Dropdown + Predict Button */}
      </motion.section>

      <div className="-mt-1 flex justify-center relative">
        <select
          disabled={loading || !symbols.length}
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="w-80 px-4 py-5 bg-gray-800 text-white rounded-l-lg cursor-pointer text-xl"
        >
          <option value="">Select a Stock</option>
          {symbols.map((s, i) => (
            <option key={i} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* ================================ */}
        <button
          onClick={handlePredict}
          className="px-6 py-4 bg-blue-600 text-white font-semibold rounded-r-lg hover:bg-blue-700 cursor-pointer"
        >
          Predict
        </button>
        {/* ================================ */}
      </div>

      {/* Call to Action */}
      <motion.section
        className="py-20 text-center bg-gray-800 text-white mt-10 mx-3"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <motion.h3 className="text-4xl font-bold" variants={item}>
          Take the Next Step in Stock Forecasting
        </motion.h3>
        <motion.p className="mt-4 text-lg max-w-2xl mx-auto" variants={item}>
          Explore the power of AI to analyze NEPSE trends. Save time, reduce
          risks, and grow smarter with predictions.
        </motion.p>

        <motion.button
          onClick={tryPredictionsNow}
          className="w-70 mt-5 px-10 py-4 bg-blue-500 rounded-xl font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
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
