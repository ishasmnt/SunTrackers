# Hardware Implementation Research: PowerWestJava / SunTrackers

Date: 20 Jan 2026
Author: (generated)

## Executive summary
This document outlines a practical, staged plan to implement physical solar hardware as part of the PowerWestJava / SunTrackers project. It covers recommended hardware components (PV modules, inverters, batteries, mounting/trackers, sensors), local site and regulatory considerations (West Java / Indonesia), telemetry and integration with the existing web platform, Bill of Materials (BOM) guidance, rough cost estimates, testing and validation steps, and an implementation timeline.

Goal: produce a short, actionable research deliverable you can submit as part of the project. It assumes the software stack already implemented in the repo (AI-powered planner, community investment portal, backend APIs) will be used to size, monitor, and report on deployed solar systems.

---

## 1) Project mapping: where hardware fits into this repo
- The app currently contains a Solar Planner (frontend `Planner.jsx`) and backend endpoints (e.g., `/api/calculate-solar` referenced in `frontend/src/services/api.js`). The planner computes energy needs, sizing, payback, and investment estimates.
- Hardware will be deployed at school sites (the project targets schools in West Java). Deployed hardware should feed telemetry (generation, voltage, current, battery SOC, inverter status) back to the backend for monitoring and reporting.
- Integration points:
  - Telemetry ingestion endpoint(s) on backend: e.g., POST `/api/telemetry` (new) to accept device data (JSON). Use authentication (device keys or JWT).
  - Device registration endpoint: e.g., POST `/api/devices` to register a new hardware node (site ID, GPS coordinates, hardware spec, inverter serials).
  - Planner and analysis pages (frontend) will display real-time/aggregated generation and system health using data from `/api/telemetry` and device metadata.


## 2) High-level system architecture
- Site hardware: PV array → DC combiner → inverter/charger → AC loads / grid / battery (optional).
- Monitoring hardware: sensors and a local controller (edge node) that reads inverter via Modbus/RS485 (or inverter REST API) and collects environmental sensors (irradiance, module temperature, ambient temperature), and optionally a tracker controller for single-axis trackers.
- Edge controller: small embedded computer/microcontroller (ESP32/ESP8266 for simple telemetry; Raspberry Pi or industrial gateway for richer data, local UI, and on-device logic).
- Communication: Wi-Fi (if available), LTE/3G (USB modem) or LoRaWAN depending on connectivity.
- Cloud: Backend REST API (extend existing backend) to ingest telemetry; database (Mongo/MongoAtlas) for time-series or use a dedicated TSDB (InfluxDB). Frontend will visualize the data.

Diagram (conceptual):
Site sensors & inverters -> Edge node (collects data, optionally controls trackers) -> Internet -> Backend `/api/telemetry` -> DB -> Frontend dashboards


## 3) Recommended hardware components
This section contains recommended, commonly available components for school-scale solar projects (2–20 kW systems). Pick components with local availability and suitable warranties.

A. PV modules
- Type: monocrystalline (higher efficiency) or polycrystalline (cheaper); prefer Tier-1 manufacturers.
- Example spec per panel: 380–450 W, 60/72-cell panels, efficiency 19–22%.
- Qty/size determined by planner; typical school projects: 3 kWp, 5 kWp, 10 kWp.

B. Inverter
- Grid-tied: SMA Sunny Boy, Growatt, Fronius, Sungrow. Choose an inverter sized slightly above array DC (or matched per design)
- Hybrid (with batteries): Victron, Huawei, Growatt, GoodWe — if battery backup needed.
- Monitoring interface: ensure inverter supports Modbus RTU/TCP or has an API for telemetry.

C. Batteries (if needed)
- Lithium iron phosphate (LiFePO4) recommended for cycle life and safety; lead-acid only if budget-constrained.
- Battery capacity sizing depends on desired autonomy (hours) and load.

D. Mounting & trackers
- Fixed-tilt rooftop racking: simplest and cheapest.
- Single-axis trackers: increase energy yield (10–25% improvement) but add mechanical complexity and maintenance.
- For school rooftops, fixed-tilt usually preferrable. For open ground arrays, consider single-axis trackers if budget and local conditions allow.

E. Sensors and metering
- Inverter telemetry (primary). Most modern inverters provide power, energy, frequency, voltage, temperature, fault codes.
- CTs (current transformers) for load metering.
- Irradiance sensor (pyranometer or cheaper silicon-cell pyranometer) and module temp sensor (thermocouple or RTD) for performance monitoring.
- Environmental sensor: ambient temperature, humidity (optional).

F. Edge controller & communications
- Edge controller options:
  - ESP32 / ESP32-S2: cheap Wi-Fi microcontroller good for reading sensors and posting simple telemetry (limited Modbus support with libraries).
  - Raspberry Pi Zero 2 W or Raspberry Pi 4: preferred for Modbus RTU over USB/RS485, persistent buffering, local CSV, and richer logic. Can run Node/ Python scripts and MQTT client.
  - Industrial gateway (Teltonika, Moxa) for robust deployments
- Communications:
  - Wi-Fi (school existing Wi-Fi)
  - 4G USB modem (Telkomsel SIM) when Wi-Fi not available
  - LoRaWAN for low-bandwidth sensor-only networks (not recommended for inverter telemetry due to bandwidth/latency)

G. Tracker Controller (optional)
- If using trackers, a small PLC or microcontroller (Arduino Mega, ESP32 with motor drivers) to drive linear actuators or geared motors with limit switches and light-sensor or astronomical control.


