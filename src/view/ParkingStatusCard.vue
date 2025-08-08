<template>
  <div class="status-container">
    <div v-for="zone in zones" :key="zone.name" class="zone-card">
      <div class="zone-name">
        <span :class="statusDotClass(zone.status)"></span>
        {{ zone.name }}
      </div>
      <div class="zone-info">{{ zone.status }} - {{ zone.available }}/{{ zone.total }} available</div>
    </div>

    <div class="action-buttons">
      <button @click="$emit('locate')">Find Near Me</button>
      <button @click="$emit('suggest')">Smart Suggest</button>
      <button @click="$emit('refresh')">Refresh</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ParkingStatusCard',
  props: {
    zones: Array // parking area data
  },
  methods: {
    statusDotClass(status) {
      switch (status.toLowerCase()) {
        case 'plenty': return 'dot green';
        case 'moderate': return 'dot yellow';
        case 'filling up': return 'dot red';
        default: return 'dot gray';
      }
    }
  }
}
</script>

<style scoped>
.status-container {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 400px;
  margin: 0 auto;
}

.zone-card {
  border-bottom: 1px solid #eee;
  padding: 8px 0;
}

.zone-name {
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

.zone-info {
  font-size: 14px;
  color: #555;
  margin-left: 24px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.green { background-color: #28a745; }
.yellow { background-color: #ffc107; }
.red { background-color: #dc3545; }
.gray { background-color: #6c757d; }

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}

.action-buttons button {
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  background: #007BFF;
  color: white;
}

.action-buttons button:hover {
  background: #0056b3;
}
</style>
