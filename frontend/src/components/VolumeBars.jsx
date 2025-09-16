import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";
import { LoadingSpinner } from "./LoadingSpinner";

function VolumeBars({ symbol = "NABIL" }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleRef = useRef(null);
  const volumeRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Init chart
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

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      borderUpColor: "#26a69a",
      wickUpColor: "#26a69a",
      downColor: "#ef5350",
      borderDownColor: "#ef5350",
      wickDownColor: "#ef5350",
      barSpacing: 15,
      priceLineVisible: true,
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candleRef.current = candleSeries;
    volumeRef.current = volumeSeries;

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

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `http://localhost:8000/ohlcv/${symbol}?all_data=true`
        );
        const json = await res.json();

        if (json.ohlcv && Array.isArray(json.ohlcv)) {
          candleRef.current.setData(json.ohlcv);

          const volumeData = json.ohlcv.map((d) => ({
            time: d.time,
            value: d.volume,
            color: d.close >= d.open ? "#26a69a" : "#ef5350",
          }));
          volumeRef.current.setData(volumeData);

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

  // Switch theme
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
      className={`w-full h-[500px] rounded-xl shadow p-2 mb-11 relative
      ${darkMode ? "bg-[#0f172a]" : "bg-white"}`}
    >
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode((prev) => !prev)}
        className="absolute top-2 right-2 px-3 py-2 bg-blue-900 text-white rounded-md text-sm z-10 cursor-pointer"
      >
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>

      {loading && <LoadingSpinner />}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}

export default VolumeBars;
