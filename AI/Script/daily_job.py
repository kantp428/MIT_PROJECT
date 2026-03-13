"""
Daily PM2.5 Job — รันทุกวัน 7:00 น.
  1. ดึงข้อมูลเมื่อวาน (weather + PM2.5) → POST /api/pollution/actual/{code}
  2. GET 14 วันล่าสุด → RF forecast 7 วัน → POST /api/pollution/predicted/{code}
"""

import os
import importlib.util
import requests
from datetime import date, datetime, timedelta

# ===============================
# CONFIG
# ===============================

API_BASE_URL   = "https://mit-project-kdse.vercel.app/"

LOCATIONS = [
    ("57T", "เชียงราย",       19.907804,  99.831798),
    ("58T", "แม่ฮ่องสอน",    19.299105,  97.966982),
    ("82T", "หนองคาย",        17.868331, 102.729021),
    ("83T", "อุบลราชธานี",   15.241696, 104.853474),
    ("86T", "พิษณุโลก",       16.814097, 100.259637),
    ("79T", "กาญจนบุรี",      14.025679,  99.529249),
    ("05T", "กรุงเทพมหานคร", 13.667666, 100.618481),
    ("87T", "ตราด",            12.247411, 102.517208),
    ("42T", "สุราษฎร์ธานี",   9.107120,  99.348683),
    ("62T", "นราธิวาส",        6.423428, 101.822979),
]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ===============================
# LOAD RF INFERENCE (Script/inference.py)
# ===============================

_spec = importlib.util.spec_from_file_location(
    "inference", os.path.join(BASE_DIR, "Script", "inference.py")
)
inference = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(inference)

LAG_DAYS = inference.LAG_DAYS


# ===============================
# MAIN JOB
# ===============================

def run_job():

    api_session = requests.Session()

    for code in LOCATIONS:
        r = api_session.get(f"{API_BASE_URL}/api/pollution/actual/{code}")
        history = r.json().get("data", [])
        rows = [
            {
                "date":              row["date"],
                "station":           code,
                "temperature":       row["temp"],
                "dew_point":         row["dew_point"],
                "relative_humidity": row["humidity"],
                "surface_pressure":  row["pressure"],
                "wind_speed":        row["wind_speed"],
                "wind_direction":    row["wind_direction"],
                "precipitation":     row["precipitation"],
                "pm":                row["pm"],
            }
            for row in history
            if row.get("pm") is not None
        ]
        try:
            df_pred = inference.forecast(rows)
        except Exception as e:
            continue

        predictions = [
            {"predicted_for": row["date"], "pm_predicted": row["pm25_forecast"]}
            for _, row in df_pred.iterrows()
        ]

        # 5. POST predictions
        r = api_session.post(f"{API_BASE_URL}/api/pollution/predicted/{code}", json=predictions)

if __name__ == "__main__":
    run_job()
