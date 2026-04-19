# 🛡️ UrbanGuard Live — Real-Time Mobility Network

> **UrbanGuard Live is a professional, data-driven mobility intelligence platform. It leverages live Google Maps Platform APIs, browser geolocation, and crowd-density modeling to prioritize Safety, Sustainability, and Efficiency in urban movement.**

## 🏛️ Full-Stack Intelligence Architecture

| Layer | Module | Data Source |
|---|---|---|
| **Backend (SQLite)** | **Urban Pulse Telemetry** | Simulated Radio-Wave Density API |
| **Backend (SQLite)** | **Eco-Audit Registry** | Persistent Carbon-Savings Ledger |
| **Backend (SQLite)** | **Hazard Network** | Crowdsourced Incident Ledger with Severity |
| **Security (Node)** | **PQC Middleware** | Post-Quantum Telemetry Protection |
| **Frontend (JS)** | **Directions Engine** | Live Google Maps API Routing |
| **Frontend (JS)** | **Sentinel View** | Dynamic Heatmap Visualization |
| **Frontend (JS)** | **Safety Guard** | Real-Time Neighborhood Security Index |

## 🏆 Innovation Summary: The Urban Pulse & Safety Guard
UrbanGuard Live is more than a map; it's a city twin. By correlating simulated radio-wave density from the SQLite backend with real-time Google traffic and community-reported hazards, it predicts unsafe crowd clusters. The new **Safety Guard** provides ward-level security metrics, allowing users to monitor neighborhood safety before they even start their journey.

## 🛡️ Privacy & Security Protocols
UrbanGuard Live is built with a **Security-First** philosophy:
- **Identifier Anonymization**: All user-reported hashes are processed via **SHA-256** with unique server-side salts. No raw device or user IDs are stored.
- **Dual-Pass Sanitization**: All incoming hazard data is sanitized on the Node.js server and again before rendering in the browser to prevent XSS and injection.
- **Transient Geolocation**: Live incident data is strictly transient and automatically expires from the logic engine after **24 hours**.
- **Environment Isolation**: API keys are contained within server-side `.env` files and delivered to the UI via a secure dynamic handshake.

## 🚀 Deployment & Presentation

1. **Backend Setup**:
   - Navigate to the `server/` directory.
   - Run `npm install` to install dependencies.
   - Duplicate `.env.example` to `.env`.
   - Insert your Google Maps API Key in `.env`.
   - Run `npm run dev` to start the intelligence server.

2. **Launch Frontend**:
   - Open `index.html` in a modern web browser.
   - The UI will automatically sync with the backend at `localhost:3000`.

3. **Analyze**:
   - Use **📍 GPS** to lock your origin.
   - Enter a **Destination** and observe the **Movement Metrics**.
   - Use the **Neighborhood Safety Guard** to check ward-level security.
   - **Report Hazards**: Use the floating red button to broadcast hazards with severity and descriptions.
   - Observe the **Eco-Impact Ledger** update at the top of the screen.

---

*UrbanGuard Live — Engineering safe and sustainable urban fluidity.* 🌍