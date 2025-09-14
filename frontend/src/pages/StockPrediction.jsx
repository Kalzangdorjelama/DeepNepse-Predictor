import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import loadingSpinner from "../loadingSpinner/LoadingSpinner.jsx";
import { fetchPrediction } from "../api";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

function StockPrediction() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState(null);
  const [status, setStatus] = useState(loadingSpinner());

  useEffect(() => {
    async function loadPrediction() {
      try {
        const data = await fetchPrediction(symbol);
        console.log("DATA: ", data);

        if (data?.predictions) {
          const lstm = Number(data.predictions.LSTM).toFixed(2);
          const gru = Number(data.predictions.GRU).toFixed(2);
          const average = ((+lstm + +gru) / 2).toFixed(2);

          // History = only actual prices
          const historyData = (data.history || []).map((h) => ({
            date: h.date,
            price: +h.price,
          }));

          // Merge history + prediction into one dataset
          const chartData = [
            ...historyData,
            {
              date: "Predicted",
              price: +average, // extend blue line to prediction
              lstm: +lstm,
              gru: +gru,
              average: +average,
            },
          ];

          setPredictions({ lstm, gru, average, chartData });
          setStatus("");
        } else {
          setStatus(`Error: ${data.detail || "Unknown error"}`);
        }
      } catch (e) {
        setStatus("Failed to connect to server");
      }
    }

    loadPrediction();
  }, [symbol]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-gray-900 text-white p-8">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="px-5 py-2 flex items-center gap-2 bg-black-800/70 backdrop-blur-md rounded-xl shadow hover:bg-blue-500 transition border-2 border-blue-200 cursor-pointer absolute top-5 hover:border-blue-500"
      >
        Back
      </button>

      {/* Header */}
      <div className="text-center mb-6">
        <p className="mt-5 text-gray-300 text-base my-4">
          <span className="my-4 text-2xl">
            Prediction of next day's closing price of
          </span>
          <span className="font-bold bg-green-700 px-3 py-1 mx-2 border-2 rounded-xl text-3xl">
            {symbol?.toUpperCase()}
          </span>
        </p>
        <span className="text-lg">{today}</span>
      </div>

      {status && (
        <div className="text-blue-400 text-center text-5xl">{status}</div>
      )}

      {predictions && (
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Chart Area */}
          <div className="md:col-span-2 bg-white/10 backdrop-blur-lg p-4 rounded-xl shadow-lg">
            <h2 className="text-lg font-bold mb-3">
              Price Trend & Predictions
            </h2>
            <div className="h-90">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={predictions.chartData}>
                  {/* Background grid */}
                  <CartesianGrid strokeDasharray="4 4" stroke="#444" />

                  {/* X and Y axis */}
                  <XAxis
                    dataKey="date"
                    stroke="#ccc"
                    tick={{ fontSize: 12 }}
                    allowDuplicatedCategory={false}
                  />
                  <YAxis stroke="#ccc" tick={{ fontSize: 12 }} />

                  {/* Tooltip */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderRadius: "8px",
                      border: "1px solid #374151",
                      color: "#fff",
                    }}
                    formatter={(value, name) => [`Rs. ${value}`, name]}
                  />

                  {/* Legend */}
                  <Legend />

                  {/* Actual price line (continues to predicted) */}
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 3, stroke: "#1d4ed8", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    name="Actual Price"
                  />

                  {/* LSTM prediction */}
                  <Line
                    type="monotone"
                    dataKey="lstm"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 6, fill: "#10b981" }}
                    name="LSTM Prediction"
                  />

                  {/* GRU prediction */}
                  <Line
                    type="monotone"
                    dataKey="gru"
                    stroke="#a855f7"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 6, fill: "#a855f7" }}
                    name="GRU Prediction"
                  />

                  {/* Average prediction */}
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 7, fill: "#06b6d4" }}
                    name="Average Prediction"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Predictions Sidebar */}
          <div className="flex flex-col gap-6">
            {/* LSTM */}
            <div className="bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-2xl shadow-lg text-center">
              <h3 className="text-xl font-bold mb-2">LSTM</h3>
              <p className="text-3xl font-extrabold">Rs {predictions.lstm}</p>
            </div>

            {/* GRU */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-center">
              <h3 className="text-xl font-bold mb-2">GRU</h3>
              <p className="text-3xl font-extrabold">Rs {predictions.gru}</p>
            </div>

            {/* Average */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-2xl shadow-lg text-center">
              <h3 className="text-xl font-bold mb-2">Average</h3>
              <p className="text-3xl font-extrabold">
                Rs {predictions.average}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockPrediction;


// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import loadingSpinner from "../loadingSpinner/LoadingSpinner.jsx";
// import { fetchPrediction } from "../api";
// import {
//   LineChart,
//   Line,
//   ResponsiveContainer,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   Legend,
// } from "recharts";

// function StockPrediction() {
//   const { symbol } = useParams();
//   const navigate = useNavigate();
//   const [predictions, setPredictions] = useState(null);
//   const [status, setStatus] = useState(loadingSpinner());

//   useEffect(() => {
//     async function loadPrediction() {
//       try {
//         const data = await fetchPrediction(symbol);
//         console.log("DATA: ", data);

//         if (data?.predictions) {
//           const lstm = Number(data.predictions.LSTM).toFixed(2);
//           const gru = Number(data.predictions.GRU).toFixed(2);
//           const average = ((+lstm + +gru) / 2).toFixed(2);

//           // History = only actual prices
//           const historyData = (data.history || []).map((h) => ({
//             date: h.date,
//             price: +h.price,
//           }));

//           // Merge history + prediction into one dataset
//           const chartData = [
//             ...historyData,
//             {
//               date: "Predicted",
//               price: null, // don't extend actual price to prediction
//               lstm: +lstm,
//               gru: +gru,
//               average: +average,
//             },
//           ];

//           setPredictions({ lstm, gru, average, chartData });
//           setStatus("");
//         } else {
//           setStatus(`Error: ${data.detail || "Unknown error"}`);
//         }
//       } catch (e) {
//         setStatus("Failed to connect to server");
//       }
//     }

//     loadPrediction();
//   }, [symbol]);

//   const today = new Date().toLocaleDateString("en-US", {
//     weekday: "long",
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });

