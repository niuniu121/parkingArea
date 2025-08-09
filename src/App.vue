<template>
  <Navbar v-if="!$route.meta.hideNav" />
  <RouterView />
</template>

<script>
import Navbar from "@/components/Navbar.vue";
export default { components: { Navbar } };
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  min-height: 100vh;
}
</style>
