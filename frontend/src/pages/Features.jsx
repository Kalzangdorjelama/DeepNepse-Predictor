import { motion } from "framer-motion";

function Features() {
  // Motion variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const card = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, type: "spring", stiffness: 80 },
    },
  };

  return (
    <section className="py-20 bg-gray-950 min-h-screen text-gray-200">
      {/* Heading */}
      <motion.h3
        className="text-4xl font-bold text-center text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Why Choose <span className="text-purple-500">DeepNepse?</span>
      </motion.h3>

      <motion.p
        className="mt-4 text-center text-gray-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        A powerful stock prediction platform built with modern AI.
      </motion.p>

      {/* Cards */}
      <motion.div
        className="mt-14 grid md:grid-cols-3 gap-10 px-6 sm:px-10 max-w-6xl mx-auto"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Card 1 */}
        <motion.div
          className="p-8 bg-gray-900 border border-gray-800 rounded-2xl shadow-lg hover:shadow-purple-500/20 transition cursor-pointer"
          variants={card}
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-purple-500 text-4xl mb-4 text-center">📊</div>
          <h4 className="font-bold text-xl text-center text-white">
            AI-Powered Predictions
          </h4>
          <p className="mt-3 text-gray-400 text-center">
            Deep learning models (LSTM & GRU) trained on NEPSE data to forecast
            stock movements accurately.
          </p>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          className="p-8 bg-gray-900 border border-gray-800 rounded-2xl shadow-lg hover:shadow-purple-500/20 transition cursor-pointer"
          variants={card}
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-purple-500 text-4xl mb-4 text-center">⚡</div>
          <h4 className="font-bold text-xl text-center text-white">
            Real-Time Insights
          </h4>
          <p className="mt-3 text-gray-400 text-center">
            Get instant predictions with easy-to-read visualizations and stock
            trends.
          </p>
        </motion.div>

        {/* Card 3 */}
        <motion.div
          className="p-8 bg-gray-900 border border-gray-800 rounded-2xl shadow-lg hover:shadow-purple-500/20 transition cursor-pointer"
          variants={card}
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-purple-500 text-4xl mb-4 text-center">🎯</div>
          <h4 className="font-bold text-xl text-center text-white">
            User-Friendly Dashboard
          </h4>
          <p className="mt-3 text-gray-400 text-center">
            Minimal, intuitive interface designed for students, traders, and
            researchers.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Features;
