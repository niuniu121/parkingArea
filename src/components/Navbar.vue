<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <!-- Logo -->
      <router-link class="logo" to="/dashboard">Smart Parking</router-link>

      <!-- Hamburger Icon (mobile) -->
      <div class="hamburger" @click="toggleMenu">
        <span :class="{ open: isOpen }"></span>
        <span :class="{ open: isOpen }"></span>
        <span :class="{ open: isOpen }"></span>
      </div>

      <!-- Navigation Links -->
      <div class="nav-links" :class="{ show: isOpen }">
        <router-link to="/dashboard" class="nav-link" @click="closeMenu"
          >Dashboard</router-link
        >
        <router-link to="/map" class="nav-link" @click="closeMenu"
          >Map</router-link
        >
        <router-link to="/history" class="nav-link" @click="closeMenu"
          >History</router-link
        >
        <button class="logout-btn" @click="logout">Logout</button>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      isOpen: false,
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
      localStorage.removeItem("token");
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.navbar {
  background: linear-gradient(to right, #007bff, #00b4d8);
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  text-decoration: none;
  letter-spacing: 0.5px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  color: white;
  font-weight: 500;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}
.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.logout-btn {
  background-color: white;
  color: #007bff;
  border: none;
  padding: 8px 14px;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}
.logout-btn:hover {
  background-color: #e0e7ff;
  color: #0056b3;
}

/* Hamburger icon */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  cursor: pointer;
}
.hamburger span {
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

/* Responsive styles */
@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .nav-links {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 64px;
    right: 16px;
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  .nav-links.show {
    display: flex;
  }

  .nav-link {
    color: #007bff;
    margin-bottom: 12px;
  }

  .logout-btn {
    background-color: #007bff;
    color: white;
    width: 100%;
    margin-top: 10px;
  }
}

@keyframes navbarSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.navbar {
  animation: navbarSlideIn 0.6s ease-out forwards;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-links.show {
  animation: fadeSlideIn 0.3s ease-out;
}

.nav-link:hover,
.logout-btn:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}
</style>
