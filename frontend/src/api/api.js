// const VITE_API_URL = "https://deepnepse-predictor-3.onrender.com";
const VITE_API_URL = "http://localhost:8000";


// Fetch available stock symbols
export async function fetchSymbols() {
    const res = await fetch(`${VITE_API_URL}/symbols`);
    if (!res.ok) throw new Error("Failed to fetch symbols");
    return res.json();
}

// Fetch predictions for a given symbol
export async function fetchPrediction(symbol) {
    const res = await fetch(`${VITE_API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
    });
    if (!res.ok) throw new Error("Failed to fetch prediction");
    return res.json();
}

export default VITE_API_URL;
