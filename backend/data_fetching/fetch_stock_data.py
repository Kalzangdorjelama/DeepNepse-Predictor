import requests
from bs4 import BeautifulSoup
from datetime import datetime
import pandas as pd
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# ------------------------------
# Configurations
# ------------------------------
STOCK_DATA_DIR = "../fetchStockData"  # Directory to store individual CSVs
COMBINED_CSV_FILE = "all_commercial_bank_ohlcv.csv"  # Combined file
MAX_WORKERS = 5  # Number of parallel threads

symbols = [
    "ADBL", "CZBIL", "EBL", "GBIME", "HBL", "KBL", "MBL", "NABIL",
    "NBL", "NICA", "NIMB", "NMB", "PCBL", "PRVU", "SANIMA", "SBL", "SCB"
]

# Create directory if it doesn't exist
os.makedirs(STOCK_DATA_DIR, exist_ok=True)


# ------------------------------
# Function to Fetch OHLCV Data
# ------------------------------
def get_all_historical_ohlcv(symbol, retries=3):
    """
    Fetch all available historical OHLCV data for a given stock symbol.
    Returns list of dicts.
    """
    url = f'https://www.financialnotices.com/stock-nepse.php?symbol={symbol}'
    headers = {'User-Agent': 'Mozilla/5.0'}

    for attempt in range(retries):
        try:
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code != 200:
                raise ValueError(f"HTTP {resp.status_code}")
            soup = BeautifulSoup(resp.text, 'html.parser')
            rows = soup.find_all('tr')
            history = []

            for row in rows:
                cols = [c.text.strip() for c in row.find_all('td')]
                if len(cols) >= 6:
                    date_str, close_price, open_price, high_price, low_price, volume = cols[:6]
                    try:
                        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
                        history.append({
                            'Date': date_obj,
                            'Open': float(open_price.replace(',', '')),
                            'High': float(high_price.replace(',', '')),
                            'Low': float(low_price.replace(',', '')),
                            'Close': float(close_price.replace(',', '')),
                            'Volume': float(volume.replace(',', ''))
                        })
                    except ValueError:
                        continue  # Skip invalid rows
            return history[::-1]  # Oldest to newest

        except Exception as e:
            print(f"Attempt {attempt + 1} failed for {symbol}: {e}")
            time.sleep(1)

    print(f"❌ Failed to fetch {symbol} after {retries} retries.")
    return []


# ------------------------------
# Fetch and Save Data (Multi-threaded)
# ------------------------------
def fetch_and_save_data():
    combined_df = pd.DataFrame()
    futures = {}

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        for symbol in symbols:
            csv_path = os.path.join(STOCK_DATA_DIR, f"{symbol}_ohlcv.csv")

            # ✅ Skip if data already exists (cache)
            if os.path.exists(csv_path):
                print(f"Using cached data for {symbol}")
                df_cached = pd.read_csv(csv_path, parse_dates=["Date"], index_col="Date")
                df_symbol = rename_columns(df_cached, symbol)
                combined_df = combine_dataframes(combined_df, df_symbol)
                continue

            # Otherwise, fetch in parallel
            futures[executor.submit(get_all_historical_ohlcv, symbol)] = symbol

        # Collect results
        for future in as_completed(futures):
            symbol = futures[future]
            try:
                data = future.result()
            except Exception as e:
                print(f"Error for {symbol}: {e}")
                continue

            if data:
                df = pd.DataFrame(data)
                df.set_index('Date', inplace=True)
                csv_path = os.path.join(STOCK_DATA_DIR, f"{symbol}_ohlcv.csv")
                df.to_csv(csv_path)
                print(f"✅ Saved: {csv_path}")

                df_symbol = rename_columns(df, symbol)
                combined_df = combine_dataframes(combined_df, df_symbol)

    save_combined_data(combined_df)


# ------------------------------
# Helper: Rename columns for combined CSV
# ------------------------------
def rename_columns(df, symbol):
    return df.rename(columns={
        'Open': f"{symbol}_Open",
        'High': f"{symbol}_High",
        'Low': f"{symbol}_Low",
        'Close': f"{symbol}_Close",
        'Volume': f"{symbol}_Volume"
    })


# ------------------------------
# Helper: Combine dataframes
# ------------------------------
def combine_dataframes(combined_df, new_df):
    if combined_df.empty:
        return new_df
    return combined_df.join(new_df, how='outer')


# ------------------------------
# Save Combined Data
# ------------------------------
def save_combined_data(combined_df):
    if combined_df.empty:
        print("⚠️ No data to save.")
        return

    combined_df.sort_index(inplace=True)
    combined_df.to_csv(COMBINED_CSV_FILE)
    print(f"💾 Saved combined file: {COMBINED_CSV_FILE}")


# ------------------------------
# Execute When Run as Script
# ------------------------------
if __name__ == "__main__":
    print("🚀 Fetching all commercial bank data in parallel...\n")
    start = time.time()
    fetch_and_save_data()
    end = time.time()
    print(f"\n✅ Completed in {end - start:.2f} seconds")
