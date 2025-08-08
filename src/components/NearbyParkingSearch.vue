<template>
  <div class="search-box">
    <input v-model="query" placeholder="Enter a location..." />
    <button @click="searchLocation">Search</button>
  </div>
</template>

<script>
export default {
  emits: ["locationFound"],
  data() {
    return {
      query: "",
    };
  },
  methods: {
    async searchLocation() {
      if (!this.query.trim()) return;

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.query)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        this.$emit("locationFound", {
          lat: parseFloat(lat),
          lng: parseFloat(lon),
        });
      } else {
        alert("❌ No results found.");
      }
    },
  },
};
</script>

<style scoped>
.search-box {
  display: flex;
  gap: 8px;
  padding: 12px;
}

input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

button {
  padding: 8px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
