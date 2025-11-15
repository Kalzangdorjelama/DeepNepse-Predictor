import requests
from bs4 import BeautifulSoup
from datetime import datetime
import pandas as pd
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# -------------------------------------------------------
# CONFIGURATIONS (Folder paths, combined file, threads)
# -------------------------------------------------------

# Folder where each stock's CSV will be saved
STOCK_DATA_DIR = "../fetchStockData"

# Name of the final merged CSV file
COMBINED_CSV_FILE = "all_commercial_bank_ohlcv.csv"

# Number of threads -> how many stocks to fetch at the same time
MAX_WORKERS = 5

# List of stock symbols to collect OHLCV data from
symbols = [
    "ADBL",   # Agricultural Development Bank Limited
    "CZBIL",  # Citizens Bank International Limited
    "EBL",    # Everest Bank Limited
    "GBIME",  # Global IME Bank Limited
    "HBL",    # Himalayan Bank Limited
    "KBL",    # Kumari Bank Limited
    "MBL",    # Machhapuchchhre Bank Limited
    "NABIL",  # Nabil Bank Limited
    "NBL",    # Nepal Bank Limited
    "NICA",   # NIC Asia Bank Limited
    "NIMB",   # NMB Bank Limited
    "NMB",    # NMB Bank Limited
    "PCBL",   # Prime Commercial Bank Limited
    "PRVU",   # Prabhu Bank Limited
    "SANIMA", # Sanima Bank Limited
    "SBL",    # Standard Bank Limited
    "SCB"     # Standard Chartered Bank Nepal Limited
]

# Create the folder if it doesn’t exist
os.makedirs(STOCK_DATA_DIR, exist_ok=True)


# -------------------------------------------------------
# FUNCTION: Fetch historical OHLCV for ONE symbol
# -------------------------------------------------------
def get_all_historical_ohlcv(symbol, retries=3):
    """
    Fetches *all* available historical OHLCV data for a given symbol.
    Returns a list of dictionaries (later converted to DataFrame).
    """

    # Website that shows stock history
    url = f'https://www.financialnotices.com/stock-nepse.php?symbol={symbol}'
    headers = {'User-Agent': 'Mozilla/5.0'}  # Prevents blocking

    for attempt in range(retries):
        try:
            # Send request to website
            resp = requests.get(url, headers=headers, timeout=10)

            # If response is not OK → retry
            if resp.status_code != 200:
                raise ValueError(f"HTTP {resp.status_code}")

            # Parse HTML
            soup = BeautifulSoup(resp.text, 'html.parser')
            rows = soup.find_all('tr')

            history = []

            # Read each table row
            for row in rows:
                cols = [c.text.strip() for c in row.find_all('td')]

                # Make sure row contains data (6 columns: date, close, open, high, low, volume)
                if len(cols) >= 6:
                    date_str, close_price, open_price, high_price, low_price, volume = cols[:6]

                    try:
                        # Convert date and string numbers to proper types
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

            # Reverse list so oldest date comes first
            return history[::-1]

        except Exception as e:
            print(f"Attempt {attempt + 1} failed for {symbol}: {e}")
            time.sleep(1)

    print(f"Failed to fetch {symbol} after {retries} retries.")
    return []


# -------------------------------------------------------
# MAIN FUNCTION: Fetch data for all symbols in parallel
# -------------------------------------------------------
def fetch_and_save_data():
    combined_df = pd.DataFrame()
    futures = {}

    # Use multi-threading to parallelize fetching
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:

        for symbol in symbols:
            csv_path = os.path.join(STOCK_DATA_DIR, f"{symbol}_ohlcv.csv")

            # If CSV already exists → use it (skip refetching)
            if os.path.exists(csv_path):
                print(f"Using cached data for {symbol}")
                df_cached = pd.read_csv(csv_path, parse_dates=["Date"], index_col="Date")
                df_symbol = rename_columns(df_cached, symbol)
                combined_df = combine_dataframes(combined_df, df_symbol)
                continue

            # Otherwise → fetch new data in a separate thread
            futures[executor.submit(get_all_historical_ohlcv, symbol)] = symbol

        # Collect results as soon as each thread finishes
        for future in as_completed(futures):
            symbol = futures[future]

            try:
                data = future.result()
            except Exception as e:
                print(f"Error for {symbol}: {e}")
                continue

            # If fetched successfully → save CSV
            if data:
                df = pd.DataFrame(data)
                df.set_index('Date', inplace=True)
                csv_path = os.path.join(STOCK_DATA_DIR, f"{symbol}_ohlcv.csv")
                df.to_csv(csv_path)
                print(f"Saved: {csv_path}")

                df_symbol = rename_columns(df, symbol)
                combined_df = combine_dataframes(combined_df, df_symbol)

    save_combined_data(combined_df)


# -------------------------------------------------------
# Rename columns for combined CSV
# Example: "Open" → "ADBL_Open"
# -------------------------------------------------------
def rename_columns(df, symbol):
    return df.rename(columns={
        'Open': f"{symbol}_Open",
        'High': f"{symbol}_High",
        'Low': f"{symbol}_Low",
        'Close': f"{symbol}_Close",
        'Volume': f"{symbol}_Volume"
    })


# -------------------------------------------------------
# Combine two DataFrames by joining on Date index
# -------------------------------------------------------
def combine_dataframes(combined_df, new_df):
    if combined_df.empty:
        return new_df
    return combined_df.join(new_df, how='outer')


# -------------------------------------------------------
# Save the final combined CSV file
# -------------------------------------------------------
def save_combined_data(combined_df):
    if combined_df.empty:
        print("No data to save.")
        return

    combined_df.sort_index(inplace=True)
    combined_df.to_csv(COMBINED_CSV_FILE)
    print(f"💾 Saved combined file: {COMBINED_CSV_FILE}")


# -------------------------------------------------------
# Program Entry Point
# -------------------------------------------------------
if __name__ == "__main__":
    print("Fetching all commercial bank data in parallel...\n")
    start = time.time()

    fetch_and_save_data()

    end = time.time()
    print(f"\nCompleted in {end - start:.2f} seconds")
