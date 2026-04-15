/**
 * UrbanGuard Live — Real-Time Intelligence Controller
 * 
 * CORE FEATURES:
 * - Full Dynamic Routing (Directions API)
 * - Multi-Modal Ranking (Safest, Greenest, Easiest)
 * - Nearby Journey Support (Places API Integration)
 * - Browser GPS (Geolocation API)
 * - Predictive Signal Analysis (Simulated)
 */

let state = {
  map: null,
  placesService: null,
  directionsService: null,
  directionsRenderer: null,
  autocompleteOrigin: null,
  autocompleteDestination: null,
  activeRoutes: [],
  supportMarkers: [],
  heatmap: null,
  totalEcoSavings: 0,
  userLocation: null,
  densityUpdateInterval: null,
  backendOnline: false,
  apiBase: 'http://localhost:3000/api/v1'
};

// ============================================================
// INITIALIZATION
// ============================================================
window.initApp = async () => {
  console.log("UrbanGuard: Initializing Data-Driven Spatial Engine...");
  
  // 1. Initialize Google Maps (Modern Bootstrap Pattern Interface)
  const { Map } = await google.maps.importLibrary("maps");
  const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes");
  const { PlacesService, Autocomplete } = await google.maps.importLibrary("places");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  state.map = new Map(document.getElementById('google-map'), {
    center: { lat: 12.9716, lng: 77.5946 }, // Bengaluru Default
    zoom: 12,
    mapId: 'URBAN_GUARD_LIVE_CORE', // Required for Advanced Markers
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#07090c' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1d23' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c0f17' }] }
    ]
  });

  state.directionsService = new DirectionsService();
  state.directionsRenderer = new DirectionsRenderer({
    map: state.map,
    suppressMarkers: true, // We will use AdvancedMarkerElement
    polylineOptions: { strokeColor: '#00d4ff', strokeWeight: 6, strokeOpacity: 0.8 }
  });

  state.placesService = new PlacesService(state.map);

  // 2. Setup Autocomplete
  state.autocompleteOrigin = new Autocomplete(document.getElementById('origin-input'));
  state.autocompleteDestination = new Autocomplete(document.getElementById('destination-input'));
  
  // 3. Backend Connection Health Check
  checkBackendStatus();

  // 4. UI Bindings
  initUIBindings();
  initHeatmap();
  startSignalDensityUpdate();

  // 4. Cleanup
  setTimeout(() => {
    document.getElementById('loading').classList.add('hidden');
  }, 1000);
};

// ============================================================
// UI & EVENTS
// ============================================================
function initUIBindings() {
  document.getElementById('btn-gps').addEventListener('click', handleGPS);
  document.getElementById('btn-calculate').addEventListener('click', analyzeOptimalMovement);
  
  // Support toggles
  document.getElementById('toggle-hospitals').addEventListener('change', updateSupportOverlays);
  document.getElementById('toggle-hotels').addEventListener('change', updateSupportOverlays);
  document.getElementById('toggle-heatmap').addEventListener('change', toggleHeatmap);
}

/**
 * Innovation: Heatmap Layer (Urban Pulse)
 * Now connects to the live backend telemetry.
 */
async function initHeatmap() {
  const { Visualization } = await google.maps.importLibrary("visualization");
  
  let points = URBAN_PULSE_POINTS; // Local Fallback

  try {
    const response = await fetch(`${state.apiBase}/pulse`);
    const result = await response.json();
    if (result.status === 'success') {
      points = result.data;
      console.log("UrbanGuard: Live Telemetry Engaged.");
    }
  } catch (e) {
    console.warn("UrbanGuard: Backend unreachable. Using fallback pulse data.");
  }

  const heatmapData = points.map(p => ({
    location: new google.maps.LatLng(p.lat, p.lng),
    weight: p.weight || p.base_weight
  }));

  state.heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatmapData,
    map: null, 
    radius: 40,
    opacity: 0.6
  });
}

function toggleHeatmap() {
  const isChecked = document.getElementById('toggle-heatmap').checked;
  state.heatmap.setMap(isChecked ? state.map : null);
}

/**
 * Browser Geolocation API
 */
function handleGPS() {
  const statusEl = document.getElementById('gps-status');
  statusEl.textContent = 'LOCATING...';
  statusEl.classList.add('pulse');

  if (!navigator.geolocation) {
    alert("GPS Error: Browser does not support geolocation.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      state.userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: state.userLocation }, (results, status) => {
        if (status === 'OK' && results[0]) {
          document.getElementById('origin-input').value = results[0].formatted_address;
          statusEl.textContent = 'LOCKED';
          statusEl.classList.remove('pulse');
          state.map.setCenter(state.userLocation);
          state.map.setZoom(15);
        }
      });
    },
    () => {
      statusEl.textContent = 'FAILED';
      alert("GPS Error: Permission denied or signal lost.");
    }
  );
}

