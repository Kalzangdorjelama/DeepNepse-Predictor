import os
import pandas as pd
import numpy as np

# -----------------------------------------------------------
# 1. SETUP FOLDER PATHS
# -----------------------------------------------------------

# BASE_DIR = folder where this Python file is located:
#   backend/data_fetching/
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# DATA_DIR = folder where the CSV files are stored:
# We go one level UP to "backend/", then enter "fetchStockData"
DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), "fetchStockData")

# OUTPUT_DIR = same folder where we save updated CSV files
OUTPUT_DIR = DATA_DIR


# -----------------------------------------------------------
# 2. INDICATOR CALCULATIONS (SMA, EMA, RSI, OBV)
# -----------------------------------------------------------
def calculate_indicators(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()  # Work on a copy to avoid modifying original

    # Convert all OHLCV values into numeric types
    for col in ["Open", "High", "Low", "Close", "Volume"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # -----------------------------
    # Simple Moving Average (SMA)
    # -----------------------------
    # SMA = average of the last 14 closing prices
    df["SMA"] = df["Close"].rolling(window=14).mean()

    # -----------------------------
    # Exponential Moving Average (EMA)
    # -----------------------------
    df["EMA"] = df["Close"].ewm(span=14, adjust=False).mean()

    # -----------------------------
    # Relative Strength Index (RSI)
    # -----------------------------
    delta = df["Close"].diff()

    # Gains = positive changes
    gain = np.where(delta > 0, delta, 0)

    # Losses = negative changes
    loss = np.where(delta < 0, -delta, 0)

    # Average gain and loss over 14 days
    avg_gain = pd.Series(gain).rolling(window=14).mean()
    avg_loss = pd.Series(loss).rolling(window=14).mean()

    # RS = avg gain / avg loss
    rs = avg_gain / (avg_loss + 1e-9)

    # Formula for RSI
    df["RSI"] = 100 - (100 / (1 + rs))

    # -----------------------------
    # On-Balance Volume (OBV)
    # -----------------------------
    obv = [0]  # Start at 0

    for i in range(1, len(df)):
        if df["Close"].iloc[i] > df["Close"].iloc[i - 1]:
            # Price went UP → Add today's volume
            obv.append(obv[-1] + df["Volume"].iloc[i])
        elif df["Close"].iloc[i] < df["Close"].iloc[i - 1]:
            # Price went DOWN → Subtract today's volume
            obv.append(obv[-1] - df["Volume"].iloc[i])
        else:
            # Price unchanged → OBV stays same
            obv.append(obv[-1])

    df["OBV"] = obv

    # Remove rows with missing values (SMA, EMA, etc. need 14 rows)
    df = df.dropna().reset_index(drop=True)

    return df


# -----------------------------------------------------------
# 3. PROCESS ALL CSV STOCK FILES IN THE FOLDER
# -----------------------------------------------------------
def process_all_stocks():

    # Loop through everything inside fetchStockData/
    for file in os.listdir(DATA_DIR):

        # Only handle .csv files
        if file.endswith(".csv"):
            path = os.path.join(DATA_DIR, file)
            print(f"Processing {file} ...")

            # Read CSV file
            df = pd.read_csv(path)

            # Ensure OHLCV columns exist
            if not all(col in df.columns for col in ["Open", "High", "Low", "Close", "Volume"]):
                print(f"Skipping {file} — Missing OHLCV columns.")
                continue

            # Convert the Date column to datetime
            df["Date"] = pd.to_datetime(df["Date"], errors="coerce")

            # Remove rows with invalid dates
            df = df.dropna(subset=["Date"])

            # Sort rows by date
            df = df.sort_values("Date")

            # Apply technical indicator calculations
            df = calculate_indicators(df)

            # Save back to the SAME file
            df.to_csv(path, index=False)

            print(f"Saved updated file: {file}")


# -----------------------------------------------------------
# 4. SCRIPT ENTRY POINT
# -----------------------------------------------------------
if __name__ == "__main__":
    process_all_stocks()
