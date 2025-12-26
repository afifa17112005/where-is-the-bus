/*************************************************
 * MAP INITIALIZATION
 *************************************************/
const params = new URLSearchParams(window.location.search);
const selectedRoute = params.get("route"); // e.g. Tambaram-Adyar

// Default Chennai center
const map = L.map("map", {
  zoomControl: true
}).setView([13.0827, 80.2707], 13);

// Dark-style OpenStreetMap tiles (looks intimidating)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

/*************************************************
 * BUS ICON (BIGGER, NAVIGATOR STYLE)
 *************************************************/
const busIcon = L.icon({
  iconUrl: "bus.png",     // tiny yellow bus image
  iconSize: [48, 48],     // 👈 change size here if needed
  iconAnchor: [24, 24],
  popupAnchor: [0, -20]
});

/*************************************************
 * STORAGE FOR BUS MARKERS
 *************************************************/
const busMarkers = {};

/*************************************************
 * FIREBASE LISTENER (LIVE UPDATES)
 *************************************************/
firebase.database().ref("buses").on("value", snapshot => {
  const buses = snapshot.val();
  if (!buses) return;

  let infoHTML = "";

  Object.keys(buses).forEach(busId => {
    const bus = buses[busId];

    // Show only buses of selected route (if route page was used)
    if (selectedRoute && bus.route !== selectedRoute) return;

    const latLng = [bus.lat, bus.lng];

    // Build info panel text
    infoHTML += `
      <div style="margin-bottom:8px;">
        <b>🚌 ${busId}</b><br>
        Route: ${bus.route}<br>
        Speed: ${bus.speed} km/h<br>
        Seats: ${bus.availableSeats}<br>
        Next Bus: ${bus.nextBusTime}<br>
        Updated: ${bus.lastUpdated}
      </div>
      <hr style="border:0.5px solid #333;">
    `;

    // Create marker if not exists
    if (!busMarkers[busId]) {
      busMarkers[busId] = L.marker(latLng, {
        icon: busIcon,
        riseOnHover: true
      })
        .addTo(map)
        .bindPopup(`
          <b>Bus:</b> ${busId}<br>
          <b>Route:</b> ${bus.route}<br>
          <b>Speed:</b> ${bus.speed} km/h<br>
          <b>Seats:</b> ${bus.availableSeats}<br>
          <b>Next Bus:</b> ${bus.nextBusTime}<br>
          <b>Updated:</b> ${bus.lastUpdated}
        `);
    } else {
      // Smooth movement
      busMarkers[busId].setLatLng(latLng);
      busMarkers[busId].setPopupContent(`
        <b>Bus:</b> ${busId}<br>
        <b>Route:</b> ${bus.route}<br>
        <b>Speed:</b> ${bus.speed} km/h<br>
        <b>Seats:</b> ${bus.availableSeats}<br>
        <b>Next Bus:</b> ${bus.nextBusTime}<br>
        <b>Updated:</b> ${bus.lastUpdated}
      `);
    }
  });

  // Update floating info panel
  const panel = document.getElementById("busInfo");
  if (panel) {
    panel.innerHTML = infoHTML || "No buses on this route currently.";
  }
});

/*************************************************
 * OPTIONAL: USER LOCATION (BLUE DOT)
 *************************************************/
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    pos => {
      const userLatLng = [pos.coords.latitude, pos.coords.longitude];

      L.circleMarker(userLatLng, {
        radius: 8,
        color: "#00aaff",
        fillColor: "#00aaff",
        fillOpacity: 1
      })
        .addTo(map)
        .bindPopup("📍 You are here");

      map.setView(userLatLng, 13);
    },
    () => {
      console.log("User location permission denied");
    }
  );
}
