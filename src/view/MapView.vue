<template>
  <div class="map-wrapper">
    <!-- 搜索 -->
    <div class="search-bar glass">
      <i class="fas fa-search search-icon"></i>
      <input
        v-model="query"
        placeholder="Search by street, area..."
        @keydown.enter="searchParking"
      />
      <button class="btn-primary" @click="searchParking">
        <i class="fas fa-location-arrow"></i>
        Search
      </button>
    </div>

    <div class="map-and-list">
      <!-- 地图 -->
      <div class="map-card glass">
        <div id="map" class="map-container"></div>
      </div>

      <!-- 列表 -->
      <aside class="parking-list glass" ref="listEl">
        <div class="list-header">
          <i class="fas fa-parking"></i>
          <h3>Nearby Parking Spots</h3>
        </div>

        <div v-if="loading" class="loading">
          <span class="dot"></span><span class="dot"></span
          ><span class="dot"></span>
          Loading parking data...
        </div>

        <template v-else-if="filtered.length">
          <article
            v-for="loc in filtered.slice(0, 10)"
            :key="getLocId(loc)"
            class="parking-card"
            :class="{ active: activeId === getLocId(loc) }"
            :data-id="getLocId(loc)"
            @mouseenter="handleHover(loc)"
            @mouseleave="handleHover(null)"
            @click="focusOnMarker(getLocId(loc), true)"
          >
            <header class="card-top">
              <div class="title">
                <i class="fas fa-road"></i>
                <span class="name">{{ loc.street }}</span>
              </div>

              <div class="right-actions">
                <button
                  class="fav-btn"
                  :aria-pressed="isFav(getLocId(loc))"
                  :title="
                    isFav(getLocId(loc)) ? 'Unfavorite' : 'Add to favorites'
                  "
                  @click.stop="toggleFav(loc)"
                >
                  <i
                    :class="[
                      'fas',
                      isFav(getLocId(loc)) ? 'fa-star' : 'fa-star-half-alt',
                    ]"
                  ></i>
                </button>

                <span
                  class="badge"
                  :class="
                    loc.totalBays >= 5
                      ? 'good'
                      : loc.totalBays >= 2
                      ? 'warn'
                      : 'bad'
                  "
                >
                  {{ loc.totalBays }} bays
                </span>
              </div>
            </header>

            <div class="info-grid">
              <div class="info-item">
                <span class="label"
                  ><i class="far fa-id-badge"></i> Bay ID</span
                >
                <span class="value mono">{{ loc.bay_id || "—" }}</span>
              </div>

              <div class="info-item">
                <span class="label"><i class="fas fa-route"></i> Distance</span>
                <span class="value">
                  <template v-if="loc.drivingDistance !== undefined">
                    {{ formatDistance(loc.drivingDistance) }}
                    <span
                      v-if="loc.drivingDuration !== undefined"
                      class="muted"
                    >
                      ({{ formatDuration(loc.drivingDuration) }} by car)
                    </span>
                  </template>
                  <template v-else>—</template>
                </span>
              </div>
            </div>
          </article>
        </template>

        <div v-else class="no-result">
          <i class="far fa-frown"></i> No results found.
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "@/api/http";

const AREAS = [
  {
    name: "cbd",
    bbox: [144.946, -37.818, 144.97, -37.806],
    keywords: ["cbd", "central", "city"],
  },
  {
    name: "docklands",
    bbox: [144.935, -37.825, 144.953, -37.812],
    keywords: ["docklands"],
  },
];

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3,
    toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1),
    dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// storage helpers
const FAV_KEY = "sp_favs";
const HIS_KEY = "sp_history";
const FOCUS_KEY = "sp_focus_id";
const cap = 100;

