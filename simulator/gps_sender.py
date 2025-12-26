import time
import random
from datetime import datetime

import firebase_admin
from firebase_admin import credentials, db

# ---------------- FIREBASE INIT ----------------
cred = credentials.Certificate("serviceAccountKey.json")

firebase_admin.initialize_app(cred, {
    "databaseURL": "https://where-is-my-bus-cc802-default-rtdb.firebaseio.com"
})

# ---------------- ROUTE PATHS (SIMULATED) ----------------
ROUTES = {
    "Tambaram-Adyar": [
        (12.9249, 80.1000),
        (12.9700, 80.1400),
        (13.0067, 80.2206),
        (13.0236, 80.2280),
        (13.0418, 80.2341)
    ],
    "CMBT-OMR": [
        (13.0690, 80.2050),
        (13.0820, 80.2550),
        (13.0600, 80.2400),
        (13.0200, 80.2300)
    ],
    "Velachery-TNagar": [
        (12.9750, 80.2200),
        (12.9900, 80.2100),
        (13.0100, 80.2150)
    ],
    "Tambaram-Central": [
        (12.9300, 80.1200),
        (12.9900, 80.1800),
        (13.0500, 80.2300),
        (13.0800, 80.2700)
    ]
}

# ---------------- BUSES ----------------
buses = {
    "BUS101": {"route": "Tambaram-Adyar", "index": 0},
    "BUS102": {"route": "Tambaram-Adyar", "index": 2},
    "BUS103": {"route": "Tambaram-Adyar", "index": 4},

    "BUS201": {"route": "CMBT-OMR", "index": 0},
    "BUS202": {"route": "CMBT-OMR", "index": 2},

    "BUS301": {"route": "Velachery-TNagar", "index": 0},

    "BUS401": {"route": "Tambaram-Central", "index": 1}
}

print("🚌 GPS Simulation Started for Where Is My Bus...")

# ---------------- MAIN LOOP ----------------
while True:
    for bus_id, bus in buses.items():
        route_name = bus["route"]
        path = ROUTES[route_name]

        # Move bus forward on route
        bus["index"] = (bus["index"] + 1) % len(path)
        lat, lng = path[bus["index"]]

        data = {
            "route": route_name,
            "lat": round(lat + random.uniform(-0.0003, 0.0003), 6),
            "lng": round(lng + random.uniform(-0.0003, 0.0003), 6),
            "speed": random.randint(25, 45),
            "availableSeats": random.randint(0, 40),
            "nextBusTime": f"{random.randint(5, 30)} mins",
            "lastUpdated": datetime.now().strftime("%H:%M:%S")
        }

        db.reference(f"buses/{bus_id}").update(data)
        print(f"{bus_id} → {route_name} updated")

    time.sleep(5)  # updates every 5 seconds
