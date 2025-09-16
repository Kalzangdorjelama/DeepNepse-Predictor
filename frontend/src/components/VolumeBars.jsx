import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";
import { LoadingSpinner } from "./LoadingSpinner";

function VolumeBars({ symbol = "NABIL" }) {
  const chartContainerRef = useRef(null);
  const [loading, setLoading] = useState(LoadingSpinner());

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

    // Candlestick series
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

    // Volume series (histogram at bottom)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      scaleMargins: {
        top: 0.8, // candlestick occupies top 80%
        bottom: 0,
      },
    });

    // Fetch OHLCV data
    async function fetchData() {
      try {
        const res = await fetch(
          `http://localhost:8000/ohlcv/${symbol}?all_data=true`
        );
        const json = await res.json();

        if (json.ohlcv && Array.isArray(json.ohlcv)) {
          // Candlestick data
          candleSeries.setData(json.ohlcv);

          // Volume data
          const volumeData = json.ohlcv.map((d) => ({
            time: d.time,
            value: d.volume,
            color: d.close >= d.open ? "#26a69a" : "#ef5350",
          }));
          volumeSeries.setData(volumeData);

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

    // Handle window resize
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
    <div className="w-full h-[500px] bg-white rounded-xl shadow p-2 mb-11">
      {loading && <LoadingSpinner />}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}

export default VolumeBars;