export default {
  name: "MapView",
  data() {
    return {
      map: null,
      markersMap: new Map(), // Map<id, marker>
      query: "",
      bays: [],
      sensors: [],
      loading: true,
      userLocation: null,
      drivingLoading: false,
      hoveredId: null,
      activeId: null,
      favs: {}, // {id: record}
    };
  },
  computed: {
    filtered() {
      let results = this.bays.map((b) => ({
        ...b,
        bay_id: b.bay_id || b.roadsegmentid || b.kerbsideid || null,
        street: b.street || b.roadsegmentdescription || "Unnamed",
        lat:
          typeof b.lat === "number"
            ? b.lat
            : b.location
            ? Number(b.location.lat)
            : b.latitude,
        lng:
          typeof b.lng === "number"
            ? b.lng
            : b.location
            ? Number(b.location.lon)
            : b.longitude,
        roadsegmentid: b.roadsegmentid,
      }));

      const q = this.query.trim().toLowerCase();
      let bbox = null;
      for (const area of AREAS) {
        if (area.keywords.some((k) => q.includes(k))) {
          bbox = area.bbox;
          break;
        }
      }
      results = results.filter((b) => {
        let matched =
          q === "" ||
          (b.street && b.street.toLowerCase().includes(q)) ||
          (b.roadsegmentdescription &&
            b.roadsegmentdescription.toLowerCase().includes(q)) ||
          (b.postcode && String(b.postcode).includes(q));
        if (bbox && b.lat && b.lng) {
          const [minLon, minLat, maxLon, maxLat] = bbox;
          if (
            b.lng >= minLon &&
            b.lng <= maxLon &&
            b.lat >= minLat &&
            b.lat <= maxLat
          )
            matched = true;
        }
        return matched;
      });

      // group by roadsegment
      const grouped = {};
      results.forEach((b) => {
        const key = b.roadsegmentid || b.street || b.bay_id;
        if (!grouped[key]) {
          grouped[key] = {
            ...b,
            totalBays: 0,
            drivingDistance: undefined,
            drivingDuration: undefined,
          };
        }
        grouped[key].totalBays += 1;
      });

      const userLoc = this.userLocation;
      Object.values(grouped).forEach((loc) => {
        loc.haversineDistance =
          userLoc && typeof loc.lat === "number" && typeof loc.lng === "number"
            ? haversine(userLoc.lat, userLoc.lng, loc.lat, loc.lng)
            : null;
      });

      return Object.values(grouped)
        .sort((a, b) => {
          if (a.drivingDistance != null && b.drivingDistance != null)
            return a.drivingDistance - b.drivingDistance;
          if (a.haversineDistance != null && b.haversineDistance != null)
            return a.haversineDistance - b.haversineDistance;
          return 0;
        })
        .filter((item) => item.street !== "Unnamed");
    },
  },
  async mounted() {
    try {
      this.favs = JSON.parse(localStorage.getItem(FAV_KEY) || "{}");
    } catch {}
    await this.initMap();
    await this.loadData();
    await this.getUserLocationAndCalcDriving();

    const urlFocus = new URLSearchParams(window.location.search).get("focus");
    const localFocus = localStorage.getItem(FOCUS_KEY);
    const focusId = urlFocus || localFocus;
    if (focusId) {
      localStorage.removeItem(FOCUS_KEY);
      this.$nextTick(() => this.focusOnMarker(focusId, true));
    }
  },
  methods: {
    getLocId(loc) {
      return loc.roadsegmentid || loc.bay_id || `${loc.lat},${loc.lng}`;
    },
    createIcon({ active = false, hover = false } = {}) {
      return L.divIcon({
        className:
          "pin " +
          (active ? "pin--active" : hover ? "pin--hover" : "pin--default"),
        html: '<div class="pin__dot"></div><div class="pin__pulse"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -26],
      });
    },
    refreshMarkerIcon(id) {
      const m = this.markersMap.get(id);
      if (!m) return;
      const isActive = this.activeId === id;
      const isHover = this.hoveredId === id && !isActive;
      m.setIcon(this.createIcon({ active: isActive, hover: isHover }));
    },
    refreshAllMarkerIcons() {
      for (const id of this.markersMap.keys()) this.refreshMarkerIcon(id);
    },
    scrollCardIntoView(id) {
      this.$nextTick(() => {
        const el = this.$refs.listEl?.querySelector(
          `[data-id="${CSS.escape(id)}"]`
        );
        if (el?.scrollIntoView)
          el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
    },

    isFav(id) {
      return !!this.favs[id];
    },
    toggleFav(loc) {
      const id = this.getLocId(loc);
      if (this.favs[id]) {
        delete this.favs[id];
      } else {
        this.favs[id] = {
          id,
          street: loc.street,
          bay_id: loc.bay_id || null,
          lat: loc.lat,
          lng: loc.lng,
          totalBays: loc.totalBays,
          savedAt: Date.now(),
        };
      }
      localStorage.setItem(FAV_KEY, JSON.stringify(this.favs));
    },
    appendHistory(loc) {
      const id = this.getLocId(loc);
      const record = {
        id,
        street: loc.street,
        bay_id: loc.bay_id || null,
        lat: loc.lat,
        lng: loc.lng,
        totalBays: loc.totalBays,
        ts: Date.now(),
      };
      let list = [];
      try {
        list = JSON.parse(localStorage.getItem(HIS_KEY) || "[]");
      } catch {}
      list = list.filter((x) => x.id !== id);
      list.unshift(record);
      if (list.length > cap) list.length = cap;
      localStorage.setItem(HIS_KEY, JSON.stringify(list));
    },

    async initMap() {
      this.map = L.map("map", { zoomControl: true }).setView(
        [-37.8136, 144.9631],
        14
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(this.map);
    },
    async loadData() {
      try {
        const [baysRes, sensorsRes] = await Promise.all([
          api.get("/api/parking/bays"),
          api.get("/api/parking/sensors"),
        ]);
        this.bays = Array.isArray(baysRes.data) ? baysRes.data : [];
        this.sensors = Array.isArray(sensorsRes.data) ? sensorsRes.data : [];
        this.plotMarkers();
        this.loading = false;
      } catch (e) {
        console.error(e);
        alert("Failed to load parking data");
      }
    },
    async searchParking() {
      await this.calcDrivingDistance();
      this.plotMarkers();
    },
    async getUserLocationAndCalcDriving() {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        this.userLocation = { lat: latitude, lng: longitude };
        this.map.setView([latitude, longitude], 15);
        L.marker([latitude, longitude])
          .addTo(this.map)
          .bindPopup("You are here")
          .openPopup();
        await this.calcDrivingDistance();
        this.plotMarkers();
      });
    },
    async calcDrivingDistance() {
      if (!this.userLocation) return;
      this.drivingLoading = true;
      const token =
        "pk.eyJ1IjoibWVuZ3h1ZW5pdSIsImEiOiJjbTI2N2p4Z2kwY2owMmtwem5qdXY4dzlnIn0.WLTu3KsioFvPoUUaKdfE-Q";
      const { lat, lng } = this.userLocation;
      const locs = this.filtered.slice(0, 10);
      await Promise.all(
        locs.map(async (loc) => {
          if (!loc.lat || !loc.lng) return;
          try {
            const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${lng},${lat};${loc.lng},${loc.lat}?access_token=${token}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.routes?.length) {
              loc.drivingDistance = data.routes[0].distance;
              loc.drivingDuration = data.routes[0].duration;
            } else {
              loc.drivingDistance = loc.haversineDistance;
              loc.drivingDuration = undefined;
            }
          } catch {
            loc.drivingDistance = loc.haversineDistance;
            loc.drivingDuration = undefined;
          }
        })
      );
      this.drivingLoading = false;
      this.$forceUpdate();
    },

    plotMarkers() {
      this.markersMap.forEach((m) => this.map.removeLayer(m));
      this.markersMap.clear();

      const top = this.filtered.slice(0, 10);
      top.forEach((loc) => {
        if (!loc.lat || !loc.lng) return;
        const id = this.getLocId(loc);
        const popupHtml = `
          <div style="display:flex;align-items:flex-start;gap:10px">
            <div style="
              width:34px;height:34px;border-radius:10px;
              background:#2b6eea;display:flex;align-items:center;justify-content:center;color:#fff;
              font-weight:800;box-shadow:0 6px 16px rgba(43,110,234,.35);
              ">
              P
            </div>
            <div>
              <b>${loc.street}</b><br/>
              Bay ID: ${loc.bay_id || "—"}<br/>
              Total Bays: ${loc.totalBays}
            </div>
          </div>
        `;
        const m = L.marker([loc.lat, loc.lng], { icon: this.createIcon() })
          .addTo(this.map)
          .bindPopup(popupHtml)
          .on("click", () => {
            this.activeId = id;
            this.refreshAllMarkerIcons();
            this.scrollCardIntoView(id);
            this.appendHistory(loc);
          });
        this.markersMap.set(id, m);
      });

      if (top.length && top[0].lat && top[0].lng) {
        const { lat, lng } = top[0];
        this.map.setView([lat, lng], 15);
      }
      this.refreshAllMarkerIcons();
    },

    handleHover(loc) {
      this.hoveredId = loc ? this.getLocId(loc) : null;
      this.refreshAllMarkerIcons();
    },

    focusOnMarker(id, fly = true) {
      const m = this.markersMap.get(id);
      if (!m) return;
      this.activeId = id;
      this.refreshAllMarkerIcons();
      if (fly) this.map.setView(m.getLatLng(), 17, { animate: true });
      m.openPopup();

      const loc = this.filtered.find((x) => this.getLocId(x) === id);
      if (loc) this.appendHistory(loc);
    },

    formatDistance(d) {
      if (!d) return "—";
      return d < 1000 ? `${Math.round(d)}m` : `${(d / 1000).toFixed(1)}km`;
    },
    formatDuration(s) {
      if (!s || isNaN(s)) return "—";
      return `${Math.round(s / 60)} min`;
    },
  },
  watch: {
    filtered: {
      async handler() {
        await this.calcDrivingDistance();
        this.plotMarkers();
      },
      immediate: false,
    },
  },
};
</script>

