<template>
  <div class="login-page">
    <div class="login-box">
      <div class="logo"></div>
      <h2>Smart<br />Parking Login</h2>
      <p class="subtitle">Welcome back! Please login to continue.</p>
      <form @submit.prevent="handleLogin">
        <input v-model="email" type="email" placeholder="Enter your email" required />
        <input v-model="password" type="password" placeholder="Enter your password" required />
        <button type="submit">Login</button>
      </form>
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      errorMsg: ''
    };
  },
  methods: {
    async handleLogin() {
      try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
          email: this.email,
          password: this.password
        });
        alert('Login success!');
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('email', this.email);
        this.$router.push('/dashboard');
      } catch (error) {
        this.errorMsg = error.response?.data?.message || 'Login failed';
      }
    }
  }
};
</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(145deg, #007BFF, #00B4D8);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

.login-box {
  background-color: white;
  padding: 40px 30px;
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.logo {
  font-size: 40px;
  margin-bottom: 10px;
}

h2 {
  font-size: 28px;
  margin-bottom: 8px;
  line-height: 1.2;
  font-weight: bold;
  color: #111827;
}

.subtitle {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 24px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #2563eb;
}

button {
  padding: 12px;
  background-color: #1d4ed8;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #2563eb;
}

.error {
  color: red;
  margin-top: 16px;
}
</style>