## 4) Data & integration: telemetry shape and flow
A. Telemetry schema (JSON example)
{
  "device_id": "site-123",
  "timestamp": "2026-01-20T06:45:00Z",
  "inverter": {
    "model": "Growatt-X",
    "ac_power_w": 3200,
    "dc_power_w": 3400,
    "energy_today_kwh": 12.34,
    "energy_total_kwh": 1234.5,
    "status": "running",
    "fault_code": null
  },
  "batt": {
    "soc_pct": 78,
    "voltage_v": 52.3,
    "current_a": -10.2
  },
  "sensors": {
    "irradiance_w_m2": 810,
    "module_temp_c": 42.3,
    "ambient_temp_c": 31.0
  }
}

B. Integration steps
- Add backend endpoint `POST /api/telemetry` to validate and store telemetry.
- Authentication: use device API keys; during site provisioning, generate a device API key and store in device config.
- Database: store raw telemetry and processed summary (minute/hour/day). If no TSDB available, store aggregated hourly summaries in MongoDB.
- Frontend: add a device dashboard page (SchoolView already exists) to visualize generation graphs and key KPIs.

C. Time-series storage options
- Lightweight: store time-binned documents in MongoDB (every minute/hour aggregated)
- Preferred for scale: InfluxDB or TimescaleDB for efficient time-series queries.


## 5) Site survey checklist & physical considerations
- Roof orientation and tilt (measured with smartphone compass or clinometer)
- Obstructions and shading analysis (trees, chimneys). Use the planner to estimate irradiance loss.
- Roof structural capacity and mounting points. Engage a structural engineer for large arrays.
- Proximity to AC distribution (for inverter placement) and access for maintenance.
- Connectivity availability (Wi-Fi strength; mobile coverage).
- Security (site locking, theft prevention for inverters/panels)


## 6) Sample BOM (school 5 kW system) — approximate
- PV modules 13 × 380 W = 4.94 kWp — 13 × $130 = $1,690
- Inverter (5 kW grid-tied, built-in monitoring) — $1,000
- Mounting & racking (roof) — $500
- Wiring, DC combiner, DC fuses, AC breaker — $200
- Installation labor — $700
- Metering and CTs — $150
- Edge controller (Raspberry Pi Zero W + RS485 USB adapter + enclosure) — $120
- Sensors (pyranometer cheaper silicon cell) — $150
- Contingency & transport — $300
- Estimated total (ballpark): $5,800–$7,500 (local pricing will vary)

Notes: This is a rough estimate for research. For procurement use local supplier quotes.


## 7) Implementation plan & timeline (high-level)
Phase 0 — Prep (1–2 weeks)
- Finalize hardware spec and budget, get supplier quotes, confirm site availability and permits.
- Update backend API design for telemetry & devices.

Phase 1 — Pilot deployment (2–4 weeks)
- Deploy 1 pilot at a nearby school (e.g., 3–5 kWp)
- Install panels, inverter, basic metering, edge controller, and connectivity
- Integrate telemetry into backend and display on frontend
- Run 1–2 months testing and collect metrics

Phase 2 — Iterate & scale (3–12 months)
- Improve telemetry processing, add alerts (faults, low generation), and community funding flow
- Deploy more sites, improve training for local maintenance


## 8) Testing & validation plan
- Pre-installation: module-level QA (visual inspection), string continuity
- Commissioning: inverter configuration, test export/import, verify data flow to backend
- Functional tests: energy yield vs planner estimate (daily comparison), system efficiency checks
- Safety tests: earthing tests, insulation resistance tests


## 9) Local regulations & compliance (West Java / Indonesia)
- Interconnection rules: contact PLN (Perusahaan Listrik Negara) local office for net-metering or interconnection requirements.
- Permits and inspections: local government and building permits may be required, especially for rooftop structural modifications.
- Electrical code: follow SNI (Indonesian National Standards) relevant to PV installation where applicable; use certified electricians.

Recommendation: engage a local licensed installer and confirm PLN procedures for grid-tie and export rules.


## 10) Risks & mitigations
- Theft or vandalism — mitigate with locking hardware, physical security, insurance
- Connectivity loss — use local buffering on edge nodes and offline storage
- Weather and corrosion — use IP-rated enclosures and corrosion-resistant mounting
- Wrong sizing — pilot and monitoring to validate planner results; use conservative assumptions during procurement


## 11) Suggested next technical tasks (actions I can implement now)
- Add backend device/telemetry endpoints and a simple device registration flow (I can add code skeletons and Swagger example requests).
- Add an Edge-Node reference implementation (Node.js on Raspberry Pi) that polls Modbus from inverter and posts telemetry to `/api/telemetry`.
- Create a sample BOM and procurement checklist in CSV or spreadsheet format.
- Add a frontend device dashboard page wiring to show incoming telemetry (extend `SchoolView.jsx`).

If you want, I can produce one or more of the above artifacts next: code skeletons for backend endpoints, a Pi/Node reference collector script, or a ready-to-submit research document in PDF/Word.


## 12) References & resources
- IEA PVPS, PV system design guides
- Local PLN interconnection information (contact local PLN office)
- Inverter vendor manuals (Growatt, Fronius, Sungrow)
- Open-source inverter telemetry projects (pvoutput.org, OpenEnergyMonitor, fronius-datalogger)

---

Appendix: Minimal telemetry POST example (curl)

```bash
curl -X POST https://your-backend.example/api/telemetry \
  -H 'Content-Type: application/json' \
  -H 'x-device-key: <DEVICE_KEY>' \
  -d '{ "device_id":"site-1","timestamp":"2026-01-20T06:45:00Z","inverter":{"ac_power_w":3200,"energy_today_kwh":12.34},"sensors":{"irradiance_w_m2":810}}'
```

---

If you'd like, I can now:
- produce a PDF/Word export of this document in the repo (`docs/Hardware_Implementation_Research.pdf`), or
- implement the backend endpoints + a small example edge-client script and wire one pilot page in the frontend.

Which should I do next?