<style scoped>
:root {
  --bg1: #00c6ff;
  --bg2: #0072ff;
  --card: #ffffff;
  --ink: #243757;
  --muted: #6b7a90;
  --blue: #1976d2;
  --blue-600: #1d4ed8;
  --shadow: 0 14px 34px rgba(0, 50, 150, 0.15);
  --glass: rgba(255, 255, 255, 0.14);
  --glass-border: rgba(255, 255, 255, 0.28);
}

.map-wrapper {
  min-height: 100vh;
  background: linear-gradient(145deg, var(--bg2), var(--bg1));
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px 48px;
}

.glass {
  background: var(--glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  box-shadow: var(--shadow);
}

.search-bar {
  display: flex;
  gap: 12px;
  width: min(1200px, 96vw);
  align-items: center;
  padding: 12px 14px;
  margin: 10px auto 18px;
  margin-top: 43px;
}
.search-icon {
  color: #fff;
  margin-left: 6px;
}
.search-bar input {
  flex: 1;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #e5efff;
  background: #fff;
  font-size: 1rem;
  outline: none;
}
.btn-primary {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  background: #2b6eea;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.08s ease, box-shadow 0.2s ease, background 0.2s;
}
.btn-primary:hover {
  background: #275ed0;
  box-shadow: 0 10px 22px rgba(0, 60, 200, 0.25);
}
.btn-primary:active {
  transform: translateY(1px);
}

.map-and-list {
  display: grid;
  grid-template-columns: 1.3fr 0.9fr;
  gap: 24px;
  width: min(1700px, 96vw);
}

.map-card {
  padding: 12px;
}
.map-container {
  width: 100%;
  height: 70vh;
  min-height: 580px;
  border-radius: 16px;
  overflow: hidden;
}

.parking-list {
  padding: 22px 18px;
  color: var(--ink);
  max-height: 75vh;
  overflow-y: auto;
}
.list-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 2px 4px 16px;
  color: #fff;
}
.list-header i {
  font-size: 18px;
}
.list-header h3 {
  margin: 0;
  font-size: 1.25rem;
  letter-spacing: 0.3px;
}

