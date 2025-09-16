import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";
import { LoadingSpinner } from "./LoadingSpinner";

// Helper functions
function calcSMA(data, period = 14) {
  const sma = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const sum = slice.reduce((a, b) => a + b.close, 0);
    sma.push({ time: data[i].time, value: sum / period });
  }
  return sma;
}

function calcEMA(data, period = 14) {
  const ema = [];
  const k = 2 / (period + 1);
  let prev = data[0].close;
  for (let i = 0; i < data.length; i++) {
    const val = data[i].close * k + prev * (1 - k);
    ema.push({ time: data[i].time, value: val });
    prev = val;
  }
  return ema;
}

function calcRSI(data, period = 14) {
  const rsi = [];
  let gains = 0,
    losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change > 0) gains += change;
    else losses -= change;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push({ time: data[i].time, value: 100 - 100 / (1 + rs) });
  }
  return rsi;
}

function Indicator({ symbol = "NABIL" }) {
  const mainRef = useRef(null);
  const rsiRef = useRef(null);
  const [loading, setLoading] = useState(LoadingSpinner());
  const [indicator, setIndicator] = useState("SMA"); // default selected
  const [ohlcv, setOhlcv] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8000/ohlcv/${symbol}?all_data=true`
        );
        const json = await res.json();
        if (!json.ohlcv || !Array.isArray(json.ohlcv))
          throw new Error("Invalid OHLCV");
        const filtered = json.ohlcv.filter(
          (d) =>
            !isNaN(d.open) && !isNaN(d.high) && !isNaN(d.low) && !isNaN(d.close)
        );
        setOhlcv(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [symbol]);

  useEffect(() => {
    if (!ohlcv.length || !mainRef.current) return;

    let mainChart, rsiChart;
    mainChart = createChart(mainRef.current, {
      width: mainRef.current.clientWidth,
      height: 400,
      layout: { background: { color: "#fff" }, textColor: "#333" },
      grid: { vertLines: { color: "#eee" }, horzLines: { color: "#eee" } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    });

    const candleSeries = mainChart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });
    candleSeries.setData(ohlcv);

    // Add series based on selection
    if (indicator === "SMA" || indicator === "All") {
      const smaSeries = mainChart.addSeries(LineSeries, {
        color: "blue",
        lineWidth: 2,
      });
      smaSeries.setData(calcSMA(ohlcv));
    }
    if (indicator === "EMA" || indicator === "All") {
      const emaSeries = mainChart.addSeries(LineSeries, {
        color: "orange",
        lineWidth: 2,
      });
      emaSeries.setData(calcEMA(ohlcv));
    }
    if (indicator === "RSI" || indicator === "All") {
      rsiChart = createChart(rsiRef.current, {
        width: rsiRef.current.clientWidth,
        height: 150,
        layout: { background: { color: "#f8f8f8" }, textColor: "#333" },
        grid: { vertLines: { color: "#eee" }, horzLines: { color: "#eee" } },
        rightPriceScale: { borderVisible: false },
        timeScale: { visible: false },
      });
      const rsiSeries = rsiChart.addSeries(LineSeries, { color: "purple" });
      rsiSeries.setData(calcRSI(ohlcv));
    }

    mainChart.timeScale().fitContent();

    const handleResize = () => {
      if (mainChart) mainChart.resize(mainRef.current.clientWidth, 400);
      if (rsiChart) rsiChart?.resize(rsiRef.current.clientWidth, 150);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      mainChart.remove();
      rsiChart?.remove();
    };
  }, [ohlcv, indicator]);

  return (
    <div className="w-full bg-white rounded-xl shadow p-2">
      {loading && <LoadingSpinner />}

      {/* Dropdown to select indicator */}
      <div className="mb-2 border-1">
        <label className="font-bold mr-2">Indicator:</label>
        <select
          value={indicator}
          onChange={(e) => setIndicator(e.target.value)}
          className="p-2 rounded border-1 border-gray-400 text-black"
        >
          <option value="SMA">SMA</option>
          <option value="EMA">EMA</option>
          <option value="RSI">RSI</option>
          <option value="All">Select all</option>
        </select>
      </div>

      <div ref={mainRef} className="w-full mb-2" />
      {(indicator === "RSI" || indicator === "All") && (
        <div ref={rsiRef} className="w-full" />
      )}
    </div>
  );
}

export default Indicator;
