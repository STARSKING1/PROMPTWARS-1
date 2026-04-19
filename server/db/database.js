import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'guardian.db');
const db = new Database(dbPath);

console.log('UrbanGuardDB: Initializing Live Telemetry Layer...');

// ============================================================
// SCHEMA INITIALIZATION (UrbanGuard Live Build)
// ============================================================
db.exec(`
  -- Stores live signal density telemetry points
  CREATE TABLE IF NOT EXISTS urban_pulse (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lat REAL,
    lng REAL,
    base_weight INTEGER,
    label TEXT
  );

  -- Stores Ward-level Safety Index
  CREATE TABLE IF NOT EXISTS neighborhoods (
    id TEXT PRIMARY KEY,
    name TEXT,
    nsi INTEGER,
    status TEXT,
    alerts INTEGER
  );

  -- Stores persistent Eco-Impact Audit logs
  CREATE TABLE IF NOT EXISTS eco_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    co2_saved INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Stores user-reported community incidents (live hazards)
  CREATE TABLE IF NOT EXISTS community_incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    severity TEXT,
    description TEXT,
    lat REAL,
    lng REAL,
    reporter_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ============================================================
// SEED DATA: URBAN PULSE (Hotspots)
// ============================================================
const pulseSeeds = [
  { lat: 12.9177, lng: 77.6238, base_weight: 10, label: 'Silk Board' },
  { lat: 12.9784, lng: 77.6408, base_weight: 9, label: 'Indiranagar' },
  { lat: 12.9698, lng: 77.7500, base_weight: 10, label: 'Whitefield Hub' },
  { lat: 12.9561, lng: 77.7010, base_weight: 9, label: 'Marathahalli' },
  { lat: 13.0285, lng: 77.5895, base_weight: 8, label: 'Hebbal' },
  { lat: 12.9352, lng: 77.6245, base_weight: 7, label: 'Koramangala' },
  { lat: 12.9300, lng: 77.5830, base_weight: 7, label: 'Jayanagar' },
  { lat: 12.9100, lng: 77.5670, base_weight: 5, label: 'Banashankari' }
];

const insertPulse = db.prepare('INSERT OR REPLACE INTO urban_pulse (lat, lng, base_weight, label) VALUES (@lat, @lng, @base_weight, @label)');
pulseSeeds.forEach(p => insertPulse.run(p));

// ============================================================
// SEED DATA: NEIGHBORHOODS
// ============================================================
const neighborhoodSeeds = [
  { id: 'koramangala', name: 'Koramangala', nsi: 82, status: 'Stable', alerts: 0 },
  { id: 'indiranagar', name: 'Indiranagar', nsi: 88, status: 'Secure', alerts: 0 },
  { id: 'silk_board', name: 'Silk Board Zone', nsi: 45, status: 'Critical', alerts: 2 },
  { id: 'whitefield', name: 'Whitefield Hub', nsi: 65, status: 'Moderate', alerts: 1 },
  { id: 'jayanagar', name: 'Jayanagar', nsi: 92, status: 'Safe', alerts: 0 }
];

const insertWard = db.prepare('INSERT OR REPLACE INTO neighborhoods (id, name, nsi, status, alerts) VALUES (@id, @name, @nsi, @status, @alerts)');
neighborhoodSeeds.forEach(w => insertWard.run(w));

// ============================================================
// SEED DATA: COMMUNITY INCIDENTS
// ============================================================
const incidentSeeds = [
  { type: 'Flood', severity: 'High', description: 'Heavy waterlogging near Silk Board junction.', lat: 12.9172, lng: 77.6230, reporter_id: 'SYSTEM_01' },
  { type: 'Construction', severity: 'Medium', description: 'Road resurfacing work on 100ft road.', lat: 12.9780, lng: 77.6400, reporter_id: 'SYSTEM_02' },
  { type: 'Safety', severity: 'Critical', description: 'Power line down across the road.', lat: 12.9560, lng: 77.7010, reporter_id: 'SYSTEM_03' }
];

const checkIncidents = db.prepare('SELECT COUNT(*) as count FROM community_incidents').get();
if (checkIncidents.count === 0) {
  const insertIncident = db.prepare('INSERT INTO community_incidents (type, severity, description, lat, lng, reporter_id) VALUES (?, ?, ?, ?, ?, ?)');
  incidentSeeds.forEach(inc => insertIncident.run(inc.type, inc.severity, inc.description, inc.lat, inc.lng, inc.reporter_id));
}

// ============================================================
// DATABASE OPERATIONS
// ============================================================

export function getPulseTelemetry() {
  const points = db.prepare('SELECT * FROM urban_pulse').all();
  // Simulate real-time variance (+/- 1 to weight)
  return points.map(p => ({
    ...p,
    weight: Math.max(1, Math.min(10, p.base_weight + (Math.floor(Math.random() * 3) - 1)))
  }));
}

export function getNeighborhoods() {
  return db.prepare('SELECT * FROM neighborhoods').all();
}

export function logEcoImpact(sessionId, co2Saved) {
  return db.prepare('INSERT INTO eco_audit (session_id, co2_saved) VALUES (?, ?)').run(sessionId, co2Saved);
}

export function getTotalSavings() {
  const result = db.prepare('SELECT SUM(co2_saved) as total FROM eco_audit').get();
  return result.total || 0;
}

export function reportIncident(type, severity, description, lat, lng, reporterId = 'anon') {
  const hashedId = hashId(reporterId);
  return db.prepare('INSERT INTO community_incidents (type, severity, description, lat, lng, reporter_id) VALUES (?, ?, ?, ?, ?, ?)').run(type, severity, description, lat, lng, hashedId);
}

/**
 * Privacy: SHA-256 ID Anonymization
 */
function hashId(id) {
  const salt = process.env.ANONYMIZATION_SALT || 'default_salt';
  return crypto.createHash('sha256').update(id + salt).digest('hex');
}

export function getActiveIncidents() {
  // Returns incidents reported in the last 24 hours
  return db.prepare("SELECT * FROM community_incidents WHERE timestamp >= datetime('now', '-24 hours') ORDER BY timestamp DESC").all();
}

export default db;
