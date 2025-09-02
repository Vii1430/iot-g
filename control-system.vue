<template>
  <v-parallax
    src="https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg"
    height="100vh"
  >
    <div class="d-flex align-center justify-center fill-height">
      <v-container
        class="py-10"
        style="
          margin-top: 100px;
          background-color: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
          max-width: 900px;
          backdrop-filter: blur(5px);
        "
      >
        <v-card color="transparent" elevation="0">
          <v-card-title class="text-center justify-center">
            <h1 class="font-weight-bold text-h2 text-primary mb-6">แผงควบคุม</h1>
          </v-card-title>

          <v-row justify="center" class="mb-6">
            <v-col cols="12" md="6" class="text-center">
              <v-progress-circular
                :model-value="displayTemperature"
                :rotate="360"
                :size="250"
                :width="25"
                color="red"
                :style="{ opacity: isPowerOn ? 1 : 0.5, 'transition': 'all 0.5s ease-in-out' }"
              >
                <div class="text-h5">
                  <div class="font-weight-bold">อุณหภูมิ</div>
                  <div :class="{ 'text-disabled': !isPowerOn }">{{ displayTemperature }}°C</div>
                </div>
              </v-progress-circular>
            </v-col>

            <v-col cols="12" md="6" class="text-center">
              <v-progress-circular
                :model-value="displayHumidity"
                :rotate="-90"
                :size="250"
                :width="25"
                color="blue"
                :style="{ opacity: isPowerOn ? 1 : 0.5, 'transition': 'all 0.5s ease-in-out' }"
              >
                <div class="text-h5">
                  <div class="font-weight-bold">ความชื้น</div>
                  <div :class="{ 'text-disabled': !isPowerOn }">{{ displayHumidity }}%</div>
                </div>
              </v-progress-circular>
            </v-col>
          </v-row>

          <v-divider class="my-6"></v-divider>

          <v-row justify="center" class="mb-8">
            <v-col cols="12" md="12" class="text-center">
              <v-icon
                :color="lightStatus === 1 && isPowerOn ? 'yellow-darken-2' : 'grey-lighten-1'"
                :class="{'light-on-glow': lightStatus === 1 && isPowerOn}"
                size="100"
              >
                mdi-lightbulb
              </v-icon>
              <div class="mt-2 text-subtitle-1 font-weight-medium">สถานะหลอดไฟ</div>
            </v-col>

            <v-col cols="12" md="12" class="text-center">
              <v-btn-toggle
                v-model="lightStatus"
                :disabled="!isPowerOn"
                color="warning"
                mandatory
                elevation="2"
              >
                <v-btn :value="1" size="large">เปิด</v-btn>
                <v-btn :value="0" size="large">ปิด</v-btn>
              </v-btn-toggle>
            </v-col>
          </v-row>
          
          <v-divider class="my-6"></v-divider>

          <v-row justify="center" class="mb-8">
            <v-btn-toggle v-model="isPowerOn" color="primary" mandatory elevation="2">
              <v-btn :value="true" size="large" color="success">เปิดระบบ</v-btn>
              <v-btn :value="false" size="large" color="error">ปิดระบบ</v-btn>
            </v-btn-toggle>
          </v-row>
          
          <v-divider class="my-6"></v-divider>

          <v-parallax
            height="250"
            src="https://cdn.vuetifyjs.com/images/parallax/material.jpg"
            class="mb-6"
            style="border-radius: 12px; overflow: hidden"
          >
            <v-tabs v-model="tab" bg-color="rgba(0,0,0,0.4)" color="white" grow>
              <v-tab v-for="item in items" :key="item" :text="item" :value="item" />
            </v-tabs>

            <v-tabs-window v-model="tab">
              <v-tabs-window-item v-for="item in items" :key="item" :value="item">
                <v-card color="transparent" flat class="pa-4">
                  <v-card-text class="text-white text-body-1">{{ text }}</v-card-text>
                </v-card>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-parallax>
        </v-card>
      </v-container>
    </div>
  </v-parallax>
</template>

<script>
import { io } from 'socket.io-client';

export default {
  data() {
    return {
      socket: null,
      temperature: 0,
      humidity: 0,
      isPowerOn: false,
      lightStatus: 0,
      tab: null,

    };
  },
  computed: {
    displayTemperature() {
      return this.isPowerOn ? this.temperature : 0;
    },
    displayHumidity() {
      return this.isPowerOn ? this.humidity : 0;
    },
  },
  mounted() {
    this.socket = io('http://localhost:7000');

    this.socket.on('อุณหภูมิ', (data) => {
      if (this.isPowerOn) {
        this.temperature = parseFloat(data);
      }
    });

    this.socket.on('ความชื้น', (data) => {
      if (this.isPowerOn) {
        this.humidity = parseFloat(data);
      }
    });

    this.socket.on('สวิตไฟ', (data) => {
      if (this.isPowerOn) {
        this.lightStatus = parseInt(data);
      }
    });
  },
  watch: {
    lightStatus(newVal) {
      if (this.isPowerOn && this.socket) {
        this.socket.emit('update_light', newVal);
        console.log("ส่งสถานะหลอดไฟไปยัง MQTT ผ่าน backend:", newVal);
      }
    },
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
};
</script>

<style scoped>
.light-on-glow {
  animation: glow 1.5s infinite alternate;
}

@keyframes glow {
  from {
    text-shadow: 0 0 5px yellow, 0 0 10px yellow, 0 0 15px yellow;
  }
  to {
    text-shadow: 0 0 20px yellow, 0 0 30px yellow, 0 0 40px yellow, 0 0 50px yellow;
  }
}

.v-progress-circular {
  transition: all 0.5s ease-in-out;
  transform: scale(1);
}

.v-progress-circular:hover {
  transform: scale(1.05);
}
</style>
