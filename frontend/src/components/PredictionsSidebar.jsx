function PredictionsSidebar({ predictions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-center gap-4 sm:gap-6 w-full px-2 sm:px-0">
      <div className="flex-1 bg-gradient-to-br from-green-400 to-green-600 p-4 sm:p-6 rounded-2xl shadow-lg text-center">
        <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">LSTM</h3>
        <p className="text-2xl sm:text-3xl font-extrabold">
          Rs {predictions.lstm}
        </p>
      </div>
      <div className="flex-1 bg-gradient-to-br from-purple-500 to-indigo-600 p-4 sm:p-6 rounded-2xl shadow-lg text-center">
        <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">GRU</h3>
        <p className="text-2xl sm:text-3xl font-extrabold">
          Rs {predictions.gru}
        </p>
      </div>
      <div className="flex-1 bg-gradient-to-br from-blue-500 to-cyan-600 p-4 sm:p-6 rounded-2xl shadow-lg text-center">
        <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Average</h3>
        <p className="text-2xl sm:text-3xl font-extrabold">
          Rs {predictions.average}
        </p>
      </div>
    </div>
  );
}

export default PredictionsSidebar;