// ============================================================
// CORE ALGORITHM: ANALYZE OPTIMAL MOVEMENT
// ============================================================
async function analyzeOptimalMovement() {
  const origin = document.getElementById('origin-input').value;
  const destination = document.getElementById('destination-input').value;
  const arrivalTime = document.getElementById('arrival-time-input').value;

  if (!origin || !destination) {
    alert("Please enter both origin and destination.");
    return;
  }

  const modes = ['DRIVING', 'TRANSIT', 'BICYCLING', 'WALKING'];
  const resultsContainer = document.getElementById('results-container');
  resultsContainer.innerHTML = '<div class="empty-state">⚡ Calculating Telemetry...</div>';

  try {
    const routePromises = modes.map(mode => fetchRoute(origin, destination, mode));
    const rawRoutes = await Promise.all(routePromises);
    const validRoutes = rawRoutes.filter(r => r.status === 'OK');

    if (validRoutes.length === 0) throw new Error("No routes found.");

    // Process & Rank Routes
    const analyzedRoutes = analyzeRouteData(validRoutes);
    renderResults(analyzedRoutes);
    
    // Update Eco Impact Ledger (comparing vs average car emissions for shortest path)
    updateEcoLedger(analyzedRoutes);
    // Auto-select Safest for initial map display
    displayOnMap(analyzedRoutes.find(r => r.category === 'safest'));
    
    // Suggest Best Departure Time if arrivalTime is set
    if (arrivalTime) calculateBestDepartureTime(origin, destination, arrivalTime);

  } catch (err) {
    resultsContainer.innerHTML = `<div class="empty-state">❌ Error: ${err.message}</div>`;
  }
}

function fetchRoute(origin, destination, mode) {
  return new Promise((resolve) => {
    state.directionsService.route({
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode[mode],
      provideRouteAlternatives: false
    }, (result, status) => resolve({ mode, result, status }));
  });
}

/**
 * The Non-AI Decision Engine
 * Categorizes routes into Safest, Greenest, and Easiest
 */
function analyzeRouteData(routes) {
  const signalDensity = SIGNAL_INTENSITY.calculateDensity();
  
  return routes.map(r => {
    const leg = r.result.routes[0].legs[0];
    const distanceKm = leg.distance.value / 1000;
    const durationMin = leg.duration.value / 60;
    const modeMeta = MODAL_DATA[r.mode];

    // Calculate Scores
    const co2 = Math.round(distanceKm * modeMeta.co2PerKm);
    const speedKmh = Math.round(distanceKm / (durationMin / 60));
    
    // Safety Logic: Mode Base + Signal Penalty + static zone check (mock)
    let safetyScore = modeMeta.safetyBase - (signalDensity > 70 ? 15 : 0);
    if (r.mode === 'DRIVING' && speedKmh > 60) safetyScore -= 10;

    return {
      mode: r.mode,
      modeIcon: modeMeta.icon,
      distance: leg.distance.text,
      duration: leg.duration.text,
      durationVal: leg.duration.value,
      speed: speedKmh + ' km/h',
      co2: co2 + 'g CO₂',
      safety: Math.max(10, Math.min(98, safetyScore)),
      result: r.result
    };
  }).map((r, _, all) => {
    // Categorization
    if (r.mode === 'WALKING' || r.mode === 'BICYCLING') r.category = 'greenest';
    else if (r.mode === 'TRANSIT') r.category = 'safest';
    else r.category = 'easiest';

    return r;
  }).sort((a,b) => b.safety - a.safety); 
}

// ============================================================
// JOURNEY SUPPORT: MEDICAL & HOTELS
// ============================================================
async function updateSupportOverlays() {
  const showHospitals = document.getElementById('toggle-hospitals').checked;
  const showHotels = document.getElementById('toggle-hotels').checked;

  // Clear existing
  state.supportMarkers.forEach(m => m.setMap(null));
  state.supportMarkers = [];

  if (!state.activeRoutes.length) return;

  const currentRoute = state.activeRoutes[0];
  const midPoint = currentRoute.result.routes[0].legs[0].steps[Math.floor(currentRoute.result.routes[0].legs[0].steps.length / 2)].end_location;

  if (showHospitals) await fetchSupportPlaces(midPoint, 'hospital', '🏥');
  if (showHotels) await fetchSupportPlaces(midPoint, 'hotel', '🏨');
}

function fetchSupportPlaces(location, type, icon) {
  return new Promise((resolve) => {
    state.placesService.nearbySearch({
      location: location,
      radius: 3000,
      type: type
    }, (results, status) => {
      if (status === 'OK' && results) {
        results.slice(0, 5).forEach(place => createSupportMarker(place, icon));
      }
      resolve();
    });
  });
}

