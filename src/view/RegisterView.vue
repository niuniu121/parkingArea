<template>
  <div class="register">
    <h2>Register</h2>
    <form @submit.prevent="handleRegister">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Register</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import { register } from '@/api/auth';

export default {
  data() {
    return {
      email: '',
      password: '',
      message: '',
    };
  },
  methods: {
    async handleRegister() {
      try {
        await register(this.email, this.password);
        this.message = 'Registration successful!';
      } catch (err) {
        this.message = err.response?.data?.message || 'Error';
      }
    },
  },
};
</script>
