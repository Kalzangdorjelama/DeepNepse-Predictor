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
          path="/features"
          element={<Features />}
        />
        <Route
          path="/about"
          element={<About />}
        />
      </Route>
      <Route
        path="/stock/:symbol"
        element={<StockPrediction />}
      />
    </Routes>
  );
}
