import os
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import joblib
from typing import List, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import timedelta


# -----------------------------
# Config
# -----------------------------
MODELS_DIR = "trained_models"
DATA_DIR = "fetchStockData"
WINDOW = 30
FEATURES = ["Close", "SMA", "EMA", "RSI", "OBV"]
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# -----------------------------
# Models
# -----------------------------
class LSTMModel(nn.Module):
    def __init__(self, input_size=5, hidden_layer_size=100, output_size=1, num_layers=2):
        super().__init__()
        self.rnn = nn.LSTM(
            input_size,
            hidden_layer_size,
            num_layers=num_layers,
            batch_first=True
        )
        self.linear = nn.Linear(hidden_layer_size, output_size)

    def forward(self, x):
        out, _ = self.rnn(x)
        return self.linear(out[:, -1, :])


class GRUModel(nn.Module):
    def __init__(self, input_size=5, hidden_layer_size=100, output_size=1, num_layers=2):
        super().__init__()
        self.rnn = nn.GRU(
            input_size,
            hidden_layer_size,
            num_layers=num_layers,
            batch_first=True
        )
        self.linear = nn.Linear(hidden_layer_size, output_size)

    def forward(self, x):
        out, _ = self.rnn(x)
        return self.linear(out[:, -1, :])


# -----------------------------
# Stock Data
# -----------------------------
class Stock:
    def __init__(self, symbol: str):
        self.symbol = symbol.upper()

    def fetch_data(self) -> pd.DataFrame:
        path = os.path.join(DATA_DIR, f"{self.symbol}_ohlcv.csv")
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail=f"No CSV found for {self.symbol}")
        df = pd.read_csv(path)
        df.ffill(inplace=True)
        return df


# -----------------------------
# Feature Selector
# -----------------------------
class FeatureSelector:
    def __init__(self, model_type: str):
        self.model_type = model_type

    def select_features(self, df: pd.DataFrame) -> torch.Tensor:
        if not all(f in df.columns for f in FEATURES):
            raise HTTPException(status_code=400, detail=f"CSV must contain columns: {FEATURES}")
        data = df[FEATURES].dropna().values[-WINDOW:]
        if data.shape[0] < WINDOW:
            raise HTTPException(status_code=400, detail=f"Not enough data for {self.model_type}")
        return torch.from_numpy(data.reshape(1, WINDOW, len(FEATURES))).float().to(device)


# -----------------------------
# Predictor
# -----------------------------
class Predictor:
    def __init__(self, model_type: str):
        self.model_type = model_type

    def _infer_hidden_size(self, state_dict: Dict[str, torch.Tensor]) -> int:
        return state_dict["rnn.weight_hh_l0"].shape[1]

    def predict(self, symbol: str, seq_raw: torch.Tensor) -> float:
        model_path = os.path.join(MODELS_DIR, f"{symbol}_{self.model_type}_model_state_dict.pth")
        scaler_path = os.path.join(MODELS_DIR, f"{symbol}_{self.model_type}_scaler.pkl")
        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            raise FileNotFoundError(f"{self.model_type} artifacts missing")

        # load scaler
        scaler = joblib.load(scaler_path)

        # scale features
        seq_flat = seq_raw.cpu().numpy().reshape(-1, len(FEATURES))
        seq_scaled = scaler.transform(seq_flat)
        seq_scaled = torch.from_numpy(seq_scaled.reshape(1, WINDOW, len(FEATURES))).float().to(device)

        # load model
        checkpoint = torch.load(model_path, map_location=device)
        hidden_size = self._infer_hidden_size(checkpoint)
        model_cls = LSTMModel if self.model_type == "LSTM" else GRUModel
        model = model_cls(
            input_size=len(FEATURES),
            hidden_layer_size=hidden_size,
            num_layers=2
        ).to(device)
        model.load_state_dict(checkpoint)
        model.eval()

        with torch.no_grad():
            pred_scaled = model(seq_scaled).cpu().numpy()

        # inverse-transform Close only
        dummy = np.zeros((1, len(FEATURES)))
        dummy[0, 0] = pred_scaled
        pred_close = scaler.inverse_transform(dummy)[0, 0]
        return float(pred_close)


# -----------------------------
# Fetch history
# -----------------------------
def fetch_last_30_prices(stock: Stock) -> List[Dict[str, object]]:
    df = stock.fetch_data()
    if "Date" not in df.columns or "Close" not in df.columns:
        raise HTTPException(status_code=400, detail="CSV must have 'Date' and 'Close'")
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df = df.dropna(subset=["Date", "Close"]).sort_values("Date")
    last30 = df.tail(30)
    return [
        {"date": row["Date"].strftime("%Y-%m-%d"), "price": float(row["Close"])}
        for _, row in last30.iterrows()
    ]


# -----------------------------
# FastAPI App
# -----------------------------
app = FastAPI(title="NEPSE Stock Predictor API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/symbols")
def list_symbols() -> Dict[str, List[str]]:
    if not os.path.exists(MODELS_DIR):
        return {"symbols": []}
    symbols = set()
    for f in os.listdir(MODELS_DIR):
        if f.endswith("_LSTM_model_state_dict.pth") or f.endswith("_GRU_model_state_dict.pth"):
            symbols.add(f.split("_")[0])
    return {"symbols": sorted(symbols)}


class PredictRequest(BaseModel):
    symbol: str


@app.post("/predict")
def predict(req: PredictRequest):
    symbol = req.symbol.upper()
    stock = Stock(symbol)
    df = stock.fetch_data()
    if "Date" not in df.columns:
        raise HTTPException(status_code=400, detail="CSV must contain 'Date' column")

    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df = df.dropna(subset=["Date"]).sort_values("Date")

    # get last date + next day for prediction
    last_date = df["Date"].iloc[-1]
    next_date = (last_date + timedelta(days=1)).strftime("%Y-%m-%d")

    results: Dict[str, float] = {}
    for model_type in ["LSTM", "GRU"]:
        try:
            selector = FeatureSelector(model_type)
            seq_raw = selector.select_features(df)
            predictor = Predictor(model_type)
            results[model_type] = predictor.predict(symbol, seq_raw)
        except FileNotFoundError:
            pass

    if not results:
        raise HTTPException(status_code=404, detail=f"No trained models found for {symbol}")

    history = fetch_last_30_prices(stock)

    return {
        "symbol": symbol,
        "predicted_date": next_date,
        "predictions": results,
        "history": history
    }


@app.get("/ohlcv/{symbol}")
def get_ohlcv(symbol: str, all_data: bool = True):
    stock = Stock(symbol.upper())
    df = stock.fetch_data()

    required_cols = ["Date", "Open", "High", "Low", "Close"]
    for col in required_cols:
        if col not in df.columns:
            raise HTTPException(status_code=400, detail=f"CSV missing '{col}' column")

    # ensure datetime
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df = df.dropna(subset=required_cols)
    df = df.sort_values("Date")

    # if all_data=True, return all rows, otherwise last 50
    if not all_data:
        df = df.tail(50)

    return {
        "symbol": symbol.upper(),
        "ohlcv": [
            {
                "time": row["Date"].strftime("%Y-%m-%d"),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": float(row["Volume"]) if "Volume" in row else 0
            }
            for _, row in df.iterrows()
        ]
    }