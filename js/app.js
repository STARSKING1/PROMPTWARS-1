const API_BASE = 'http://localhost:3000/api/v1';

async function initUrbanGuard() {
  // 1. Fetch API Key from your secure Backend
  const response = await fetch(`${API_BASE}/config/map-key`);
  const { key } = await response.json();

  // 2. Load Google Maps Dynamically
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=visualization,places&callback=initMap`;
  document.head.appendChild(script);
}

window.initMap = () => {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 12.9716, lng: 77.5946 }, // Bengaluru
    zoom: 13,
    styles: darkModeStyles // High-contrast industrial map style
  });

  // 3. Sync Urban Pulse Heatmap from SQLite
  fetch(`${API_BASE}/pulse`)
    .then(res => res.json())
    .then(result => {
      const heatmapData = result.data.map(p => ({
        location: new google.maps.LatLng(p.lat, p.lng),
        weight: p.base_weight
      }));
      const heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: map
      });
    });
};

initUrbanGuard();