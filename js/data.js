/**
 * UrbanGuard Live — Data Logic & Signal Simulation
 * 
 * Contains: Signal Intensity algorithms, static hazard data fallbacks,
 * and multi-modal emission metrics.
 */

// ============================================================
// SIGNAL DENSITY LOGIC (The "Radio-Wave" Enhancement)
// ============================================================
const SIGNAL_INTENSITY = {
  calculateDensity() {
    // Simulates crowd density using mock signal interference/strength data
    const hour = new Date().getHours();
    let baseDensity = 30; // 0-100%

    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
      baseDensity = 85;
    } else if (hour >= 22 || hour <= 5) {
      baseDensity = 15;
    }

    return baseDensity + (Math.random() * 10 - 5);
  },
  
  getLabel(density) {
    if (density > 80) return { text: 'Critical / Overcrowded', class: 'danger' };
    if (density > 50) return { text: 'High Density', class: 'warning' };
    if (density > 30) return { text: 'Moderate', class: 'success' };
    return { text: 'Optimal / Low Density', class: 'safe' };
  }
};

// ============================================================
// INNOVATION: URBAN PULSE HEATMAP POINTS
// ============================================================
// Simulated high-density hotspots in Bengaluru
const URBAN_PULSE_POINTS = [
  { lat: 12.9177, lng: 77.6238, weight: 10 }, // Silk Board
  { lat: 12.9221, lng: 77.6210, weight: 8 },  // HSR Sector 7
  { lat: 12.9784, lng: 77.6408, weight: 9 },  // Indiranagar 100ft Rd
  { lat: 12.9561, lng: 77.7010, weight: 9 },  // Marathahalli
  { lat: 13.0285, lng: 77.5895, weight: 8 },  // Hebbal
  { lat: 12.9352, lng: 77.6245, weight: 7 },  // Koramangala
  { lat: 12.9300, lng: 77.5830, weight: 7 },  // Jayanagar 4th Block
  { lat: 12.9716, lng: 77.5946, weight: 6 },  // MG Road
  { lat: 12.9698, lng: 77.7500, weight: 10 }, // Whitefield Hub
  { lat: 12.9100, lng: 77.5670, weight: 5 },  // Banashankari (DSU Zone)
  // Add some random noise points
  { lat: 12.9400, lng: 77.6600, weight: 3 },
  { lat: 12.9800, lng: 77.6000, weight: 4 },
  { lat: 12.9200, lng: 77.6500, weight: 5 },
  { lat: 13.0000, lng: 77.6100, weight: 4 },
  { lat: 12.9500, lng: 77.6800, weight: 6 }
];

// ============================================================
// INNOVATION: NEIGHBORHOOD SAFETY PROFILES
// ============================================================
const NEIGHBORHOOD_PROFILES = {
  koramangala: { nsi: 82, status: 'Stable', alerts: 0 },
  indiranagar: { nsi: 88, status: 'Secure', alerts: 0 },
  silk_board: { nsi: 45, status: 'Critical', alerts: 2 },
  whitefield: { nsi: 65, status: 'Moderate', alerts: 1 },
  jayanagar: { nsi: 92, status: 'Safe', alerts: 0 }
};

// ============================================================
// EMISSION CONSTANTS (For the "Greenest" path analysis)
// ============================================================
const MODAL_DATA = {
  DRIVING: { co2PerKm: 192, icon: '🚗', safetyBase: 65, ecoLevel: 'low' },
  TRANSIT: { co2PerKm: 27, icon: '🚇', safetyBase: 85, ecoLevel: 'high' },
  BICYCLING: { co2PerKm: 0, icon: '🚲', safetyBase: 40, ecoLevel: 'ultimate' },
  WALKING: { co2PerKm: 0, icon: '🚶', safetyBase: 90, ecoLevel: 'ultimate' }
};

// ============================================================
// STATIC SAFETY LAYERS (Fallback data for safety scoring)
// ============================================================
const SAFETY_ZONES = [
  { name: 'Central Business District', lighting: 'High', accidentRisk: 'Medium' },
  { name: 'Whitefield Tech Corridor', lighting: 'High', accidentRisk: 'High (Construction)' },
  { name: 'Koramangala Layout', lighting: 'High', accidentRisk: 'Medium' },
  { name: 'Outer Ring Road', lighting: 'Medium', accidentRisk: 'High' }
];

// Hospital Search categories
const SUPPORT_CATEGORIES = {
  hospitals: ['hospital', 'health', 'clinic'],
  hotels: ['hotel', 'lodging', 'resort']
};
