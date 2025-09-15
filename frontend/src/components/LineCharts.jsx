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

function LineCharts({ chartData }) {
  return (
    <div className="w-full max-w-full mx-auto bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg mb-6">
      <h2 className="text-lg font-bold mb-3 text-center">
        Closing Price Trend & Predictions
      </h2>
      <div className="h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
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
  );
}

export default LineCharts;
