<template>
  <v-container class="py-8" style="max-width: 1100px">
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <div class="text-h5">Relatório resumido de eventos</div>
        <div class="text-body-2 text-medium-emphasis">
          Totais por status e categoria no período selecionado.
        </div>
      </div>
    </div>

    <v-card elevation="4" class="mb-4">
      <v-card-text>
        <div class="d-flex flex-wrap gap-3 align-center">
          <v-text-field
            v-model="startDate"
            label="Data inicial"
            type="date"
            variant="outlined"
            density="comfortable"
            hide-details
            style="min-width: 220px"
          />

          <v-text-field
            v-model="endDate"
            label="Data final"
            type="date"
            variant="outlined"
            density="comfortable"
            hide-details
            style="min-width: 220px"
          />

          <v-btn color="primary" @click="consultar" :loading="loading">
            Consultar
          </v-btn>
        </div>

        <div class="text-body-2 text-medium-emphasis mt-3">
          Período selecionado: <strong>{{ periodLabel }}</strong>
        </div>

        <v-alert v-if="error" type="error" variant="tonal" class="mt-3">
          {{ error }}
        </v-alert>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col cols="12" md="4">
        <v-card elevation="2">
          <v-card-text>
            <div class="text-caption text-medium-emphasis">
              Total de eventos
            </div>
            <div class="text-h4 mt-1">{{ report.totalEvents }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="12"
        md="4"
        v-for="item in report.byStatus"
        :key="item.status"
      >
        <v-card elevation="2">
          <v-card-text>
            <div class="text-caption text-medium-emphasis">
              {{ statusLabel(item.status) }}
            </div>
            <div class="text-h4 mt-1">{{ item.total }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card elevation="4" class="mt-4">
      <v-card-title>Totais por categoria</v-card-title>
      <v-card-text>
        <v-table density="comfortable">
          <thead>
            <tr>
              <th>Categoria</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="report.byCategory.length === 0">
              <td colspan="2" class="text-medium-emphasis">
                Nenhum evento encontrado no período.
              </td>
            </tr>
            <tr
              v-for="item in report.byCategory"
              :key="item.categoryId ?? 'none'"
            >
              <td>{{ item.categoryName }}</td>
              <td class="text-right">{{ item.total }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { eventsApi } from "../services/eventsApi";

const loading = ref(false);
const error = ref("");

const startDate = ref("");
const endDate = ref("");

const report = ref({
  totalEvents: 0,
  byStatus: [
    { status: "scheduled", total: 0 },
    { status: "canceled", total: 0 },
  ],
  byCategory: [],
});

const periodLabel = computed(() => {
  if (!startDate.value || !endDate.value) return "-";
  return `${startDate.value} até ${endDate.value}`;
});

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function statusLabel(status) {
  return status === "canceled" ? "Cancelados" : "Agendados";
}

async function consultar() {
  if (!startDate.value || !endDate.value) {
    error.value = "Informe data inicial e data final.";
    return;
  }

  if (endDate.value < startDate.value) {
    error.value = "A data final deve ser maior ou igual à data inicial.";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const data = await eventsApi.reportSummary({
      startDate: startDate.value,
      endDate: endDate.value,
    });

    report.value = {
      totalEvents: data.totalEvents ?? 0,
      byStatus: data.byStatus ?? [],
      byCategory: data.byCategory ?? [],
    };
  } catch (e) {
    error.value = e?.message || "Erro ao carregar relatório.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  const today = getTodayIsoDate();
  startDate.value = today;
  endDate.value = today;
  consultar();
});
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
