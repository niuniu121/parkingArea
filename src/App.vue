<template>
  <div id="app">
    <NavBar v-if="showNavBar" />
    <router-view />
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'

export default {
  components: {
    NavBar
  },
  computed: {
    showNavBar() {
      return this.$route.path !== '/login'
    }
  }
}
</script>


<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
