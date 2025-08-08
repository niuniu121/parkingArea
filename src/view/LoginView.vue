<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-logo">P</div>
      <h1 class="auth-title">Smart<br />Parking Login</h1>
      <p class="auth-subtitle">Welcome back! Please login to continue.</p>

      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="field">
          <i class="far fa-envelope"></i>
          <input
            v-model="email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="field">
          <i class="fas fa-lock"></i>
          <input
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <button class="btn-primary" type="submit" :disabled="loading">
          {{ loading ? "Logging in…" : "Login" }}
        </button>
      </form>

      <div class="auth-extra">
        <span>Don’t have an account?</span>
        <router-link class="btn-ghost" to="/register"
          >Create account</router-link
        >
      </div>

      <p v-if="error" class="auth-error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { login } from "@/api/auth";

export default {
  name: "LoginView",
  data() {
    return {
      email: "",
      password: "",
      loading: false,
      error: "",
    };
  },
  async mounted() {
    const msg = this.$route.query.msg;
    if (msg) {
      this.error = decodeURIComponent(msg);
      setTimeout(() => (this.error = ""), 3000);
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = "";
      try {
        const { token } = await login(this.email, this.password);
        localStorage.setItem("token", token);
        this.$router.push("/dashboard");
      } catch (e) {
        this.error = e?.response?.data?.message || "Login failed";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
}
.auth-card {
  width: min(460px, 92vw);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.18);
  padding: 28px 28px 20px;
  text-align: center;
}
.auth-logo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #2b6eea;
  color: #fff;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px auto 10px;
  font-size: 22px;
  box-shadow: 0 10px 24px rgba(43, 110, 234, 0.28);
}
.auth-title {
  margin: 0 0 6px;
  color: #1f2937;
  line-height: 1.2;
  font-size: 22px;
  font-weight: 800;
}
.auth-subtitle {
  margin: 0 0 18px;
  color: #6b7280;
  font-size: 13px;
}
.auth-form {
  display: grid;
  gap: 12px;
  margin: 8px 0 10px;
}
.field {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px 12px;
  background: #fafafa;
}
.field i {
  color: #64748b;
}
.field input {
  flex: 1;
  border: 0;
  background: transparent;
  outline: 0;
  font-size: 14px;
}
.btn-primary {
  width: 100%;
  height: 44px;
  border: 0;
  border-radius: 12px;
  background: #204fde;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(32, 79, 222, 0.28);
}
.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.auth-extra {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  color: #64748b;
}
.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #dbeafe;
  background: #f8fbff;
  color: #1d4ed8;
  font-weight: 700;
  text-decoration: none;
}
.btn-ghost:hover {
  background: #eef5ff;
}
.auth-error {
  margin-top: 10px;
  color: #ef4444;
  font-weight: 600;
  font-size: 13px;
}
</style>