//   return (
//     <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-gray-900 text-white p-8">
//       {/* Back button */}
//       <button
//         onClick={() => navigate("/")}
//         className="px-5 py-2 flex items-center gap-2 bg-black-800/70 backdrop-blur-md rounded-xl shadow hover:bg-blue-500 transition border-2 border-blue-200 cursor-pointer absolute top-5 hover:border-blue-500"
//       >
//         Back
//       </button>

//       {/* Header */}
//       <div className="text-center mb-6">
//         <p className="mt-5 text-gray-300 text-base my-4">
//           <span className="my-4 text-2xl">
//             Prediction of next day's closing price of
//           </span>
//           <span className="font-bold bg-green-700 px-3 py-1 mx-2 border-2 rounded-xl text-3xl">
//             {symbol?.toUpperCase()}
//           </span>
//         </p>
//         <span className="text-lg">{today}</span>
//       </div>

//       {status && (
//         <div className="text-blue-400 text-center text-5xl">{status}</div>
//       )}

//       {predictions && (
//         <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
//           {/* Chart Area */}
//           <div className="md:col-span-2 bg-white/10 backdrop-blur-lg p-4 rounded-xl shadow-lg">
//             <h2 className="text-lg font-bold mb-3">
//               Price Trend & Predictions
//             </h2>
//             <div className="h-90">
//               <ResponsiveContainer width="100%" height={400}>
//                 <LineChart data={predictions.chartData}>
//                   {/* Background grid */}
//                   <CartesianGrid strokeDasharray="4 4" stroke="#444" />

//                   {/* X and Y axis */}
//                   <XAxis
//                     dataKey="date"
//                     stroke="#ccc"
//                     tick={{ fontSize: 12 }}
//                     allowDuplicatedCategory={false}
//                   />
//                   <YAxis stroke="#ccc" tick={{ fontSize: 12 }} />

//                   {/* Tooltip */}
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: "#111827",
//                       borderRadius: "8px",
//                       border: "1px solid #374151",
//                       color: "#fff",
//                     }}
//                     formatter={(value, name) => [`Rs. ${value}`, name]}
//                   />

//                   {/* Legend */}
//                   <Legend />

//                   {/* Actual price line (history only) */}
//                   <Line
//                     type="monotone"
//                     dataKey="price"
//                     stroke="#3b82f6"
//                     strokeWidth={3}
//                     dot={{ r: 3, stroke: "#1d4ed8", strokeWidth: 2 }}
//                     activeDot={{ r: 6 }}
//                     connectNulls={false} // stop at last actual price
//                     name="Actual Price"
//                   />

//                   {/* LSTM prediction */}
//                   <Line
//                     type="monotone"
//                     dataKey="lstm"
//                     stroke="#10b981"
//                     strokeWidth={2}
//                     strokeDasharray="5 5"
//                     dot={{ r: 6, fill: "#10b981" }}
//                     name="LSTM Prediction"
//                   />

//                   {/* GRU prediction */}
//                   <Line
//                     type="monotone"
//                     dataKey="gru"
//                     stroke="#a855f7"
//                     strokeWidth={2}
//                     strokeDasharray="5 5"
//                     dot={{ r: 6, fill: "#a855f7" }}
//                     name="GRU Prediction"
//                   />

//                   {/* Average prediction */}
//                   <Line
//                     type="monotone"
//                     dataKey="average"
//                     stroke="#06b6d4"
//                     strokeWidth={3}
//                     strokeDasharray="4 4"
//                     dot={{ r: 7, fill: "#06b6d4" }}
//                     name="Average Prediction"
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           {/* Predictions Sidebar */}
//           <div className="flex flex-col gap-6">
//             {/* LSTM */}
//             <div className="bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-2xl shadow-lg text-center">
//               <h3 className="text-xl font-bold mb-2">LSTM</h3>
//               <p className="text-3xl font-extrabold">Rs {predictions.lstm}</p>
//             </div>

//             {/* GRU */}
//             <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-center">
//               <h3 className="text-xl font-bold mb-2">GRU</h3>
//               <p className="text-3xl font-extrabold">Rs {predictions.gru}</p>
//             </div>

//             {/* Average */}
//             <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-2xl shadow-lg text-center">
//               <h3 className="text-xl font-bold mb-2">Average</h3>
//               <p className="text-3xl font-extrabold">
//                 Rs {predictions.average}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default StockPrediction;

