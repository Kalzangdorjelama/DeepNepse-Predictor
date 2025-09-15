import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#10b981", "#a855f7", "#06b6d4"];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value, payload: data } = payload[0];
    const color = payload[0].payload.fill || payload[0].color; // use slice color

    return (
      <div
        style={{
          backgroundColor: color,
          padding: "8px 12px",
          borderRadius: "8px",
          color: "#fff",
          fontWeight: "bold",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}
      >
        <p>
          {name}: Rs. {value}
        </p>
      </div>
    );
  }
  return null;
};

function PieCharts({ predictions }) {
  const pieData = [
    { name: "LSTM", value: +predictions.lstm, fill: COLORS[0] },
    { name: "GRU", value: +predictions.gru, fill: COLORS[1] },
    { name: "Average", value: +predictions.average, fill: COLORS[2] },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg w-full max-w-xl">
      <h2 className="text-xl font-bold mb-6 text-center">
        Prediction Comparison
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={90}
            outerRadius={150}
            paddingAngle={4}
            isAnimationActive={true}
            animationDuration={1200}
            label={({ value }) => `Rs ${value}`}
            labelLine={false}
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                stroke="#1f2937"
                strokeWidth={3}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ color: "#ddd", fontSize: "14px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PieCharts;
