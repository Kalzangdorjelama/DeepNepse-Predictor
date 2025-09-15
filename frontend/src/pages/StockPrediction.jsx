import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import loadingSpinner from "../loadingSpinner/LoadingSpinner.jsx";
import { fetchPrediction } from "../api";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import "../styles.css";

const stockSymbols = [
  "ADBL",
  "CZBIL",
  "EBL",
  "GBIME",
  "HBL",
  "KBL",
  "MBL",
  "NABIL",
  "NBL",
  "NICA",
  "NIMB",
  "NMB",
  "PCBL",
  "PRVU",
  "SANIMA",
  "SBL",
  "SCB",
];

function StockPrediction() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState(null);
  const [status, setStatus] = useState(loadingSpinner());
  const [allPrices, setAllPrices] = useState({}); // store yesterday/day-2 for each stock

  // Fetch prediction for a single stock (used for main chart)
  const loadPredictionForSymbol = async (sym) => {
    try {
      const data = await fetchPrediction(sym);
      if (!data?.predictions) return null;

      const lstm = Number(data.predictions.LSTM).toFixed(2);
      const gru = Number(data.predictions.GRU).toFixed(2);
      const average = ((+lstm + +gru) / 2).toFixed(2);

      const historyData = (data.history || []).map((h) => ({
        date: h.date,
        price: +h.price,
      }));

      const chartData = [
        ...historyData,
        {
          date: "Predicted Price",
          price: +average,
          lstm: +lstm,
          gru: +gru,
          average: +average,
        },
      ];

      // Save yesterday/day-2 for ticker
      if (data.history?.length >= 3) {
        const day2 = data.history.find((h) => h.date.includes("Day-2"))?.price;
        const yesterday = data.history.find((h) =>
          h.date.includes("Yesterday")
        )?.price;
        setAllPrices((prev) => ({
          ...prev,
          [data.symbol]: { day2, yesterday },
        }));
      }

      return { lstm, gru, average, chartData };
    } catch (e) {
      console.log("Failed to fetch:", sym, e);
      return null;
    }
  };

  // Load main stock prediction (selected symbol)
  useEffect(() => {
    async function loadMainPrediction() {
      setStatus(loadingSpinner());
      const result = await loadPredictionForSymbol(symbol);
      if (result) {
        setPredictions(result);
        setStatus("");
      } else {
        setStatus("Failed to load prediction");
      }
    }
    loadMainPrediction();
  }, [symbol]);

  // Load all stocks for ticker
  useEffect(() => {
    async function loadAllPrices() {
      for (let sym of stockSymbols) {
        console.log("ALL STOCK :", sym);
        await loadPredictionForSymbol(sym);
      }
    }
    loadAllPrices();
  }, []);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-gray-900 text-white p-8">
      {/* Scrolling Stock Ticker */}
      <div className="absolute top-0 left-0 w-full overflow-hidden bg-black/40 backdrop-blur-md py-2 border-b border-blue-400">
        <div className="animate-marquee flex gap-10 whitespace-nowrap text-lg font-semibold">
          {/* duplicate for infinite loop */}
          {stockSymbols.map((s, i) => {
            const priceData = allPrices[s] || {};
            const yesterday = priceData.yesterday;
            const day2 = priceData.day2;

            let yesterdayColor = "text-gray-300";
            let arrow = null;

            if (yesterday != null && day2 != null) {
              if (yesterday > day2) {
                yesterdayColor = "text-green-400";
                arrow = "↑";
              } else if (yesterday < day2) {
                yesterdayColor = "text-red-400";
                arrow = "↓";
              }
            }

            return (
              <span key={`dup-${i}`} className="flex items-center gap-2">
                <span className="text-blue-300">{s}</span>
                {yesterday != null && (
                  <span className={`${yesterdayColor}`}>
                    Rs {yesterday}{" "}
                    {arrow && (
                      <span className={`${yesterdayColor} font-bold`}>
                        {arrow}
                      </span>
                    )}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="px-5 py-2 flex items-center gap-2 bg-black-800/70 backdrop-blur-md rounded-xl shadow hover:bg-blue-500 transition border-2 border-blue-200 cursor-pointer absolute top-15 left-5 hover:border-blue-500"
      >
        Back
      </button>

      {/* Header */}
      <div className="text-center mb-6 mt-8">
        <p className="mt-5 text-gray-300 text-base my-4">
          <span className="my-4 text-2xl">
            Prediction of next day's closing price of
          </span>
          <span className="font-bold bg-green-700 px-3 py-1 mx-4 border-2 rounded-xl text-3xl">
            {symbol?.toUpperCase()}
          </span>
        </p>
        <span className="text-lg">
          {tomorrow.toLocaleDateString("en-US", options)}
        </span>
      </div>

      {status && (
        <div className="text-blue-400 text-center text-5xl">{status}</div>
      )}

      {predictions && (
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Chart Area */}
          <div className="md:col-span-2 bg-white/10 backdrop-blur-lg p-4 rounded-xl shadow-lg">
            <h2 className="text-lg font-bold mb-3">
              Closing Price Trend & Predictions
            </h2>
            <div className="h-90">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={predictions.chartData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#444" />
                  <XAxis dataKey="date" stroke="#ccc" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#ccc" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderRadius: "8px",
                      border: "1px solid #374151",
                      color: "#fff",
                    }}
                    formatter={(value, name) => [`Rs. ${value}`, name]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Actual Price"
                  />
                  <Line
                    type="monotone"
                    dataKey="lstm"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="LSTM Prediction"
                  />
                  <Line
                    type="monotone"
                    dataKey="gru"
                    stroke="#a855f7"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="GRU Prediction"
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    name="Average Prediction"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Predictions Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-2xl shadow-lg text-center">
              <h3 className="text-xl font-bold mb-2">LSTM</h3>
              <p className="text-3xl font-extrabold">Rs {predictions.lstm}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-center">
              <h3 className="text-xl font-bold mb-2">GRU</h3>
              <p className="text-3xl font-extrabold">Rs {predictions.gru}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-2xl shadow-lg text-center">
              <h3 className="text-xl font-bold mb-2">Average</h3>
              <p className="text-3xl font-extrabold">
                Rs {predictions.average}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockPrediction;
