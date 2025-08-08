<template>
  <div class="result-list">
    <h3>Nearby Parking Spots</h3>
    <ul>
      <li v-for="(spot, idx) in results" :key="idx">
        <strong>{{ spot.street }}</strong
        ><br />
        Status: {{ spot.status }}<br />
        Bay ID: {{ spot.bay_id }}<br />
        Distance: {{ spot.distance.toFixed(0) }}m
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: ["results"],
};
</script>

<style scoped>
.result-list {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin-bottom: 12px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}
</style>
