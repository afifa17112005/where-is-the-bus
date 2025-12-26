const params = new URLSearchParams(window.location.search);
const from = params.get("from");
const to = params.get("to");

const routesDiv = document.getElementById("routes");

firebase.database().ref("routes").once("value", snapshot => {
  const routes = snapshot.val();
  routesDiv.innerHTML = "";

  let found = false;

  Object.keys(routes).forEach(routeId => {
    const route = routes[routeId];
    const stops = route.stops;

    const fromIndex = stops.indexOf(from);
    const toIndex = stops.indexOf(to);

    // BOTH must exist AND order must be correct
    if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
      found = true;

      routesDiv.innerHTML += `
        <div class="route-card">
          <h3>${route.name}</h3>
          <p><b>Stops:</b><br>${stops.join(" → ")}</p>
          <button onclick="openMap('${routeId}')">
            Track Live
          </button>
        </div>
      `;
    }
  });

  if (!found) {
    routesDiv.innerHTML = `
      <div class="route-card">
        <h3>No routes found</h3>
        <p>Please try a different source and destination.</p>
      </div>
    `;
  }
});

function openMap(routeId) {
  window.location.href = `map.html?route=${routeId}`;
}
