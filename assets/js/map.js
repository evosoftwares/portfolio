/**
 * Interactive Map Implementation
 */
function initializeMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  // Locations data with correct coordinates and addresses
  const locations = [
    {
      name: 'Charlottetown, Prince Edward Island, Canadá',
      coordinates: [46.234400, -63.127800],
      address: '176 Great George Street, Charlottetown, PE C1A 4K7',
      title: '🇨🇦 Hub Tecnológico do Atlântico',
      description: 'Centro de inovação em tecnologia marinha e agricultura sustentável.',
      interests: ['Tecnologia Marinha', 'IoT Sustentável', 'Agricultura 4.0']
    },
    {
      name: 'Cuiabá, Mato Grosso, Brasil',
      coordinates: [-15.585800, -56.099900],
      address: 'R. Tiradentes, 220, Bairro - Pico do Amor, Cuiabá - MT, 78065-075',
      title: '🇧🇷 Portal do Agronegócio Digital',
      description: 'Epicentro da revolução AgTech brasileira com sistemas de precisão.',
      interests: ['AgTech', 'Blockchain Rural', 'Drones Agrícolas']
    },
    {
      name: 'São Bernardo do Campo, São Paulo, Brasil',
      coordinates: [-23.687800, -46.564800],
      address: 'Rua Jose Versolato, 111, sala 121, São Bernardo do Campo - SP',
      title: '🇧🇷 Vale do Silício Brasileiro',
      description: 'Centro de excelência em desenvolvimento de software corporativo.',
      interests: ['Indústria 4.0', 'FinTech', 'Inteligência Artificial']
    }
  ];

  // Initialize map
  const map = L.map('map', {
    center: [15, -50],
    zoom: 3,
    zoomControl: true,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    dragging: true
  });

  // Add dark minimalist tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  // Add markers
  const markers = [];
  locations.forEach((location, index) => {
    // Create custom marker
    const marker = L.marker(location.coordinates, {
      icon: L.divIcon({
        html: `
          <div class="map-marker" style="
            background: linear-gradient(135deg, #106eea 0%, #0d5bc7 100%);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 20px rgba(16, 110, 234, 0.4);
            cursor: pointer;
            position: relative;
          ">
            <img src="assets/img/logo-evo.png" alt="Evo Logo" style="
              width: 22px; 
              height: 22px; 
              object-fit: contain;
              background: white;
              border-radius: 2px;
              padding: 1px;
            " />
          </div>
        `,
        className: 'custom-map-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      })
    }).addTo(map);

    // Create popup
    const interestsBadges = location.interests.map(interest => 
      `<span style="
        background: rgba(16, 110, 234, 0.1);
        color: #106eea;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 500;
        margin: 2px;
        display: inline-block;
        border: 1px solid rgba(16, 110, 234, 0.2);
      ">${interest}</span>`
    ).join('');

    marker.bindPopup(`
      <div style="font-family: 'Roboto', Arial, sans-serif; min-width: 280px; max-width: 320px;">
        <div style="
          background: linear-gradient(135deg, rgba(16, 110, 234, 0.1), rgba(16, 110, 234, 0.05));
          padding: 15px;
          margin: -10px -15px 15px -15px;
          border-radius: 8px 8px 0 0;
        ">
          <h5 style="margin: 0 0 8px 0; color: #106eea; font-weight: bold; font-size: 16px;">
            ${location.title}
          </h5>
          <p style="margin: 0 0 5px 0; font-size: 11px; color: #666;">${location.name}</p>
          <p style="margin: 0; font-size: 10px; color: #888;">📍 ${location.address}</p>
        </div>
        
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #444; line-height: 1.4;">
          ${location.description}
        </p>
        
        <div style="margin-top: 10px;">
          <div style="font-size: 11px; color: #888; margin-bottom: 6px; font-weight: 500;">
            ÁREAS DE INTERESSE:
          </div>
          <div>${interestsBadges}</div>
        </div>
      </div>
    `);

    markers.push(marker);
  });

  // Fit bounds to show all markers
  setTimeout(() => {
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.2));
  }, 500);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeMap);