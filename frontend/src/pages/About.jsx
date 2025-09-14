import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function About() {
  const navigate = useNavigate();
  function predict() {
    navigate(`/`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Variants
  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };
  const item = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, type: "spring", stiffness: 80 },
    },
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <motion.section
        className="py-20 text-center bg-gray-800 text-white mx-3 mt-3"
        initial="hidden"
        animate="visible"
        variants={container}
      >
        <motion.h1 className="text-4xl font-extrabold" variants={item}>
          About DeepNepse
        </motion.h1>
        <motion.p
          className="mt-6 max-w-3xl mx-auto text-lg opacity-90 px-6"
          variants={item}
        >
          DeepNepse is your AI-powered companion for smarter NEPSE stock
          predictions. We combine the power of{" "}
          <span className="font-semibold">LSTM & GRU models</span> with
          real-time data to give traders, students, and researchers reliable
          insights.
        </motion.p>
      </motion.section>

      {/* Mission / Vision */}
      <motion.section
        className="py-16 px-6 max-w-6xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={container}
      >
        <motion.h2
          className="text-3xl font-bold text-gray-900 text-center"
          variants={item}
        >
          Our Mission
        </motion.h2>
        <motion.p
          className="mt-6 text-lg text-gray-600 text-center max-w-3xl mx-auto"
          variants={item}
        >
          We aim to make stock forecasting in Nepal more accessible, accurate,
          and insightful by bringing cutting-edge deep learning technology to
          everyone — from casual investors to serious researchers.
        </motion.p>
      </motion.section>

      {/* Highlights Grid */}
      <motion.section
        className="py-16 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={container}
      >
        {[
          {
            title: "Cutting-Edge AI",
            icon: "🤖",
            desc: "Powered by advanced LSTM & GRU models trained on NEPSE data, delivering accurate predictions.",
          },
          {
            title: "For Everyone",
            icon: "👥",
            desc: "Whether you’re a trader, student, or researcher, DeepNepse helps you understand market trends and reduce risks.",
          },
          {
            title: "Smarter Decisions",
            icon: "🎯",
            desc: "Plan investments with confidence using our AI-driven insights and predictive analytics.",
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition cursor-pointer"
            variants={item}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-blue-600 text-4xl mb-4 text-center">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-blue-600 text-center">
              {feature.title}
            </h3>
            <p className="mt-4 text-gray-600 text-center">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Call to Action */}
      <motion.section
        className="py-20 text-center bg-gray-800 text-white mx-3"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <motion.h2
          className="text-3xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Ready to Forecast Smarter?
        </motion.h2>
        <motion.p
          className="mt-4 text-lg opacity-90"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Explore the power of AI in stock prediction today.
        </motion.p>

        <motion.button
          onClick={() => predict()}
          className="w-70 mt-5 px-10 py-4 bg-blue-500 rounded-xl font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          Get Started
        </motion.button>
      </motion.section>
    </div>
  );
}

export default About;
