"""
LSTM PM2.5 Inference - พยากรณ์ PM2.5 ล่วงหน้า 7 วัน (Multi-Output)

Input:
  DataFrame หรือ list of dict อย่างน้อย WINDOW_SIZE แถว มีคอลัมน์:
    date, station, dew_point, temperature, precipitation,
    wind_speed, surface_pressure, relative_humidity, wind_direction, pm
  (ถ้าส่งมากกว่า WINDOW_SIZE จะใช้แค่ N วันล่าสุด)

Output:
  ค่า PM2.5 พยากรณ์ 1-7 วันข้างหน้า
"""

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import joblib
import json
import os

# === Load Model & Config ===
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(SCRIPT_DIR, 'model_config.json'), 'r') as f:
    config = json.load(f)

WINDOW_SIZE = config['window_size']
FORECAST_DAYS = config['forecast_days']
FEATURE_COLS = config['feature_cols']
PM25_ROBUST_IDX = config['pm25_robust_idx']
ROBUST_COLS = config['robust_cols']
STANDARD_COLS = config['standard_cols']

robust_scaler = joblib.load(os.path.join(SCRIPT_DIR, 'robust_scaler.joblib'))
standard_scaler = joblib.load(os.path.join(SCRIPT_DIR, 'standard_scaler.joblib'))


# === LSTM Model (same architecture as training) ===
class LSTMModel(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, dropout, forecast_days):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0,
        )
        self.fc = nn.Linear(hidden_size, forecast_days)

    def forward(self, x):
        _, (h_n, _) = self.lstm(x)
        return self.fc(h_n[-1])


device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = LSTMModel(
    config['input_size'], config['hidden_size'],
    config['num_layers'], config['dropout'], FORECAST_DAYS
).to(device)
model.load_state_dict(torch.load(os.path.join(SCRIPT_DIR, 'lstm_model.pth'), map_location=device))
model.eval()


def _prepare_features(input_df: pd.DataFrame) -> np.ndarray:
    """แปลงข้อมูลดิบเป็น scaled feature array ที่โมเดลต้องการ"""
    wind_dir = input_df['wind_direction'].values
    dates = pd.to_datetime(input_df['date'])
    months = dates.dt.month.values

    features = pd.DataFrame({
        'dew_point_2m_mean': input_df['dew_point'].values,
        'temperature_2m_mean': input_df['temperature'].values,
        'precipitation_sum': input_df['precipitation'].values,
        'wind_speed_10m_mean': input_df['wind_speed'].values,
        'surface_pressure_mean': input_df['surface_pressure'].values,
        'relative_humidity_2m_mean': input_df['relative_humidity'].values,
        'pm25': input_df['pm'].values,
        'wind_dir_sin': np.sin(2 * np.pi * wind_dir / 360),
        'wind_dir_cos': np.cos(2 * np.pi * wind_dir / 360),
        'month_sin': np.sin(2 * np.pi * months / 12),
        'month_cos': np.cos(2 * np.pi * months / 12),
    })

    # Normalize ตาม scaler group
    features[ROBUST_COLS] = robust_scaler.transform(features[ROBUST_COLS])
    features[STANDARD_COLS] = standard_scaler.transform(features[STANDARD_COLS])
    # passthrough_cols (sin/cos) ไม่ transform

    # เรียงคอลัมน์ให้ตรงกับตอนเทรน
    return features[FEATURE_COLS].values


def forecast(input_data, forecast_days: int = None) -> pd.DataFrame:
    """
    พยากรณ์ PM2.5 ล่วงหน้า (Multi-Output)

    Parameters:
        input_data: DataFrame หรือ list of dict อย่างน้อย WINDOW_SIZE แถว
                    คอลัมน์: date, station, dew_point, temperature, precipitation,
                            wind_speed, surface_pressure, relative_humidity,
                            wind_direction, pm
                    (ถ้าส่งมากกว่า WINDOW_SIZE จะใช้แค่ N วันล่าสุด)
        forecast_days: จำนวนวันที่ต้องการ (default: 7, max: 7)

    Returns:
        DataFrame: day, date, station, pm25_forecast
    """
    if forecast_days is None:
        forecast_days = FORECAST_DAYS

    if not isinstance(input_data, pd.DataFrame):
        input_data = pd.DataFrame(input_data)

    if len(input_data) < WINDOW_SIZE:
        raise ValueError(f"ต้องการข้อมูลอย่างน้อย {WINDOW_SIZE} วัน แต่ได้ {len(input_data)} วัน")

    # เรียงตามวันที่ แล้วใช้แค่ WINDOW_SIZE วันล่าสุด
    input_data = input_data.sort_values('date').reset_index(drop=True)
    input_data = input_data.tail(WINDOW_SIZE).reset_index(drop=True)

    station = input_data['station'].iloc[0]
    last_date = pd.to_datetime(input_data['date'].iloc[-1])

    # Prepare & predict
    scaled = _prepare_features(input_data)
    X = torch.FloatTensor(scaled).unsqueeze(0).to(device)  # (1, window, features)

    with torch.no_grad():
        pred_scaled = model(X).cpu().numpy()[0]  # (forecast_days,)

    # Inverse transform PM2.5 (RobustScaler: x_real = x_scaled * IQR + median)
    median = robust_scaler.center_[PM25_ROBUST_IDX]
    iqr = robust_scaler.scale_[PM25_ROBUST_IDX]
    pred_real = pred_scaled * iqr + median

    # Build output
    predictions = []
    for step in range(min(forecast_days, FORECAST_DAYS)):
        forecast_date = last_date + pd.Timedelta(days=step + 1)
        predictions.append({
            'day': step + 1,
            'date': forecast_date.strftime('%Y-%m-%d'),
            'station': station,
            'pm25_forecast': round(float(pred_real[step]), 2),
        })

    return pd.DataFrame(predictions)


