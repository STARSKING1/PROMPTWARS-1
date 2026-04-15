# 🛡️ UrbanGuard Live — Real-Time Mobility Network

> **UrbanGuard Live is a professional, data-driven mobility intelligence platform. It leverages live Google Maps Platform APIs, browser geolocation, and crowd-density modeling to prioritize Safety, Sustainability, and Efficiency in urban movement.**

## 🏛️ Full-Stack Intelligence Architecture

| Layer | Module | Data Source |
|---|---|---|
| **Backend (SQLite)** | **Urban Pulse Telemetry** | Simulated Radio-Wave Density API |
| **Backend (SQLite)** | **Eco-Audit Registry** | Persistent Carbon-Savings Ledger |
| **Security (Node)** | **PQC Middleware** | Post-Quantum Telemetry Protection |
| **Frontend (JS)** | **Directions Engine** | Live Google Maps API Routing |
| **Frontend (JS)** | **Sentinel View** | Dynamic Heatmap Visualization |

## 🏆 Innovation Summary: The Urban Pulse
UrbanGuard Live is more than a map; it's a city twin. By correlating simulated radio-wave density from the SQLite backend with real-time Google traffic, it predicts unsafe crowd clusters and rewards sustainable movement with persistent auditing—all secured for the post-quantum era.

## 🛡️ Privacy & Security Protocols
UrbanGuard Live is built with a **Security-First** philosophy:
- **Identifier Anonymization**: All user-reported hashes are processed via **SHA-256** with unique server-side salts. No raw device or user IDs are stored.
- **Dual-Pass Sanitization**: All incoming hazard data is sanitized on the Node.js server and again before rendering in the browser to prevent XSS and injection.
- **Transient Geolocation**: Live incident data is strictly transient and automatically expires from the logic engine after **24 hours**.
- **Environment Isolation**: API keys are contained within server-side `.env` files and delivered to the UI via a secure dynamic handshake.

## 🚀 Deployment & Presentation

1. **Insert API Key**: Open `index.html` and replace `YOUR_GOOGLE_MAPS_API_KEY` (in two locations in the loader script) with a valid key.
2. **Launch**: Simply open `index.html` in a web browser.
3. **Analyze**:
   - Use **📍 GPS** to lock your origin.
   - Enter a **Destination** and a **Target Arrival Time**.
   - Toggle **Journey Support** to overlay medical support infrastructure along your corridor.
   - Activate **Urban Pulse** (Heatmap) to see the city's crowd clusters in real-time thermal view.
   - Observe the **Eco-Impact Ledger** update at the top of the screen as you select different movement options.

---

*UrbanGuard Live — Engineering safe and sustainable urban fluidity.* 🌍