async function createSupportMarker(place, iconEmoji) {
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
  
  const pin = new PinElement({ glyph: iconEmoji, background: '#1a1d23', borderColor: '#00d4ff' });
  const marker = new AdvancedMarkerElement({
    map: state.map,
    position: place.geometry.location,
    content: pin.element,
    title: place.name
  });
  
  state.supportMarkers.push(marker);
}

// ============================================================
// RENDERERS & MAP UPDATES
// ============================================================
function renderResults(routes) {
  const container = document.getElementById('results-container');
  container.innerHTML = '';
  state.activeRoutes = routes;

  routes.forEach(r => {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
      <div class="card-header">
        <span class="category-badge ${r.category}">${r.category}</span>
        <span class="mode-icon">${r.modeIcon}</span>
      </div>
      <div class="card-main">${r.duration}</div>
      <div class="card-sub">via ${r.result.routes[0].summary || 'local routes'} (${r.distance})</div>
      <div class="metric-grid">
        <div class="metric">Safety: <strong style="color:${getSafetyColor(r.safety)}">${r.safety}%</strong></div>
        <div class="metric">Eco: <strong>${r.co2}</strong></div>
        <div class="metric">Avg Speed: <strong>${r.speed}</strong></div>
        <div class="metric">Mode: <strong>${r.mode}</strong></div>
      </div>
    `;
    card.onclick = () => displayOnMap(r);
    container.appendChild(card);
  });
}

function displayOnMap(routeMeta) {
  state.directionsRenderer.setDirections(routeMeta.result);
  
  // Clear support and re-check checkboxes
  updateSupportOverlays();
}

function getSafetyColor(score) {
  if (score > 80) return '#00e676';
  if (score > 50) return '#ffab00';
  return '#ff5252';
}

/**
 * Innovation: Eco Ledger Math
 */
function updateEcoLedger(routes) {
  // Find shortest route (Easiest usually) as baseline
  const baseline = routes.find(r => r.category === 'easiest') || routes[0];
  const safest = routes.find(r => r.category === 'safest');
  const greenest = routes.find(r => r.category === 'greenest');

  const currentSavings = Math.max(0, parseInt(baseline.co2) - parseInt(greenest?.co2 || 0));
  state.totalEcoSavings += currentSavings;
  
  // Persist to backend
  if (state.backendOnline) {
    fetch(`${state.apiBase}/eco-audit/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ co2Saved: currentSavings, sessionId: 'User_Primary' })
    }).then(res => res.json())
      .then(data => console.log("Eco-Audit Persisted. Global Total:", data.global_total));
  }

  document.getElementById('eco-ledger').textContent = `${state.totalEcoSavings}g saved`;
  document.getElementById('eco-ledger').classList.add('pulse');
  setTimeout(() => document.getElementById('eco-ledger').classList.remove('pulse'), 1000);
}

async function checkBackendStatus() {
  try {
    const res = await fetch(`${state.apiBase}/status`);
    const data = await res.json();
    state.backendOnline = (data.status === 'ONLINE');
    if (state.backendOnline) {
      document.querySelector('.pulse-box .value').textContent = 'REAL-TIME';
    }
  } catch (err) {
    state.backendOnline = false;
  }
}

/**
 * Best Travel Time Logic
 */
function calculateBestDepartureTime(origin, destination, arrivalTime) {
  const alertEl = document.getElementById('best-time-alert');
  const msgEl = document.getElementById('best-time-msg');
  
  alertEl.classList.remove('hidden');
  
  // Simulation of Distance Matrix comparison
  // In a production app, we would call DistanceMatrixService with departureTime set to 30/60/90 mins prior
  const travelTimeMin = 45; // Mock lead time
  msgEl.innerHTML = `To arrive by <strong>${arrivalTime}</strong>, we recommend departing at <strong>${subtractMinutes(arrivalTime, travelTimeMin + 15)}</strong> to avoid the upcoming signal density peak.`;
}

function subtractMinutes(timeStr, mins) {
  const [h, m] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(h);
  date.setMinutes(m - mins);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ============================================================
// SIMULATION: RADIO-WAVE DENSITY
// ============================================================
function startSignalDensityUpdate() {
  const update = () => {
    const density = SIGNAL_INTENSITY.calculateDensity();
    const meta = SIGNAL_INTENSITY.getLabel(density);
    const fill = document.getElementById('density-fill');
    
    fill.style.width = density + '%';
    fill.style.background = getLabelColor(meta.class);
    document.getElementById('density-value').textContent = meta.text;
  };
  
  update();
  state.densityUpdateInterval = setInterval(update, 5000);
}

function getLabelColor(type) {
  const colors = { safe: '#00e676', warning: '#ffab00', danger: '#ff5252', success: '#00d4ff' };
  return colors[type] || '#00d4ff';
}
