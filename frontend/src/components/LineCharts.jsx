import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useParams } from "react-router-dom";

function LineCharts({ chartData }) {
  const { symbol } = useParams();
  const lastPoint = chartData[chartData.length - 1];

  // Custom Tooltip to handle prediction case
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const isPredicted = label === "Predicted Price";

    return (
      <div className="bg-gray-900 text-white p-3 rounded-lg border border-gray-600 shadow-lg">
        <p className="font-bold mb-2">{label}</p>
        {payload.map((p) => {
          // Skip Actual Price for predicted point
          if (isPredicted && p.name === "Actual Price") return null;

          return (
            <p
              key={`tooltip-${p.name}`} // stable unique key
              style={{ color: p.color }}
              className="text-sm my-2"
            >
              {p.name}: <span className="font-bold text-lg">Rs {p.value}</span>
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-full mx-auto bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg -mb-1">
      <h2 className="text-lg font-bold mb-3 text-center">
        Closing Price Trend & Predictions of
        <span className="ml-2 text-2xl text-orange-400">
          {symbol?.toUpperCase()}
        </span>
      </h2>

      <div className="h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
          >
            {/* Grid */}
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

            {/* Axes */}
            <XAxis
              dataKey="date"
              stroke="#e5e7eb"
              tick={{ fontSize: 12, fill: "#d1d5db" }}
              angle={-30}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke="#e5e7eb"
              tick={{ fontSize: 12, fill: "#d1d5db" }}
              domain={["auto", "auto"]}
              label={{
                value: "Price (Rs)",
                angle: -90,
                position: "insideLeft",
                fill: "#d1d5db",
              }}
            />

            {/* Tooltip */}
            <Tooltip content={<CustomTooltip />} />

            {/* Legend */}
            <Legend wrapperStyle={{ color: "#d1d5db" }} />

            {/* Actual Prices */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="url(#priceGradient)"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#3b82f6" }}
              name="Actual Price"
            />

            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>

            {/* Prediction lines */}
            <Line
              type="monotone"
              dataKey="lstm"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="LSTM Prediction"
            />
            <Line
              type="monotone"
              dataKey="gru"
              stroke="#a855f7"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="GRU Prediction"
            />
            <Line
              type="monotone"
              dataKey="average"
              stroke="#06b6d4"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={(props) => {
                // Only highlight last point
                if (props.payload.date === lastPoint.date) {
                  return (
                    <circle
                      key={`dot-${props.payload.date}`} // unique key
                      cx={props.cx}
                      cy={props.cy}
                      r={6}
                      fill="#06b6d4"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  );
                }
                return null;
              }}
              name="Average Prediction"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Label for predicted price */}
      {lastPoint && (
        <p className="text-center mt-2 text-cyan-300 font-semibold">
          Predicted Closing Price: Rs. {lastPoint.average}
        </p>
      )}
    </div>
  );
}

export default LineCharts;
