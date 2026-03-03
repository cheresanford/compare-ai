<template>
  <v-app>
    <v-app-bar color="indigo" density="comfortable" dark>
      <v-app-bar-title>TeamMeet Planner (Vue + Vuetify)</v-app-bar-title>
      <v-spacer />
      <v-btn variant="text" to="/">Inicio</v-btn>
      <v-btn variant="text" to="/eventos">Eventos</v-btn>
      <v-btn variant="text" to="/categorias">Categorias</v-btn>
      <v-btn variant="text" to="/sobre">Sobre</v-btn>
      <v-divider vertical class="mx-2" />
      <v-chip
        size="small"
        variant="tonal"
        :color="googleStatus.connected ? 'success' : 'warning'"
        class="mr-2"
      >
        {{
          googleStatus.connected
            ? "Conectado ao Google Calendar"
            : "Google Calendar desconectado"
        }}
      </v-chip>
      <v-btn
        v-if="!googleStatus.connected"
        variant="tonal"
        color="success"
        :href="googleCalendarApi.connectUrl"
      >
        Conectar ao Google
      </v-btn>
      <v-btn
        v-else
        variant="tonal"
        color="warning"
        :loading="disconnecting"
        @click="disconnectGoogle"
      >
        Desconectar
      </v-btn>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
    <v-snackbar v-model="snackbar.visible" :color="snackbar.color" timeout="5000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { googleCalendarApi } from "./services/googleCalendarApi";

const route = useRoute();
const router = useRouter();

const disconnecting = ref(false);
const googleStatus = reactive({
  connected: false,
  accountEmail: null,
});

const snackbar = reactive({
  visible: false,
  message: "",
  color: "success",
});

function showMessage(message, color = "success") {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.visible = true;
}

async function refreshGoogleStatus() {
  try {
    const status = await googleCalendarApi.status();
    googleStatus.connected = !!status.connected;
    googleStatus.accountEmail = status.accountEmail ?? null;
  } catch {
    googleStatus.connected = false;
    googleStatus.accountEmail = null;
  }
}

async function disconnectGoogle() {
  disconnecting.value = true;
  try {
    await googleCalendarApi.disconnect();
    await refreshGoogleStatus();
    showMessage("Sessao do Google desconectada com sucesso.", "success");
  } catch (e) {
    showMessage(e?.message || "Falha ao desconectar Google Calendar.", "error");
  } finally {
    disconnecting.value = false;
  }
}

watch(
  () => route.query,
  async (query) => {
    const googleState = query.google;
    const message = query.message;

    if (!googleState) return;

    if (googleState === "connected") {
      showMessage("Conexao com Google Calendar realizada.", "success");
      await refreshGoogleStatus();
    } else if (googleState === "error") {
      showMessage(
        message?.toString() || "Falha ao autenticar com Google Calendar.",
        "error",
      );
    }

    const clearedQuery = { ...query };
    delete clearedQuery.google;
    delete clearedQuery.message;
    router.replace({ query: clearedQuery });
  },
  { immediate: true },
);

onMounted(() => {
  refreshGoogleStatus();
});
</script>
