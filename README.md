# Smart Air

Smart Air is a PM2.5 monitoring and forecasting project for selected provinces in Thailand. The repository combines a web application for visualization and reporting with AI assets for data preparation, model training, and scheduled prediction updates.

## Overview

The system is designed to:

- monitor PM2.5 conditions in selected provinces in Thailand
- display current and historical pollution data together with related weather information
- forecast PM2.5 up to 7 days in advance
- help users understand risk levels through maps, province filters, and forecast views

## Repository Structure

```text
MIT_PROJECT/
|- smart-air/          # Next.js web application, API routes, Prisma schema
|- AI/                 # notebooks, trained models, inference scripts, raw/processed data
|- Document/           # project documents and manuals
|- Paper/              # related research papers
```

## Main Features

- Thailand PM2.5 map view with province markers
- Province search and filtering
- PM2.5 status display by severity band
- Historical and forecast detail pages
- 7-day PM2.5 forecast timeline
- Information page about PM2.5 and health impact
- Internal API routes for actual and predicted pollution data

## Tech Stack

### Web Application

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Leaflet / React Leaflet

### AI and Data Processing

- Python
- Random Forest inference pipeline
- LSTM experiment assets
- Jupyter notebooks for preprocessing and model evaluation

## Getting Started

### 1. Run the web application locally

```bash
cd smart-air
npm install
```

Create `smart-air/.env.local` with at least:

```env
DATABASE_URL=your_postgresql_connection_string
NEXT_PUBLIC_API_BASE_URL=/api
```

If your database schema has not been created yet:

```bash
npx prisma db push
```

Run the development server:

```bash
npm run dev
```

The app runs on `http://localhost:4000`.

### 2. Run with Docker

From the `smart-air` directory:

```bash
docker compose up --build
```

The container also exposes port `4000`.

## Database

The Prisma schema is located at `smart-air/prisma/schema.prisma`.

Main tables:

- `location`
- `pm_actual`
- `pm_prediction`

These tables store monitored provinces, actual daily PM2.5 and weather data, and forecast results.

## API Overview

The web app includes API routes under `smart-air/app/api`.

Examples:

- `GET /api/pollution/list`
- `GET /api/pollution/detail`
- `GET /api/pollution/forecast/:locationId`
- `GET /api/locations/options`
- `GET/POST /api/pollution/actual/:locationCode`
- `GET/POST /api/pollution/predicted/:locationCode`

## AI Workflow

The `AI/` directory contains the model and data workflow used by the project.

- `AI/model/` contains Random Forest and LSTM notebooks and inference assets
- `AI/data/` contains raw data, processed data, SQL scripts, and data notebooks
- `AI/Script/` contains inference utilities and a daily job script

The scheduled job posts forecast results to the application API after running model inference on recent historical data.

## Supported Scope

- PM2.5 monitoring for selected provinces in Thailand
- daily updated data, not real-time streaming
- forecasting up to 7 days ahead
- web-based access with a mobile-friendly interface

## Notes

- The operational forecasting flow in this repository is centered on the Random Forest inference pipeline.
- LSTM assets are included for experimentation and model comparison.
- Some project documents are stored in `Document/` in PDF format.

## License

This repository does not currently include a license file.
