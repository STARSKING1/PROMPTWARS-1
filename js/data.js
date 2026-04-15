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

    // Peak hour simulation
    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
      baseDensity = 85;
    } else if (hour >= 22 || hour <= 5) {
      baseDensity = 15;
    }

    return baseDensity + (Math.random() * 10 - 5); // Add variance
  },
  
  getLabel(density) {
    if (density > 80) return { text: 'Critical / Overcrowded', class: 'danger' };
    if (density > 50) return { text: 'High Density', class: 'warning' };
    if (density > 30) return { text: 'Moderate', class: 'success' };
    return { text: 'Optimal / Low Density', class: 'safe' };
  }
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
