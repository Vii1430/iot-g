<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card elevation="12" max-width="500" class="pa-8 rounded-xl w-100">
      <v-card-title class="text-h4 font-weight-bold text-center mb-6">
        <v-icon start color="primary" size="36">mdi-account-lock</v-icon>
        เข้าสู่ระบบ
      </v-card-title>

      <v-form ref="form">
        <v-text-field
          v-model="email"
          label="อีเมล"
          prepend-inner-icon="mdi-email"
          type="email"
          outlined
          density="comfortable"
          class="mb-4"
          required
        ></v-text-field>

        <v-text-field
          v-model="password"
          label="รหัสผ่าน"
          prepend-inner-icon="mdi-lock"
          type="password"
          outlined
          density="comfortable"
          class="mb-4"
          required
        ></v-text-field>

        <v-alert
          v-if="error"
          type="error"
          class="mb-4"
          dense
          border="start"
        >
          {{ error }}
        </v-alert>

        <v-btn color="success" block size="large" class="mb-3" @click="doLogin">
          <v-icon start>mdi-login</v-icon>
          เข้าสู่ระบบ
        </v-btn>

        <v-btn color="error" block size="large" variant="outlined" class="mb-3" @click="reset">
          <v-icon start>mdi-refresh</v-icon>
          รีเซตฟอร์ม
        </v-btn>

        <div class="text-center mt-2">
          ยังไม่มีบัญชี?
          <v-btn variant="text" color="primary" @click="goToRegister">
            สมัครสมาชิก
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      email: "",
      password: "",
      error: "",
    };
  },
  methods: {
    async doLogin() {
      try {
        const response = await axios.post("http://localhost:7000/login", {
          email: this.email,
          password: this.password,
        });

        const token = response.data.token;

        if (response.data.status === "ok") {
          localStorage.setItem("token", token);
          this.$router.push("/");
        } else {
          this.error = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
        }
      } catch (err) {
        this.error = "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";
        console.error("Login error:", err);
      }
    },
    reset() {
      this.email = "";
      this.password = "";
      this.error = "";
    },
    goToRegister() {
      this.$router.push("/register"); // ✅ ไปหน้าสมัครสมาชิก
    },
  },
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
