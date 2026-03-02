<template>
  <v-container class="py-8" style="max-width: 900px">
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <div class="text-h5">Detalhe do evento</div>
        <div class="text-body-2 text-medium-emphasis">
          Visualizacao e exclusao.
        </div>
      </div>
      <div class="d-flex gap-2">
        <v-btn variant="text" :to="{ name: 'events-list' }">Voltar</v-btn>
        <v-btn
          color="primary"
          variant="tonal"
          :to="{ name: 'events-edit', params: { id } }"
        >
          Editar
        </v-btn>
        <v-btn color="error" variant="tonal" @click="deleteDialog = true">
          Excluir
        </v-btn>
      </div>
    </div>

    <v-card elevation="4">
      <v-card-text>
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>

        <v-skeleton-loader v-if="loading" type="article" />

        <div v-else>
          <div class="text-h6 mb-2">{{ event?.title }}</div>

          <v-row>
            <v-col cols="12" md="6">
              <div class="text-caption text-medium-emphasis">Inicio</div>
              <div>{{ formatDateTime(event?.startDate) }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-caption text-medium-emphasis">Termino</div>
              <div>{{ formatDateTime(event?.endDate) }}</div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="text-caption text-medium-emphasis">Local</div>
              <div>{{ event?.location || "-" }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-caption text-medium-emphasis">Organizador</div>
              <div>{{ event?.organizerEmail || "-" }}</div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="text-caption text-medium-emphasis">Status</div>
              <v-chip
                size="small"
                :color="event?.status === 'canceled' ? 'error' : 'success'"
                variant="tonal"
              >
                {{ event?.status === "canceled" ? "Cancelado" : "Agendado" }}
              </v-chip>
            </v-col>

            <v-col cols="12" md="6">
              <div class="text-caption text-medium-emphasis">Categoria</div>
              <div>{{ event?.category?.name || "-" }}</div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="text-caption text-medium-emphasis">Criado em</div>
              <div>{{ formatDateTime(event?.createdAt) }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-caption text-medium-emphasis">Atualizado em</div>
              <div>{{ formatDateTime(event?.updatedAt) }}</div>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="deleteDialog" max-width="520">
      <v-card>
        <v-card-title>Confirmar exclusao</v-card-title>
        <v-card-text> Tem certeza que deseja excluir este evento? </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" @click="confirmDelete" :loading="deleting">
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { eventsApi } from "../services/eventsApi";
import { formatDateTime } from "../utils/dateTime";

const route = useRoute();
const router = useRouter();

const id = Number(route.params.id);

const loading = ref(false);
const deleting = ref(false);
const deleteDialog = ref(false);

const event = ref(null);
const error = ref("");

async function load() {
  loading.value = true;
  error.value = "";
  try {
    event.value = await eventsApi.get(id);
  } catch (e) {
    error.value = e?.message || "Erro ao carregar evento.";
  } finally {
    loading.value = false;
  }
}

async function confirmDelete() {
  deleting.value = true;
  error.value = "";
  try {
    await eventsApi.remove(id);
    router.push({ name: "events-list" });
  } catch (e) {
    error.value = e?.message || "Erro ao excluir evento.";
  } finally {
    deleting.value = false;
  }
}

onMounted(() => {
  load();
});
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
