<template>
  <nav class="navbar">
    <!-- Logo -->
    <router-link class="logo" to="/dashboard">Smart Parking</router-link>

    <!-- Hamburger Icon -->
    <div class="hamburger" @click="toggleMenu">
      <span :class="{ open: isOpen }"></span>
      <span :class="{ open: isOpen }"></span>
      <span :class="{ open: isOpen }"></span>
    </div>

    <!-- Links -->
    <div class="nav-links" :class="{ show: isOpen }">
      <router-link to="/dashboard" class="nav-link" @click="closeMenu">Dashboard</router-link>
      <router-link to="/map" class="nav-link" @click="closeMenu">Map</router-link>
      <router-link to="/stats" class="nav-link" @click="closeMenu">Stats</router-link>
      <button class="logout-btn" @click="logout">Logout</button>
    </div>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      isOpen: false
    };
  },
  methods: {
    toggleMenu() {
      this.isOpen = !this.isOpen;
    },
    closeMenu() {
      this.isOpen = false;
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.navbar {
  background: linear-gradient(to right, #007BFF, #00B4D8);
  padding: 12px 16px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  box-sizing: border-box;
}

.logo {
  font-size: 24px;
  font-weight: 600;
  color: white;
  text-decoration: none;
  letter-spacing: 0.5px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  color: white;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease, transform 0.2s ease;
}
.nav-link:hover {
  color: #d1ecff;
  transform: translateY(-2px);
}

.logout-btn {
  border: 1px solid white;
  background: transparent;
  color: white;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.logout-btn:hover {
  background-color: white;
  color: #007BFF;
}

/* Hamburger */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  cursor: pointer;
}
.hamburger span {
  display: block;
  height: 3px;
  width: 100%;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}
.hamburger span.open:nth-child(1) {
  transform: rotate(45deg) translateY(6px);
}
.hamburger span.open:nth-child(2) {
  opacity: 0;
}
.hamburger span.open:nth-child(3) {
  transform: rotate(-45deg) translateY(-6px);
}

/* Mobile Style */
@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .nav-links {
    display: none;
    position: absolute;
    top: 64px;
    right: 16px;
    flex-direction: column;
    background: rgba(0, 123, 255, 0.95);
    padding: 20px;
    border-radius: 12px;
    z-index: 999;
  }

  .nav-links.show {
    display: flex;
  }

  .nav-link {
    margin-bottom: 14px;
  }

  .logout-btn {
    margin-top: 8px;
  }
}
</style>
