import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import { LoadingSpinner } from "./LoadingSpinner.jsx";
import { BsSun, BsMoon } from "react-icons/bs";
import VITE_API_URL from "../api/api.js";

function CandleStickCharts({ symbol = "NABIL" }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize chart only once
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: { background: { color: "#fff" }, textColor: "#333" },
      grid: { vertLines: { color: "#eee" }, horzLines: { color: "#eee" } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      borderUpColor: "#26a69a",
      wickUpColor: "#26a69a",
      downColor: "#ef5350",
      borderDownColor: "#ef5350",
      wickDownColor: "#ef5350",
      barSpacing: 15,
      priceLineVisible: true,
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Resize handler
    const handleResize = () => {
      chart.resize(
        chartContainerRef.current.clientWidth,
        chartContainerRef.current.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // Fetch data when symbol changes
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `${VITE_API_URL}/ohlcv/${symbol}?all_data=true`
        );
        const json = await res.json();

        if (json.ohlcv && Array.isArray(json.ohlcv)) {
          seriesRef.current.setData(json.ohlcv);
          chartRef.current.timeScale().fitContent();
        } else {
          console.error("Invalid OHLCV data:", json);
        }
      } catch (err) {
        console.error("Error fetching OHLCV:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [symbol]);

  // Apply theme when darkMode changes
  useEffect(() => {
    if (!chartRef.current) return;

    if (darkMode) {
      chartRef.current.applyOptions({
        layout: { background: { color: "#0f172a" }, textColor: "#cbd5e1" },
        grid: {
          vertLines: { color: "#1e293b" },
          horzLines: { color: "#1e293b" },
        },
      });
    } else {
      chartRef.current.applyOptions({
        layout: { background: { color: "#fff" }, textColor: "#333" },
        grid: { vertLines: { color: "#eee" }, horzLines: { color: "#eee" } },
      });
    }
  }, [darkMode]);

  return (
    <div
      className={`w-full h-[520px] rounded-xl shadow p-2 -mb-6 relative overflow-y-hidden
      ${darkMode ? "bg-[#0f172a]" : "bg-white"}`}
    >
      <h2 className="text-lg font-bold mb-3 text-center mr-2">
        <span className="ml-2 text-2xl text-orange-500 bg-blue-900 p-2 md:text-lg">
          {symbol?.toUpperCase()}{" "}
          <span className="text-xl">Candlestick Chart</span>
        </span>
      </h2>
      {/* Dark Mode Toggle Button */}
      <button
        onClick={() => setDarkMode((prev) => !prev)}
        className="absolute top-3 right-1 px-4 py-2 bg-blue-900 text-white text-sm z-10 rounded-sm cursor-pointer -mt-1 mr-2"
      >
        {darkMode ? <BsMoon size={20} /> : <BsSun size={20} />}
      </button>

      {loading && <LoadingSpinner />}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}

export default CandleStickCharts;
