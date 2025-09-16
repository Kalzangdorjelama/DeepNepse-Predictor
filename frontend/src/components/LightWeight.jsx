import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import { LoadingSpinner } from "./LoadingSpinner";

function LightWeight({ symbol = "NABIL" }) {
  const chartContainerRef = useRef(null);
  const [loading, setLoading] = useState(LoadingSpinner());
  // const [status, setStatus] = useState(LoadingSpinner());

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: { background: { color: "#fff" }, textColor: "#333" },
      grid: { vertLines: { color: "#eee" }, horzLines: { color: "#eee" } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    });

    // Add candlestick series (v4+ API)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      borderUpColor: "#26a69a",
      wickUpColor: "#26a69a",
      downColor: "#ef5350",
      borderDownColor: "#ef5350",
      wickDownColor: "#ef5350",
      barSpacing: 15, // space between candles
      priceLineVisible: true,
    });

    // Fetch all OHLCV data from backend
    async function fetchData() {
      try {
        const res = await fetch(
          `http://localhost:8000/ohlcv/${symbol}?all_data=true`
        );
        const json = await res.json();
        console.log("RESPONSE: ", json);

        if (json.ohlcv && Array.isArray(json.ohlcv)) {
          candlestickSeries.setData(json.ohlcv);
          chart.timeScale().fitContent();
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

    // Handle resizing
    const handleResize = () => {
      chart.resize(
        chartContainerRef.current.clientWidth,
        chartContainerRef.current.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [symbol]);

  return (
    <div className="w-full h-[500px] bg-white rounded-xl shadow p-2 mb-1">
      {loading && <LoadingSpinner />}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}

export default LightWeight;
