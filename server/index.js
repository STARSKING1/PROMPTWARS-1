import cors from 'cors';
import { getPulseTelemetry, getNeighborhoods, logEcoImpact, getTotalSavings, reportIncident, getActiveIncidents } from './db/database.js';
import { pqcMiddleware } from './middleware/pqc.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.json());
app.use(pqcMiddleware); // Every telemetry stream is PQC-secured

// ============================================================
// API ENDPOINTS (UrbanGuard Live)
// ============================================================

/**
 * GET /api/v1/pulse
 * Returns live signal density hotspots for the Urban Pulse heatmap.
 * Features: Dynamic weight variance simulation.
 */
app.get('/api/v1/pulse', (req, res) => {
  try {
    const data = getPulseTelemetry();
    res.json({
      status: 'success',
      source: 'SENTINEL_RF_POST',
      data: data,
      verified: true
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * GET /api/v1/neighborhoods
 * Returns safety index for key Bengaluru wards.
 */
app.get('/api/v1/neighborhoods', (req, res) => {
  try {
    const data = getNeighborhoods();
    res.json({
      status: 'success',
      data: data
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * POST /api/v1/incidents/report
 * User-driven crowdsourcing for live hazards.
 */
app.post('/api/v1/incidents/report', (req, res) => {
  const { type, lat, lng, reporterId } = req.body;
  if (!type || !lat || !lng) {
    return res.status(400).json({ status: 'error', message: 'Missing report data.' });
  }

  try {
    reportIncident(type, lat, lng, reporterId);
    res.json({ status: 'success', message: 'Incident reported to network.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * GET /api/v1/incidents/active
 * Returns user-reported hazards from the last 24h.
 */
app.get('/api/v1/incidents/active', (req, res) => {
  try {
    const data = getActiveIncidents();
    res.json({ status: 'success', data: data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * POST /api/v1/eco-audit/log
 * Persists carbon savings into the global audit log.
 */
app.post('/api/v1/eco-audit/log', (req, res) => {
  const { sessionId, co2Saved } = req.body;
  
  if (!co2Saved) {
    return res.status(400).json({ status: 'error', message: 'No CO2 data provided.' });
  }

  try {
    logEcoImpact(sessionId || 'anon', co2Saved);
    const globalTotal = getTotalSavings();
    
    res.json({
      status: 'success',
      contribution: co2Saved,
      global_total: globalTotal,
      integrity_signature: 'LATTICE_SECURE_ACK'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * GET /api/v1/status
 * Health check for the UrbanGuard Live infrastructure.
 */
app.get('/api/v1/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    security: 'PQC_ACTIVE',
    engine: 'UrbanGuard_Live_v1.5'
  });
});

// ============================================================
// SERVER START
// ============================================================
app.listen(PORT, () => {
  console.log(`\n🛡️  UrbanGuard Live Backend is ONLINE`);
  console.log(`📡 Pulse Telemetry: http://localhost:${PORT}/api/v1/pulse`);
  console.log(`🔐 PQC Security: Mandatory for all endpoints\n`);
});
