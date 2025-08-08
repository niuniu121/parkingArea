<template>
  <div class="map-container">
    <div id="map"></div>
    <button class="locate-btn" @click="locateUser">
       Locate Me
    </button>
  </div>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default {
  name: "MapPage",
  data() {
    return {
      map: null,
      markers: [],
    };
  },
  mounted() {
    this.initMap();
    this.loadMarkers();
  },
  methods: {
    initMap() {
      this.map = L.map("map").setView([-37.8136, 144.9631], 13); // Melbourne

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      }).addTo(this.map);
    },
    loadMarkers() {
      // Sample data from the backend
      const parkingSpots = [
        {
          id: 1,
          name: "Parking Lot A",
          lat: -37.8106,
          lng: 144.9641,
          spots: 12,
          price: "$5/hour",
        },
        {
          id: 2,
          name: "Parking Lot B",
          lat: -37.8152,
          lng: 144.9703,
          spots: 4,
          price: "$3/hour",
        },
      ];

      parkingSpots.forEach((spot) => {
        const marker = L.marker([spot.lat, spot.lng]).addTo(this.map);
        marker.bindPopup(`
          <div>
            <h4>${spot.name}</h4>
            <p>🅿️ Available Spots: ${spot.spots}</p>
            <p>💰 Rate: ${spot.price}</p>
          </div>
        `);
        this.markers.push(marker);
      });
    },
    locateUser() {
      this.map.locate({ setView: true, maxZoom: 16 });

      this.map.on("locationfound", (e) => {
        const radius = e.accuracy;
        L.marker(e.latlng)
          .addTo(this.map)
          .bindPopup(`📍 You are here (Accuracy: ${Math.round(radius)} meters)`)
          .openPopup();
        L.circle(e.latlng, radius).addTo(this.map);
      });

      this.map.on("locationerror", () => {
        alert("Location access denied or unavailable.");
      });
    },
  },
};
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 60px); /* Adjust for navbar height */
  background: linear-gradient(to right, #00b4d8, #007bff);
}

#map {
  height: 100%;
  width: 100%;
  z-index: 1;
}

.locate-btn {
  position: absolute;
  top: 80px;
  right: 20px;
  background: #ffffff;
  color: #007bff;
  border: 2px solid #007bff;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
  z-index: 1000;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.locate-btn::before {
  content: "📍";
  font-size: 16px;
}

.locate-btn:hover {
  background-color: #007bff;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.3);
}

</style>
