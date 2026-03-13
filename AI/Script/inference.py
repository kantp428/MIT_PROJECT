"""
RF PM2.5 Inference - พยากรณ์ PM2.5 ล่วงหน้า 1-7 วัน แบบ Recursive

Input:
  DataFrame หรือ list of dict อย่างน้อย LAG_DAYS แถว มีคอลัมน์:
    date, station, dew_point, temperature, precipitation,
    wind_speed, surface_pressure, relative_humidity, wind_direction, pm
  (ถ้าส่งมากกว่า LAG_DAYS จะใช้แค่ N วันล่าสุด)

Output:
  ค่า PM2.5 พยากรณ์ 1-7 วันข้างหน้า
"""

import numpy as np
import pandas as pd
import joblib
import json
import os

# === Load Model & Config ===
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(SCRIPT_DIR, 'rf_model.joblib'))
with open(os.path.join(SCRIPT_DIR, 'model_config.json'), 'r') as f:
    config = json.load(f)

LAG_DAYS = config['lag_days']
FORECAST_DAYS = config['forecast_days']
FEATURE_COLS = config['feature_cols']
PM25_LAG_COLS = config['pm25_lag_cols']


def _prepare_features(row: pd.Series) -> dict:
    """แปลงข้อมูลดิบ 1 แถวเป็น weather features ที่โมเดลต้องการ"""
    wind_dir = row['wind_direction']
    date = pd.to_datetime(row['date'])

    return {
        'dew_point_2m_mean': row['dew_point'],
        'temperature_2m_mean': row['temperature'],
        'precipitation_sum': row['precipitation'],
        'wind_speed_10m_mean': row['wind_speed'],
        'surface_pressure_mean': row['surface_pressure'],
        'relative_humidity_2m_mean': row['relative_humidity'],
        'wind_dir_sin': np.sin(2 * np.pi * wind_dir / 360),
        'wind_dir_cos': np.cos(2 * np.pi * wind_dir / 360),
        'month_sin': np.sin(2 * np.pi * date.month / 12),
        'month_cos': np.cos(2 * np.pi * date.month / 12),
    }


def forecast(input_data, forecast_days: int = None) -> pd.DataFrame:
    """
    พยากรณ์ PM2.5 ล่วงหน้าแบบ Recursive

    Parameters:
        input_data: DataFrame หรือ list of dict อย่างน้อย LAG_DAYS แถว
                    คอลัมน์: date, station, dew_point, temperature, precipitation,
                            wind_speed, surface_pressure, relative_humidity,
                            wind_direction, pm
                    (ถ้าส่งมากกว่า LAG_DAYS จะใช้แค่ N วันล่าสุด)
        forecast_days: จำนวนวันที่ต้องการพยากรณ์ (default: 7)

    Returns:
        DataFrame: day, date, station, pm25_forecast
    """
    if forecast_days is None:
        forecast_days = FORECAST_DAYS

    # แปลงเป็น DataFrame ถ้าจำเป็น
    if not isinstance(input_data, pd.DataFrame):
        input_data = pd.DataFrame(input_data)

    if len(input_data) < LAG_DAYS:
        raise ValueError(f"ต้องการข้อมูลอย่างน้อย {LAG_DAYS} วัน แต่ได้ {len(input_data)} วัน")

    # เรียงตามวันที่ แล้วใช้แค่ LAG_DAYS วันล่าสุด
    input_data = input_data.sort_values('date').reset_index(drop=True)
    input_data = input_data.tail(LAG_DAYS).reset_index(drop=True)

    station = input_data['station'].iloc[0]

    # Input เรียง เก่า → ใหม่: [day1, day2, ..., day7]
    # โมเดลต้องการ ใหม่ → เก่า: [day7, day6, ..., day1] (ตรงกับ pm25, pm25_lag1, ..., pm25_lag6)
    # จึงต้อง reverse
    pm25_history = input_data['pm'].values[::-1].tolist()

    # Weather ของวันล่าสุด (ใช้สำหรับ recursive forecast)
    last_weather = _prepare_features(input_data.iloc[-1])
    last_date = pd.to_datetime(input_data['date'].iloc[-1])

    predictions = []
    for step in range(1, forecast_days + 1):
        # สร้าง feature row
        row = {}
        row.update(last_weather)
        for i, col in enumerate(PM25_LAG_COLS):
            row[col] = pm25_history[i]

        X = pd.DataFrame([row])[FEATURE_COLS]
        pred = model.predict(X)[0]

        forecast_date = last_date + pd.Timedelta(days=step)
        predictions.append({
            'day': step,
            'date': forecast_date.strftime('%Y-%m-%d'),
            'station': station,
            'pm25_forecast': round(float(pred), 2),
        })

        # อัปเดต history: ใส่ predicted เข้าข้างหน้า, เลื่อนเก่าออก
        pm25_history = [pred] + pm25_history[:-1]

    return pd.DataFrame(predictions)


# === Example Usage ===
if __name__ == '__main__':
    # ตัวอย่าง: ส่ง 10 วัน (มากกว่า LAG_DAYS=7) → ใช้แค่ 7 วันล่าสุด
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
         {'date': '2021-01-08', 'station': '05T', 'dew_point': 16.2, 'temperature': 23.5,
         'precipitation': 0.0, 'wind_speed': 7.8, 'surface_pressure': 1012.1,
         'relative_humidity': 65, 'wind_direction': 17, 'pm': 37.0},
        {'date': '2021-01-09', 'station': '05T', 'dew_point': 17.8, 'temperature': 25.0,
         'precipitation': 0.0, 'wind_speed': 7.6, 'surface_pressure': 1011.8,
         'relative_humidity': 65, 'wind_direction': 24, 'pm': 31.0},
         {'date': '2021-01-10', 'station': '05T', 'dew_point': 11.5, 'temperature': 21.5,
         'precipitation': 0.0, 'wind_speed': 8.5, 'surface_pressure': 1014.8,
         'relative_humidity': 56, 'wind_direction': 42, 'pm': 19.0},
        {'date': '2021-01-11', 'station': '05T', 'dew_point': 12.0, 'temperature': 21.8,
         'precipitation': 0.0, 'wind_speed': 9.0, 'surface_pressure': 1014.5,
         'relative_humidity': 55, 'wind_direction': 45, 'pm': 19.5}
    ])

    print("=" * 55)
    print(f"PM2.5 Forecast (RF) - Station {input_data['station'].iloc[0]}")
    print(f"Input: {len(input_data)} วัน (ใช้ {LAG_DAYS} วันล่าสุด)")
    print("=" * 55)

    print("\n[Input] ข้อมูลทั้งหมด:")
    print(input_data[['date', 'pm']].to_string(index=False))

    results = forecast(input_data)

    print(f"\n[Output] พยากรณ์ {FORECAST_DAYS} วันล่วงหน้า:")
    print(results.to_string(index=False))
