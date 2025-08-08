<template>
  <div class="dashboard-container">
    <h2>Welcome, {{ userEmail }}</h2>
    <p>You are now logged in.</p>
    <button @click="handleLogout">Logout</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userEmail: ''
    };
  },
  mounted() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/login');
    }

    // 模拟用户信息提取（可替换为JWT解析或调用 /me 接口）
    const email = localStorage.getItem('email'); // 你可以在 login 成功时保存 email
    this.userEmail = email || 'User';
  },
  methods: {
    handleLogout() {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  margin-top: 150px;
  text-align: center;
}
button {
  margin-top: 20px;
  padding: 6px 12px;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
}
</style>
