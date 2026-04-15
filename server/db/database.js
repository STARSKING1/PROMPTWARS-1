import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'guardian.db');
const db = new Database(dbPath);

console.log('GuardianDB: Initializing SQLite Intelligence Layer...');

// ============================================================
// SCHEMA INITIALIZATION
// ============================================================
db.exec(`
  CREATE TABLE IF NOT EXISTS routes (
    id TEXT PRIMARY KEY,
    name TEXT,
    summary TEXT,
    distance REAL,
    factors JSON,
    path JSON
  );

  CREATE TABLE IF NOT EXISTS risks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    location TEXT,
    severity TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT,
    message TEXT,
    is_urgent INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ============================================================
// SEED DATA (Whitefield to DSU)
// ============================================================
const seedRoutes = [
  {
    id: 'route-a',
    name: 'Outer Ring Road (ORR) Path',
    summary: 'Via Marathahalli - Silk Board - Banashankari',
    distance: 22.4,
    factors: JSON.stringify({
      traffic: 8,
      weather: 'Light Rain',
      lighting: 'High (LED Optimized)',
      pavement: 'Good',
      drainage: 'Fair',
      accidentDensity: 'Medium',
      infrastructure: 'CCTV Monitored'
    }),
    path: JSON.stringify([
      { lat: 12.9698, lng: 77.7500 },
      { lat: 12.9561, lng: 77.7010 },
      { lat: 12.9177, lng: 77.6238 },
      { lat: 12.9116, lng: 77.5830 },
      { lat: 12.9100, lng: 77.5670 }
    ])
  },
  {
    id: 'route-b',
    name: 'Sarjapur Main Road Path',
    summary: 'Via Varthur - Sarjapur - HSR Layout',
    distance: 19.8,
    factors: JSON.stringify({
      traffic: 6,
      weather: 'Heavy Downpour',
      lighting: 'Medium (Intermittent)',
      pavement: 'Fair',
      drainage: 'Poor (High Flood Risk)',
      accidentDensity: 'Low',
      infrastructure: 'Under Maintenance'
    }),
    path: JSON.stringify([
      { lat: 12.9698, lng: 77.7500 },
      { lat: 12.9377, lng: 77.6970 },
      { lat: 12.9200, lng: 77.6840 },
      { lat: 12.9116, lng: 77.6389 },
      { lat: 12.9100, lng: 77.5670 }
    ])
  },
  {
    id: 'route-c',
    name: 'Internal Layouts (Shortcut)',
    summary: 'Via HAL - Koramangala - Jayanagar',
    distance: 20.5,
    factors: JSON.stringify({
      traffic: 4,
      weather: 'Light Rain',
      lighting: 'Low (Residential)',
      pavement: 'Variable',
      drainage: 'Good',
      accidentDensity: 'High (Blind Curves)',
      infrastructure: 'Minimal'
    }),
    path: JSON.stringify([
      { lat: 12.9698, lng: 77.7500 },
      { lat: 12.9600, lng: 77.6400 },
      { lat: 12.9352, lng: 77.6245 },
      { lat: 12.9300, lng: 77.5830 },
      { lat: 12.9100, lng: 77.5670 }
    ])
  }
];

const insertRoute = db.prepare(`
  INSERT OR REPLACE INTO routes (id, name, summary, distance, factors, path)
  VALUES (@id, @name, @summary, @distance, @factors, @path)
`);

seedRoutes.forEach(r => insertRoute.run(r));

// Seed initial risks
db.exec(`
  DELETE FROM risks;
  INSERT INTO risks (type, location, severity) VALUES ('Flooding', 'Silk Board Junction', 'High');
  INSERT INTO risks (type, location, severity) VALUES ('Roadwork', 'Koramangala 80ft Rd', 'Medium');
`);

export function getRoutes() {
  return db.prepare('SELECT * FROM routes').all().map(r => ({
    ...r,
    factors: JSON.parse(r.factors),
    path: JSON.parse(r.path)
  }));
}

export function getRisks() {
  return db.prepare('SELECT * FROM risks ORDER BY timestamp DESC LIMIT 5').all();
}

export function addLog(source, message, isUrgent = 0) {
  db.prepare('INSERT INTO logs (source, message, is_urgent) VALUES (?, ?, ?)').run(source, message, isUrgent);
}

export function getLogs() {
  return db.prepare('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 20').all();
}

export default db;
