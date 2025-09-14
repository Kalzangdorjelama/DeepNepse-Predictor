const API_BASE = "http://localhost:8000";

// Fetch available stock symbols
export async function fetchSymbols() {
    const res = await fetch(`${API_BASE}/symbols`);
    if (!res.ok) throw new Error("Failed to fetch symbols");
    return res.json();
}

// Fetch predictions for a given symbol
export async function fetchPrediction(symbol) {
    const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
    });
    if (!res.ok) throw new Error("Failed to fetch prediction");
    return res.json();
}

export default API_BASE;