.parking-card {
  background: #ffffff;
  border: 1px solid #eef3ff;
  border-radius: 16px;
  padding: 14px 14px 12px;
  margin: 12px 4px;
  box-shadow: 0 6px 18px rgba(0, 56, 140, 0.08);
  transition: transform 0.08s ease, box-shadow 0.2s ease, border-color 0.2s;
}
.parking-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(0, 56, 140, 0.16);
}
.parking-card.active {
  border-color: #2b6eea;
  box-shadow: 0 16px 30px rgba(0, 70, 200, 0.2);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: var(--ink);
}
.title i {
  color: var(--blue-600);
}
.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.2px;
  border: 1px solid #e6eefc;
}
.badge.good {
  background: #eaf7ff;
  color: #0b74ff;
}
.badge.warn {
  background: #fff7e6;
  color: #b7791f;
}
.badge.bad {
  background: #ffecec;
  color: #d93025;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
.info-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.98rem;
}
.label {
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}
.value {
  color: var(--ink);
  font-weight: 600;
}
.muted {
  color: var(--muted);
  margin-left: 6px;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", monospace;
}

.no-result,
.loading {
  text-align: center;
  color: #fff;
  font-weight: 600;
  margin: 16px 0;
}
.loading .dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  margin-right: 6px;
  animation: blink 1.2s infinite ease-in-out alternate;
}
.loading .dot:nth-child(2) {
  animation-delay: 0.2s;
}
.loading .dot:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes blink {
  from {
    opacity: 0.2;
    transform: translateY(0);
  }
  to {
    opacity: 1;
    transform: translateY(-2px);
  }
}

