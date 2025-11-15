import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function About() {
  const navigate = useNavigate();

  function predict() {
    navigate(`/`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Smooth fade + upward motion
  const fadeUp = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-gray-950 min-h-screen text-gray-200 mb-20">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            About{" "}
            <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              DeepNepse
            </span>
          </h1>

          <p className="mt-6 text-lg text-gray-400 leading-relaxed">
            DeepNepse combines{" "}
            <span className="text-gray-200 font-semibold">
              LSTM & GRU deep learning models
            </span>{" "}
            with NEPSE market data to deliver reliable stock trend insights for
            traders, students, and researchers.
          </p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 bg-gray-900/30 border-y border-gray-800">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Our Mission
          </h2>

          <p className="mt-6 text-lg text-gray-400 leading-relaxed">
            To make stock forecasting more{" "}
            <span className="text-white font-medium">
              accessible, accurate, and insightful
            </span>{" "}
            for everyone — from new investors to data-driven researchers —
            leveraging smart AI.
          </p>
        </motion.div>
      </section>

      {/* Features / Highlights */}
      <section className="py-20 px-6 max-w-6xl mx-auto mt-10 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: "Cutting-Edge AI",
              icon: "🤖",
              desc: "Advanced LSTM & GRU models trained on real NEPSE data for high-accuracy forecasts.",
            },
            {
              title: "Made for Everyone",
              icon: "👥",
              desc: "Useful for traders, students, analysts, and anyone wanting to understand Nepal's stock trends.",
            },
            {
              title: "Better Decisions",
              icon: "🎯",
              desc: "Use AI-powered predictions to plan trades and reduce uncertainty with confidence.",
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="bg-gray-900/40 border border-gray-800 px-8 py-10 rounded-2xl shadow-lg hover:shadow-purple-500/20 transition-all cursor-pointer hover:-translate-y-1"
            >
              <div className="text-purple-500 text-5xl mb-5 text-center">
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-white text-center">
                {feature.title}
              </h3>

              <p className="mt-4 text-gray-400 text-center leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Indicators Section */}
      <section className="py-20 px-6 bg-gray-900/30 border-y border-gray-800 mt-10">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Technical Indicators We Use
          </h2>

          <p className="mt-6 text-lg text-gray-400 leading-relaxed">
            DeepNepse combines both{" "}
            <span className="text-white font-medium">AI predictions</span> and{" "}
            <span className="text-white font-medium">
              classic market indicators
            </span>{" "}
            to help you understand NEPSE trends more clearly.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-14 max-w-5xl mx-auto">
          {[
            {
              title: "Simple Moving Average (SMA)",
              icon: "📈",
              desc: "Shows the average price over a selected period to help identify trend direction.",
            },
            {
              title: "Exponential Moving Average (EMA)",
              icon: "⚡",
              desc: "Places more weight on recent prices to react faster to trend changes.",
            },
            {
              title: "Relative Strength Index (RSI)",
              icon: "📊",
              desc: "Measures price momentum to reveal overbought and oversold zones.",
            },
            {
              title: "On-Balance Volume (OBV)",
              icon: "📦",
              desc: "Combines volume flow with price movement to spot trend strength and reversals.",
            },
            {
              title: "Volume Chart",
              icon: "📉",
              desc: "Visualizes buying and selling pressure to understand the strength of price movements.",
            },
          ].map((ind, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="bg-gray-900/40 border border-gray-800 px-8 py-10 rounded-2xl shadow-lg hover:shadow-purple-500/20 transition-all hover:-translate-y-1"
            >
              <div className="text-purple-500 text-4xl mb-5 text-center">
                {ind.icon}
              </div>

              <h3 className="text-xl font-bold text-white text-center">
                {ind.title}
              </h3>

              <p className="mt-4 text-gray-400 text-center leading-relaxed">
                {ind.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-center bg-gray-900 border-t border-gray-800">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Ready to Forecast Smarter?
        </motion.h2>

        <motion.p
          className="mt-4 text-lg text-gray-400"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Start exploring AI-driven NEPSE predictions now.
        </motion.p>

        <motion.button
          onClick={predict}
          className="mt-8 px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          Get Started
        </motion.button>
      </section>
    </div>
  );
}

export default About;
