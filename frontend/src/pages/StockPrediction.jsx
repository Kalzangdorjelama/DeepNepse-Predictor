import { useEffect, useState } from "react";
import { fetchPrediction } from "../api";
import { useParams, useNavigate } from "react-router-dom";
import {
  LoadingSpinner,
  PieCharts,
  PredictionsSidebar,
  LineCharts,
  CandleStickCharts,
  Indicator,
  VolumeBars,
} from "../index.js";
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
  const [status, setStatus] = useState(LoadingSpinner());
  const [allPrices, setAllPrices] = useState({});
  const [selectedChart, setSelectedChart] = useState(""); // empty by default

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

      if (data.history?.length >= 2) {
        const len = data.history.length;
        const day2 = data.history[len - 2].price;
        const yesterday = data.history[len - 1].price;
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

  useEffect(() => {
    async function loadMainPrediction() {
      setStatus(LoadingSpinner());
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

  useEffect(() => {
    async function loadAllPrices() {
      for (let sym of stockSymbols) {
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
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-gray-900 text-white p-4 sm:p-6 md:p-8 overflow-x-hidden">
      {/* Stock ticker */}
      <div className="absolute top-0 left-0 w-full bg-black/40 backdrop-blur-md py-2 border-b border-blue-400">
        <div className="animate-marquee flex gap-10 whitespace-nowrap text-sm sm:text-base md:text-lg font-semibold px-4">
          {stockSymbols.map((s, i) => {
            const symbolKey = s.toUpperCase();
            const priceData = allPrices[symbolKey];
            if (!priceData) {
              return (
                <span key={i} className="text-gray-500">
                  {s}: loading...
                </span>
              );
            }

            const yesterday = Number(priceData?.yesterday ?? NaN);
            const day2 = Number(priceData?.day2 ?? NaN);

            let color = "text-gray-300";
            let arrow = "-";

            if (!isNaN(yesterday) && !isNaN(day2)) {
              if (yesterday > day2) {
                color = "text-green-400";
                arrow = "↑";
              } else if (yesterday < day2) {
                color = "text-red-400";
                arrow = "↓";
              } else {
                color = "text-yellow-300";
                arrow = "-";
              }
            }

            return (
              <span key={i} className="flex items-center gap-2">
                <span className="text-blue-300">{s}</span>
                <span className={`${color}`}>
                  Rs {isNaN(yesterday) ? "N/A" : yesterday}{" "}
                  <span className="font-bold">{arrow}</span>
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Controls (Back button + Dropdown) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8">
        <button
          onClick={() => navigate("/")}
          className="px-4 sm:px-5 py-2 flex items-center gap-2 bg-blue-800 backdrop-blur-md rounded-lg shadow hover:bg-blue-500 transition border border-blue-200 hover:border-blue-500 cursor-pointer"
        >
          Back
        </button>

        {predictions && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-base sm:text-lg">
              Select Chart:
            </span>
            <select
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value)}
              className="p-2 rounded bg-blue-900 text-white border border-gray-500 cursor-pointer hover:bg-gray-800 outline-0 text-sm sm:text-base"
            >
              <option value="">Predicted price</option>
              <option value="LineCharts">Line Chart</option>
              <option value="LightWeight">Candlestick Chart</option>
              <option value="Indicator">Indicator Chart</option>
              <option value="Volume">Volume Bars</option>
            </select>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="text-center mb-6 mt-6 sm:mt-8">
        <p className="text-gray-300 text-sm sm:text-base md:text-lg">
          <span className="block sm:inline text-xl sm:text-2xl md:text-3xl mb-4">
            Prediction of next day's closing price of
          </span>
          <span className="sm:inline font-bold bg-green-700 px-3 py-1 mx-2 border-2 rounded-xl text-2xl sm:text-3xl md:text-4xl mt-2 sm:mt-0">
            {symbol?.toUpperCase()}
          </span>
        </p>
        <span className="text-sm sm:text-lg">
          {tomorrow.toLocaleDateString("en-US", options)}
        </span>
      </div>

      {/* Status */}
      {status && (
        <div className="text-blue-400 text-center text-3xl sm:text-4xl md:text-5xl">
          {status}
        </div>
      )}

      {/* Predictions */}
      {predictions && (
        <div className="mt-6">
          {selectedChart === "" ? (
            <div className="flex flex-col lg:flex-row justify-center items-center gap-10 sm:gap-20 mt-4 mb-8">
              <PieCharts predictions={predictions} />
              <PredictionsSidebar predictions={predictions} />
            </div>
          ) : selectedChart === "LineCharts" ? (
            <LineCharts chartData={predictions.chartData} />
          ) : selectedChart === "LightWeight" ? (
            <CandleStickCharts symbol={symbol} />
          ) : selectedChart === "Indicator" ? (
            <Indicator symbol={symbol} />
          ) : selectedChart === "Volume" ? (
            <VolumeBars symbol={symbol} />
          ) : null}
        </div>
      )}
    </div>
  );
}

export default StockPrediction;
