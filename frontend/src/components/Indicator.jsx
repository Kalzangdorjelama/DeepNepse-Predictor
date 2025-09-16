import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";
import { LoadingSpinner } from "./LoadingSpinner";
import { BsSun, BsMoon } from "react-icons/bs"; 

// ----------------- Indicators -----------------
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
  const [loading, setLoading] = useState(false);
  const [indicator, setIndicator] = useState("SMA");
  const [ohlcv, setOhlcv] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  // Fetch data
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

  // Build charts
  useEffect(() => {
    if (!ohlcv.length || !mainRef.current) return;

    let mainChart, rsiChart;
    mainChart = createChart(mainRef.current, {
      width: mainRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: darkMode ? "#0f172a" : "#fff" },
        textColor: darkMode ? "#e2e8f0" : "#333",
      },
      grid: {
        vertLines: { color: darkMode ? "#1e293b" : "#eee" },
        horzLines: { color: darkMode ? "#1e293b" : "#eee" },
      },
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
      if (!rsiRef.current) return;
      rsiChart = createChart(rsiRef.current, {
        width: rsiRef.current.clientWidth,
        height: 150,
        layout: {
          background: { color: darkMode ? "#1e293b" : "#f8f8f8" },
          textColor: darkMode ? "#e2e8f0" : "#333",
        },
        grid: {
          vertLines: { color: darkMode ? "#334155" : "#eee" },
          horzLines: { color: darkMode ? "#334155" : "#eee" },
        },
        rightPriceScale: { borderVisible: false },
        timeScale: { visible: false },
      });

      const rsiSeries = rsiChart.addSeries(LineSeries, { color: "purple" });
      rsiSeries.setData(calcRSI(ohlcv));

      // RSI thresholds
      const overbought = rsiChart.addSeries(LineSeries, {
        color: "red",
        lineWidth: 1,
      });
      overbought.setData(ohlcv.map((d) => ({ time: d.time, value: 70 })));

      const oversold = rsiChart.addSeries(LineSeries, {
        color: "green",
        lineWidth: 1,
      });
      oversold.setData(ohlcv.map((d) => ({ time: d.time, value: 30 })));
    }

    mainChart.timeScale().fitContent();

    const handleResize = () => {
      if (mainChart && mainRef.current)
        mainChart.resize(mainRef.current.clientWidth, 400);
      if (rsiChart && rsiRef.current)
        rsiChart.resize(rsiRef.current.clientWidth, 150);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      mainChart.remove();
      rsiChart?.remove();
    };
  }, [ohlcv, indicator, darkMode]);

  return (
    <div
      className={`w-full rounded-xl shadow p-2 pr-6 relative
      ${darkMode ? "bg-[#0f172a]" : "bg-white"}`}
    >
      {loading && <LoadingSpinner />}

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode((prev) => !prev)}
        className="absolute top-2 right-2 px-3 py-2 bg-blue-900 text-white rounded text-sm z-10 cursor-pointer"
      >
        {darkMode ? <BsSun size={20} /> : <BsMoon size={20} />}
      </button>

      {/* Indicator Legend */}
      <div className="flex gap-4 mb-2 text-sm font-semibold">
        {(indicator === "SMA" || indicator === "All") && (
          <span className="text-blue-500">SMA (Blue)</span>
        )}
        {(indicator === "EMA" || indicator === "All") && (
          <span className="text-orange-500">EMA (Orange)</span>
        )}
        {(indicator === "RSI" || indicator === "All") && (
          <span className="text-purple-500">RSI (Purple)</span>
        )}
      </div>

      {/* Dropdown */}
      <div className="mb-2">
        <label
          className={`font-bold mr-2 text-sm ${
            darkMode ? "text-gray-200" : "text-gray-700"
          }`}
        >
          Indicator:
        </label>
        <select
          value={indicator}
          onChange={(e) => setIndicator(e.target.value)}
          className={`p-2 rounded border ${
            darkMode
              ? "bg-[#1e293b] text-gray-200 border-gray-600"
              : "bg-white text-black border-gray-400"
          }`}
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
