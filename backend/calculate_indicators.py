import os
import pandas as pd
import numpy as np

# -------------------------------
# Correct folder paths
# -------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "fetchStockData")   # correct path
OUTPUT_DIR = DATA_DIR  # same folder for saving

# Function to calculate indicators
def calculate_indicators(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # Ensure numeric types
    for col in ["Open", "High", "Low", "Close", "Volume"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # --- Simple Moving Average (SMA)
    df["SMA"] = df["Close"].rolling(window=14).mean()

    # --- Exponential Moving Average (EMA)
    df["EMA"] = df["Close"].ewm(span=14, adjust=False).mean()

    # --- Relative Strength Index (RSI)
    delta = df["Close"].diff()
    gain = np.where(delta > 0, delta, 0)
    loss = np.where(delta < 0, -delta, 0)
    avg_gain = pd.Series(gain).rolling(window=14).mean()
    avg_loss = pd.Series(loss).rolling(window=14).mean()
    rs = avg_gain / (avg_loss + 1e-9)
    df["RSI"] = 100 - (100 / (1 + rs))

    # --- On-Balance Volume (OBV)
    obv = [0]
    for i in range(1, len(df)):
        if df["Close"].iloc[i] > df["Close"].iloc[i - 1]:
            obv.append(obv[-1] + df["Volume"].iloc[i])
        elif df["Close"].iloc[i] < df["Close"].iloc[i - 1]:
            obv.append(obv[-1] - df["Volume"].iloc[i])
        else:
            obv.append(obv[-1])
    df["OBV"] = obv

    # Clean missing values
    df = df.dropna().reset_index(drop=True)
    return df


# Main processing
def process_all_stocks():
    for file in os.listdir(DATA_DIR):
        if file.endswith(".csv"):
            path = os.path.join(DATA_DIR, file)
            print(f"Processing {file} ...")
            df = pd.read_csv(path)
            if not all(col in df.columns for col in ["Open", "High", "Low", "Close", "Volume"]):
                print(f"Skipping {file} — Missing OHLCV columns.")
                continue

            df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
            df = df.dropna(subset=["Date"])
            df = df.sort_values("Date")

            df = calculate_indicators(df)
            df.to_csv(path, index=False)
            print(f"Saved updated file: {file}")


if __name__ == "__main__":
    process_all_stocks()
