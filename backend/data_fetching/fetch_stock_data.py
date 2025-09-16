import requests
from bs4 import BeautifulSoup
from datetime import datetime
import pandas as pd
import os

def get_all_historical_ohlcv(symbol):
    """
    Fetch all available historical OHLCV data for a given stock symbol.
    """
    url = f'https://www.financialnotices.com/stock-nepse.php?symbol={symbol}'
    headers = {'User-Agent': 'Mozilla/5.0'}
    resp = requests.get(url, headers=headers)
    soup = BeautifulSoup(resp.text, 'html.parser')

    history = []
    rows = soup.find_all('tr')
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
                continue
    return history[::-1]  # oldest to newest

# List of 18 commercial bank symbols
symbols = [
    "ADBL","CZBIL","EBL","GBIME","HBL","KBL","MBL",
    "NABIL","NBL","NICA","NIMB","NMB","PCBL","PRVU",
    "SANIMA","SBL","SCB"
]

# Folder to store individual CSVs
os.makedirs("../fetchStockData", exist_ok=True)

# Initialize empty DataFrame for combined data
combined_df = pd.DataFrame()

# Fetch data for all symbols
for symbol in symbols:
    print(f"Fetching data for {symbol}...")
    data = get_all_historical_ohlcv(symbol)
    if data:
        df = pd.DataFrame(data)
        df.set_index('Date', inplace=True)

        # Save individual CSV
        df.to_csv(f"../fetchStockData/{symbol}_ohlcv.csv")
        print(f"Saved: ../fetchStockData/{symbol}_ohlcv.csv")

        # Prepare for combined CSV
        df_symbol = df.rename(columns={
            'Open': f"{symbol}_Open",
            'High': f"{symbol}_High",
            'Low': f"{symbol}_Low",
            'Close': f"{symbol}_Close",
            'Volume': f"{symbol}_Volume"
        })
        combined_df = combined_df.join(df_symbol, how='outer') if not combined_df.empty else df_symbol

# Clean combined DataFrame
combined_df.dropna(inplace=True)
combined_df.sort_index(inplace=True)

# Save combined CSV
combined_df.to_csv("all_commercial_bank_ohlcv.csv")
print("Saved: all_commercial_bank_ohlcv.csv")
