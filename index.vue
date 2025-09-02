<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card class="pa-8 rounded-xl text-center" elevation="10" max-width="500">
      <v-card-title class="text-h4 font-weight-bold mb-6">
        <v-icon size="36" color="primary" start>mdi-view-dashboard</v-icon>
        หน้าหลักของระบบ
      </v-card-title>

      <v-card-text class="text-body-1 mb-6">
        กรุณาเลือกเมนูที่คุณต้องการเข้าสู่ระบบ
      </v-card-text>

      <v-btn
        color="primary"
        block
        class="mb-4"
        size="large"
        @click="$router.push('/listData')"
      >
        <v-icon start>mdi-account-multiple</v-icon>
        จัดการข้อมูลสมาชิก
      </v-btn>

      <v-btn
        color="success"
        block
        class="mb-4"
        size="large"
        @click="$router.push('/control-system')"
      >
        <v-icon start>mdi-cog</v-icon>
        ควบคุมระบบ
      </v-btn>

      <v-btn
        variant="outlined"
        color="error"
        block
        @click="logout"
      >
        <v-icon start>mdi-logout</v-icon>
        ออกจากระบบ
      </v-btn>
    </v-card>
  </v-container>
</template>

<script>
export default {
  methods: {
    logout() {
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>