# === Example Usage ===
if __name__ == '__main__':
    # ตัวอย่าง: ส่ง 10 วัน (มากกว่า WINDOW_SIZE=7) → ใช้แค่ 7 วันล่าสุด
    input_data = pd.DataFrame([
        {'date': '2020-12-29', 'station': '05T', 'dew_point': 11.0, 'temperature': 21.0,
         'precipitation': 0.0, 'wind_speed': 8.0, 'surface_pressure': 1015.0,
         'relative_humidity': 55, 'wind_direction': 40, 'pm': 18.0},
        {'date': '2020-12-30', 'station': '05T', 'dew_point': 11.5, 'temperature': 21.5,
         'precipitation': 0.0, 'wind_speed': 8.5, 'surface_pressure': 1014.8,
         'relative_humidity': 56, 'wind_direction': 42, 'pm': 19.0},
        {'date': '2020-12-31', 'station': '05T', 'dew_point': 12.0, 'temperature': 21.8,
         'precipitation': 0.0, 'wind_speed': 9.0, 'surface_pressure': 1014.5,
         'relative_humidity': 55, 'wind_direction': 45, 'pm': 19.5},
        {'date': '2021-01-01', 'station': '05T', 'dew_point': 12.8, 'temperature': 22.1,
         'precipitation': 0.0, 'wind_speed': 9.5, 'surface_pressure': 1014.3,
         'relative_humidity': 56, 'wind_direction': 49, 'pm': 20.0},
        {'date': '2021-01-02', 'station': '05T', 'dew_point': 14.9, 'temperature': 22.1,
         'precipitation': 0.0, 'wind_speed': 6.5, 'surface_pressure': 1013.5,
         'relative_humidity': 64, 'wind_direction': 10, 'pm': 25.0},
        {'date': '2021-01-03', 'station': '05T', 'dew_point': 16.2, 'temperature': 23.5,
         'precipitation': 0.0, 'wind_speed': 7.8, 'surface_pressure': 1012.1,
         'relative_humidity': 65, 'wind_direction': 17, 'pm': 37.0},
        {'date': '2021-01-04', 'station': '05T', 'dew_point': 17.8, 'temperature': 25.0,
         'precipitation': 0.0, 'wind_speed': 7.6, 'surface_pressure': 1011.8,
         'relative_humidity': 65, 'wind_direction': 24, 'pm': 31.0},
        {'date': '2021-01-05', 'station': '05T', 'dew_point': 19.3, 'temperature': 25.5,
         'precipitation': 0.0, 'wind_speed': 5.9, 'surface_pressure': 1011.8,
         'relative_humidity': 69, 'wind_direction': 21, 'pm': 31.0},
        {'date': '2021-01-06', 'station': '05T', 'dew_point': 19.7, 'temperature': 25.8,
         'precipitation': 0.0, 'wind_speed': 7.7, 'surface_pressure': 1010.2,
         'relative_humidity': 70, 'wind_direction': 33, 'pm': 32.0},
        {'date': '2021-01-07', 'station': '05T', 'dew_point': 19.4, 'temperature': 26.7,
         'precipitation': 0.0, 'wind_speed': 7.6, 'surface_pressure': 1009.3,
         'relative_humidity': 66, 'wind_direction': 58, 'pm': 26.0},
    ])

    print("=" * 55)
    print(f"PM2.5 Forecast (LSTM) - Station {input_data['station'].iloc[0]}")
    print(f"Input: {len(input_data)} วัน (ใช้ {WINDOW_SIZE} วันล่าสุด)")
    print("=" * 55)

    print("\n[Input] ข้อมูลทั้งหมด:")
    print(input_data[['date', 'pm']].to_string(index=False))

    results = forecast(input_data)

    print(f"\n[Output] พยากรณ์ {FORECAST_DAYS} วันล่วงหน้า:")
    print(results.to_string(index=False))
