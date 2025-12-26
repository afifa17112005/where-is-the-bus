import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

let map;
let markers = {};

// Chennai stop coordinates
const stopCoordinates = {
  "Tambaram": { lat: 12.9249, lng: 80.1000 },
  "Guindy": { lat: 13.0067, lng: 80.2206 },
  "T Nagar": { lat: 13.0418, lng: 80.2341 },
  "Saidapet": { lat: 13.0236, lng: 80.2280 },
  "Adyar": { lat: 13.0064, lng: 80.2575 }
};

window.trackBus = function () {
  const from = document.getElementById("fromStop").value;
  const to = document.getElementById("toStop").value;

  if (!from || !to) {
    alert("Please select both stops");
    return;
  }

  document.getElementById("dashboard").classList.remove("hidden");

  const routePath = [
    stopCoordinates[from],
    stopCoordinates[to]
  ];

  if (!map) {
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 12,
      center: routePath[0]
    });

    new google.maps.Polyline({
      path: routePath,
      strokeColor: "#0a4b8e",
      strokeOpacity: 1,
      strokeWeight: 4,
      map
    });
  }

  const busesRef = ref(db, "buses");

  onValue(busesRef, (snapshot) => {
    const buses = snapshot.val();
    if (!buses) return;

    Object.keys(buses).forEach(busId => {
      const bus = buses[busId];

      // Show only buses on selected route
      if (bus.route !== "Tambaram-Adyar") return;

      if (!markers[busId]) {
        markers[busId] = new google.maps.Marker({
          position: { lat: bus.lat, lng: bus.lng },
          map,
          title: busId,
          icon: "https://maps.google.com/mapfiles/kml/shapes/bus.png"
        });
      } else {
        markers[busId].setPosition({ lat: bus.lat, lng: bus.lng });
      }
    });
  });
};
