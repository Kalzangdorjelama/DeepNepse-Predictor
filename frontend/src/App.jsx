import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import { Home, About, Features, StockPrediction } from "./index.js";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="https://deep-nepse-predictor.vercel.app/features"
          element={<Features />}
        />
        <Route
          path="https://deep-nepse-predictor.vercel.app/about"
          element={<About />}
        />
      </Route>
      <Route
        path="https://deep-nepse-predictor.vercel.app/stock/:symbol"
        element={<StockPrediction />}
      />
    </Routes>
  );
}