.parking-list::-webkit-scrollbar {
  width: 10px;
}
.parking-list::-webkit-scrollbar-track {
  background: transparent;
}
.parking-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.35);
  border: 2px solid transparent;
  border-radius: 10px;
  background-clip: padding-box;
}

.pin {
  position: relative;
  width: 24px;
  height: 24px;
}
.pin__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -70%);
  box-shadow: 0 0 0 2px #fff inset;
  background: #2b6eea;
}
.pin__pulse {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -70%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  opacity: 0.25;
  background: #2b6eea;
  animation: pulse 1.6s infinite;
}
.pin--hover .pin__dot {
  background: #ffb020;
}
.pin--hover .pin__pulse {
  background: #ffb020;
}
.pin--active .pin__dot {
  background: #ff3366;
}
.pin--active .pin__pulse {
  background: #ff3366;
}
@keyframes pulse {
  0% {
    transform: translate(-50%, -70%) scale(1);
    opacity: 0.25;
  }
  70% {
    transform: translate(-50%, -70%) scale(2.1);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -70%) scale(2.1);
    opacity: 0;
  }
}

@media (max-width: 1200px) {
  .map-and-list {
    grid-template-columns: 1fr;
  }
  .map-container {
    min-height: 420px;
    height: 60vh;
  }
}
.right-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.fav-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #e6eefc;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  color: #ffb020;
  cursor: pointer;
  transition: transform 0.08s, box-shadow 0.2s, background 0.2s;
}
.fav-btn:hover {
  box-shadow: 0 10px 18px rgba(255, 176, 32, 0.25);
  transform: translateY(-1px);
}
.fav-btn[aria-pressed="true"] {
  color: #ff9b00;
  background: #fff8e6;
  border-color: #ffe1b3;
}

@media (max-width: 1200px) {
  .search-bar,
  .map-and-list {
    width: min(980px, 94vw);
  }

  .map-and-list {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .parking-list {
    max-height: none;
    overflow: visible;
  }
}

@media (max-width: 768px) {
  .search-bar {
    width: 92vw;
    padding: 10px 12px;
    gap: 10px;
  }
  .search-bar input {
    height: 44px;
    border-radius: 10px;
    font-size: 16px;
  }
  .btn-primary {
    height: 44px;
    padding: 0px 2px;
    border-radius: 10px;
    font-size: 13px;
  }

  .map-card {
    padding: 8px;
  }
  .map-container {
    min-height: 360px;
    height: 56vh;
    border-radius: 14px;
  }

  .parking-list {
    padding: 16px 12px;
  }

  .parking-card {
    margin: 10px 2px;
    padding: 12px;
    border-radius: 12px;
  }
  .card-top {
    gap: 10px;
  }
  .title {
    flex: 1;
    min-width: 0;
  }
  .title .name {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .right-actions {
    gap: 8px;
  }
  .fav-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }
  .badge {
    font-size: 12px;
    padding: 3px 8px;
  }

  .info-item {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .map-container {
    min-height: 320px;
    height: 52vh;
  }
  .badge {
    font-size: 11.5px;
  }
  .fav-btn {
    width: 30px;
    height: 30px;
  }
}

.map-wrapper {
  padding-top: calc(var(--nav-h) + 16px);
}

.search-bar,
.map-and-list {
  width: min(1280px, 92vw);
}

@media (max-width: 1200px) {
  .search-bar,
  .map-and-list {
    width: min(980px, 94vw);
  }
  .map-and-list {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .search-bar {
    width: 65vw;
  }
  .map-container {
    min-height: 360px;
    height: 56vh;
    border-radius: 14px;
  }
}

@supports (padding: env(safe-area-inset-top)) {
  .map-wrapper {
    padding-top: calc(var(--nav-h) + 16px + env(safe-area-inset-top));
  }
}
</style>
