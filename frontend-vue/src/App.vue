<template>
  <v-app>
    <v-app-bar color="indigo" density="comfortable" dark>
      <v-app-bar-title>TeamMeet Planner (Vue + Vuetify)</v-app-bar-title>
    </v-app-bar>
    <v-main class="d-flex align-center justify-center">
      <v-container class="py-12" style="max-width: 720px;">
        <v-card elevation="6" class="pa-6">
          <v-card-title class="text-h5 mb-2">Frontend A</v-card-title>
          <v-card-text>
            <p class="mb-4">
              Este é o frontend A do experimento. Use o botão abaixo para testar a API NestJS conectada ao MySQL.
            </p>
            <v-btn color="primary" @click="testApi" :loading="loading">
              Testar API
            </v-btn>
            <div class="mt-4" v-if="response">
              <v-alert type="success" variant="tonal" v-if="response.status === 'ok'">
                API respondeu: {{ response }}
              </v-alert>
              <v-alert type="error" variant="tonal" v-else>
                Erro ao chamar API: {{ response }}
              </v-alert>
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';

const loading = ref(false);
const response = ref(null);
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function testApi() {
  loading.value = true;
  try {
    const res = await fetch(`${apiUrl}/health`);
    const data = await res.json();
    response.value = data;
  } catch (error) {
    response.value = { status: 'error', message: error.message };
  } finally {
    loading.value = false;
  }
}
</script>
