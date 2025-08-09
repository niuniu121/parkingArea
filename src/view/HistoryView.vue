<template>
  <div class="history-wrapper">
    <div class="header glass">
      <h2><i class="fas fa-clock"></i> History & Favorites</h2>
      <div class="tabs">
        <button :class="{ active: tab === 'recent' }" @click="tab = 'recent'">
          Recent
        </button>
        <button :class="{ active: tab === 'fav' }" @click="tab = 'fav'">
          Favorites
        </button>
      </div>
      <div class="actions">
        <button class="btn-danger" @click="clearAll" v-if="items.length">
          Clear All
        </button>
      </div>
    </div>

    <div class="list glass">
      <div v-if="!items.length" class="empty">
        <i class="far fa-folder-open"></i> Nothing here yet.
      </div>

      <article v-for="it in items" :key="it.id" class="row">
        <div class="left">
          <div class="p-badge">P</div>
          <div class="meta">
            <div class="title">{{ it.street }}</div>
            <div class="sub">
              <span v-if="it.bay_id">Bay ID: {{ it.bay_id }}</span>
              <span v-if="it.totalBays"
                >&nbsp;•&nbsp;{{ it.totalBays }} bays</span
              >
              <span v-if="it.ts">&nbsp;•&nbsp;{{ timeStr(it.ts) }}</span>
            </div>
          </div>
        </div>
        <div class="right">
          <button class="btn-light" @click="goMap(it.id)">Open on Map</button>
          <button class="btn-danger" @click="removeOne(it.id)">Delete</button>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
const FAV_KEY = "sp_favs";
const HIS_KEY = "sp_history";
const FOCUS_KEY = "sp_focus_id";

export default {
  name: "HistoryView",
  data() {
    return { tab: "recent", favs: {}, recent: [] };
  },
  computed: {
    items() {
      if (this.tab === "fav")
        return Object.values(this.favs).sort((a, b) => b.savedAt - a.savedAt);
      return (this.recent || []).sort((a, b) => b.ts - a.ts);
    },
  },
  mounted() {
    this.reload();
  },
  methods: {
    reload() {
      try {
        this.favs = JSON.parse(localStorage.getItem(FAV_KEY) || "{}");
      } catch {
        this.favs = {};
      }
      try {
        this.recent = JSON.parse(localStorage.getItem(HIS_KEY) || "[]");
      } catch {
        this.recent = [];
      }
    },
    removeOne(id) {
      if (this.tab === "fav") {
        const favs = { ...this.favs };
        delete favs[id];
        localStorage.setItem(FAV_KEY, JSON.stringify(favs));
        this.favs = favs;
      } else {
        const list = (this.recent || []).filter((x) => x.id !== id);
        localStorage.setItem(HIS_KEY, JSON.stringify(list));
        this.recent = list;
      }
    },
    clearAll() {
      if (!confirm("Clear all?")) return;
      if (this.tab === "fav") {
        localStorage.setItem(FAV_KEY, "{}");
        this.favs = {};
      } else {
        localStorage.setItem(HIS_KEY, "[]");
        this.recent = [];
      }
    },
    goMap(id) {
      // 写一个一次性的 “聚焦 id”，Map 页面会读
      localStorage.setItem(FOCUS_KEY, id);
      this.$router.push({ path: "/map" });
    },
    timeStr(ts) {
      const d = new Date(ts);
      return d.toLocaleString();
    },
  },
};
</script>

<style scoped>
.history-wrapper {
  min-height: 100vh;
  padding: 24px 16px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.glass {
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 20px;
  box-shadow: 0 14px 34px rgba(0, 50, 150, 0.15);
}
.header {
  width: min(1100px, 96vw);
  padding: 16px 18px;
  color: #fff;
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  align-items: center;
  margin-top: 68px;
}
.header h2 {
  margin: 0;
  font-weight: 800;
  letter-spacing: 0.3px;
}
.tabs button {
  border: none;
  padding: 10px 14px;
  border-radius: 10px;
  margin-right: 8px;
  cursor: pointer;
  background: #ffffff33;
  color: #fff;
  font-weight: 700;
}
.tabs button.active {
  background: #fff;
  color: #1d4ed8;
}
.actions .btn-danger {
  border: none;
  padding: 10px 14px;
  border-radius: 10px;
  background: #ff4d4f;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.list {
  width: min(1100px, 96vw);
  margin-top: 16px;
  padding: 12px;
}
.empty {
  color: #fff;
  text-align: center;
  padding: 40px 0;
  font-weight: 700;
}
.row {
  background: #fff;
  border: 1px solid #eef3ff;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 4px;
  box-shadow: 0 6px 18px rgba(0, 56, 140, 0.08);
}
.left {
  display: flex;
  gap: 12px;
  align-items: center;
}
.p-badge {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #2b6eea;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  box-shadow: 0 6px 16px rgba(43, 110, 234, 0.35);
}
.meta .title {
  font-weight: 800;
  color: #243757;
}
.meta .sub {
  color: #6b7a90;
  margin-top: 2px;
}
.right {
  display: flex;
  gap: 10px;
}
.btn-light {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e6eefc;
  background: #fff;
  cursor: pointer;
}
.btn-danger {
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: #ff4d4f;
  color: #fff;
  cursor: pointer;
}
</style>
