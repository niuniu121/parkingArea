<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
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

        // 登录成功，跳转或保存 token
        alert('Login success!');
        localStorage.setItem('token', res.data.token);
        this.$router.push('/dashboard'); // 登录成功后跳转
      } catch (error) {
        this.errorMsg = error.response?.data?.message || 'Login failed';
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 200px;
}
form {
  display: flex;
  gap: 10px;
}
input {
  padding: 5px;
}
button {
  padding: 6px 12px;
  background-color: #1d4ed8;
  color: white;
  border: none;
  border-radius: 4px;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>
