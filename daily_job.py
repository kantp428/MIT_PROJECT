"""
Daily PM2.5 Job — รันทุกวัน 7:00 น.
  1. ดึงข้อมูลเมื่อวาน (weather + PM2.5) → POST /api/pollution/actual/{code}
  2. GET 14 วันล่าสุด → RF forecast 7 วัน → POST /api/pollution/predicted/{code}
"""

import os
import sys
import time
import importlib.util
import logging
import requests
from datetime import date, datetime, timedelta

# ===============================
# CONFIG
# ===============================

OPENAQ_API_KEY = "13e6eed65fc8ccd6f9fe75617c6cbbf4ccad71a363d6592153a63a1d8a76860b"
API_BASE_URL   = "https://mit-project-kdse.vercel.app/"   # TODO: เปลี่ยนเป็น URL จริง

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
# LOGGING
# ===============================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(os.path.join(BASE_DIR, "daily_job.log"), encoding="utf-8"),
    ],
)
log = logging.getLogger(__name__)

# ===============================
# LOAD RF INFERENCE (Script/inference.py)
# ===============================

_spec = importlib.util.spec_from_file_location(
    "inference", os.path.join(BASE_DIR, "Script", "inference.py")
)
inference = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(inference)

LAG_DAYS = inference.LAG_DAYS  # 14

# ===============================
# HTTP HELPERS
# ===============================

aq_session = requests.Session()
aq_session.headers.update({"X-API-Key": OPENAQ_API_KEY})


def safe_get(session, url, params, retries=3):
    for attempt in range(retries):
        try:
            r = session.get(url, params=params, timeout=30)
            if r.status_code == 429:
                log.warning("Rate limited — รอ 10s...")
                time.sleep(10)
                continue
            return r
        except Exception as e:
            log.warning(f"GET attempt {attempt + 1} failed: {e}")
            time.sleep(2 * (attempt + 1))
    return None

# ===============================
# FETCH DATA
# ===============================

def get_pm25(lat, lon, date_str):
    """ดึงค่า PM2.5 เฉลี่ยรายวันจาก OpenAQ v3"""
    r1 = safe_get(aq_session, "https://api.openaq.org/v3/locations", {
        "coordinates": f"{lat},{lon}", "radius": 25000, "parameters_id": 2, "limit": 10
    })
    if r1 is None:
        return None

    sensor_ids = []
    for loc in r1.json().get("results", []):
        for s in loc.get("sensors", []):
            if isinstance(s, dict) and s.get("parameter", {}).get("id") == 2:
                sensor_ids.append(s["id"])

    if not sensor_ids:
        return None

    values = []
    for sid in sensor_ids:
        time.sleep(0.5)
        r2 = safe_get(aq_session, f"https://api.openaq.org/v3/sensors/{sid}/measurements/daily", {
            "datetime_from": f"{date_str}T00:00:00+07:00",
            "datetime_to":   f"{date_str}T23:59:59+07:00",
            "limit": 100,
        })
        if r2 is None:
            continue
        for result in r2.json().get("results", []):
            local_date = result["period"]["datetimeFrom"]["local"][:10]
            if local_date == date_str and result.get("summary", {}).get("avg") is not None:
                values.append(result["summary"]["avg"])

    return round(sum(values) / len(values), 4) if values else None


def get_weather(lat, lon, date_str):
    """ดึงข้อมูลสภาพอากาศรายวันจาก Open-Meteo"""
    r = safe_get(requests.Session(), "https://archive-api.open-meteo.com/v1/archive", {
        "latitude": lat, "longitude": lon,
        "start_date": date_str, "end_date": date_str,
        "daily": [
            "dew_point_2m_mean", "temperature_2m_mean", "precipitation_sum",
            "wind_direction_10m_dominant", "wind_speed_10m_mean",
            "surface_pressure_mean", "relative_humidity_2m_mean",
        ],
        "timezone": "Asia/Bangkok",
    })
    if r is None:
        return None

    d = r.json().get("daily", {})
    if not d.get("time"):
        return None

    return {
        "temp":           d["temperature_2m_mean"][0],
        "dew_point":      d["dew_point_2m_mean"][0],
        "humidity":       d["relative_humidity_2m_mean"][0],
        "pressure":       d["surface_pressure_mean"][0],
        "wind_speed":     d["wind_speed_10m_mean"][0],
        "wind_direction": d["wind_direction_10m_dominant"][0],
        "precipitation":  d["precipitation_sum"][0],
    }

# ===============================
# MAIN JOB
# ===============================

def run_job():
    target_date = (date.today() - timedelta(days=1)).strftime("%Y-%m-%d")
    log.info(f"=== Daily Job เริ่มทำงาน | target_date={target_date} ===")

    api_session = requests.Session()

    for code, province, lat, lon in LOCATIONS:
        log.info(f"--- [{code}] {province} ---")

        # 1. ดึงข้อมูลเมื่อวาน
        weather = get_weather(lat, lon, target_date)
        if weather is None:
            log.warning(f"[{code}] weather fetch ล้มเหลว ข้ามไป")
            continue

        pm = get_pm25(lat, lon, target_date)
        log.info(f"[{code}] pm={pm}, temp={weather['temp']}")

        # 2. POST actual data
        actual_payload = {
            "date":       target_date,
            "pm":         pm,
            "fetched_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
            **weather,
        }
        r = api_session.post(f"{API_BASE_URL}/api/pollution/actual/{code}", json=actual_payload)
        if r.ok:
            log.info(f"[{code}] POST actual OK")
        else:
            log.error(f"[{code}] POST actual FAILED {r.status_code}: {r.text[:300]}")

        # 3. GET 14 วันล่าสุด
        r = api_session.get(f"{API_BASE_URL}/api/pollution/actual/{code}")
        if not r.ok:
            log.error(f"[{code}] GET actual FAILED {r.status_code}")
            continue

        history = r.json().get("data", [])

        # แปลง column names ให้ตรงกับที่ inference.py ต้องการ + กรองแถวที่ pm=null ออก
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

        if len(rows) < LAG_DAYS:
            log.warning(f"[{code}] ข้อมูลไม่พอสำหรับ forecast ({len(rows)}/{LAG_DAYS} วัน)")
            continue

        # 4. RF Forecast
        try:
            df_pred = inference.forecast(rows)
        except Exception as e:
            log.error(f"[{code}] forecast error: {e}")
            continue

        predictions = [
            {"predicted_for": row["date"], "pm_predicted": row["pm25_forecast"]}
            for _, row in df_pred.iterrows()
        ]
        log.info(f"[{code}] forecast: {[p['pm_predicted'] for p in predictions]}")

        # 5. POST predictions
        r = api_session.post(f"{API_BASE_URL}/api/pollution/predicted/{code}", json=predictions)
        if r.ok:
            log.info(f"[{code}] POST predicted OK — {len(predictions)} วัน")
        else:
            log.error(f"[{code}] POST predicted FAILED {r.status_code}: {r.text[:300]}")

    log.info("=== Daily Job เสร็จสิ้น ===")


if __name__ == "__main__":
    run_job()
