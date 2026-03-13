-- Updated SQL Script to mock Actual and Predicted PM2.5 data
-- Generated for NeonDB (PostgreSQL)

-- 1. Create Tables (Adjusted to match your provided schema)
CREATE TABLE IF NOT EXISTS location (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    province VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
);

CREATE TABLE IF NOT EXISTS air_quality_actual (
    id SERIAL PRIMARY KEY,
    location_id INTEGER REFERENCES location(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    pm25 DECIMAL(6, 2),
    UNIQUE(location_id, date)
);

CREATE TABLE IF NOT EXISTS air_quality_predicted (
    id SERIAL PRIMARY KEY,
    actual_id INTEGER REFERENCES air_quality_actual(id) ON DELETE CASCADE,
    prediction_date DATE NOT NULL,
    pm25 DECIMAL(6, 2),
    UNIQUE(actual_id, prediction_date)
);

-- 2. Insert the 10 Locations provided by the user
INSERT INTO location (code, province, latitude, longitude) VALUES
    ('57T', 'Chiang Rai',       19.907804, 99.831798),
    ('58T', 'Mae Hong Son',     19.299105, 97.966982),
    ('82T', 'Nong Khai',        17.868331, 102.729021),
    ('83T', 'Ubon Ratchathani', 15.241696, 104.853474),
    ('86T', 'Phitsanulok',      16.814097, 100.259637),
    ('79T', 'Kanchanaburi',     14.025679, 99.529249),
    ('05T', 'Bangkok',          13.667666, 100.618481),
    ('87T', 'Trat',             12.247411, 102.517208),
    ('42T', 'Surat Thani',       9.107120, 99.348683),
    ('62T', 'Narathiwat',        6.423428, 101.822979)
ON CONFLICT (code) DO UPDATE SET 
    province = EXCLUDED.province, 
    latitude = EXCLUDED.latitude, 
    longitude = EXCLUDED.longitude;

-- 3. Mock Data Generation Logic (2026-02-21 to 2026-03-10)
DO $$
DECLARE
    loc RECORD;
    curr_date DATE;
    actual_id_val INTEGER;
    base_pm DECIMAL;
    predicted_pm DECIMAL;
BEGIN
    -- Loop through each location
    FOR loc IN SELECT id FROM location LOOP
        -- Loop through the requested date range
        FOR curr_date IN SELECT generate_series('2026-02-21'::date, '2026-03-10'::date, '1 day'::interval)::date LOOP
            
            -- Generate a random PM2.5 value for actual data (between 10 and 100)
            base_pm := (random() * 90 + 10);
            
            INSERT INTO air_quality_actual (location_id, date, pm25)
            VALUES (loc.id, curr_date, ROUND(base_pm, 2))
            ON CONFLICT (location_id, date) DO UPDATE SET pm25 = EXCLUDED.pm25
            RETURNING id INTO actual_id_val;

            -- Generate 7 Predicted days for each actual record
            FOR i IN 1..7 LOOP
                -- Predictions usually follow a trend, adding drift
                predicted_pm := base_pm + (random() * 20 - 10);
                IF predicted_pm < 0 THEN predicted_pm := 0; END IF;
                
                INSERT INTO air_quality_predicted (actual_id, prediction_date, pm25)
                VALUES (actual_id_val, curr_date + (i || ' day')::interval, ROUND(predicted_pm, 2))
                ON CONFLICT (actual_id, prediction_date) DO UPDATE SET pm25 = EXCLUDED.pm25;
            END LOOP;
            
        END LOOP;
    END LOOP;
END $$;
