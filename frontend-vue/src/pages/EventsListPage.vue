<template>
  <v-container class="py-8" style="max-width: 1100px">
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <div class="text-h5">Eventos</div>
        <div class="text-body-2 text-medium-emphasis">
          Busca por título, paginação e ordenação.
        </div>
      </div>
      <v-btn color="primary" :to="{ name: 'events-new' }">Novo evento</v-btn>
    </div>

    <v-card elevation="4">
      <v-card-text>
        <div class="d-flex flex-wrap gap-3 align-center">
          <v-text-field
            v-model="q"
            label="Buscar por título"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
            hide-details
            style="min-width: 260px"
          />

          <v-select
            v-model="sortBy"
            :items="sortByItems"
            item-title="title"
            item-value="value"
            label="Ordenar por"
            variant="outlined"
            density="comfortable"
            hide-details
            style="min-width: 200px"
          />

          <v-select
            v-model="sortDir"
            :items="sortDirItems"
            item-title="title"
            item-value="value"
            label="Direção"
            variant="outlined"
            density="comfortable"
            hide-details
            style="min-width: 160px"
          />

          <v-select
            v-model="size"
            :items="[5, 10, 20, 50]"
            label="Tamanho da página"
            variant="outlined"
            density="comfortable"
            hide-details
            style="min-width: 170px"
          />

          <v-select
            v-model="categoryId"
            :items="categoryItems"
            item-title="title"
            item-value="value"
            label="Categoria"
            variant="outlined"
            density="comfortable"
            hide-details
            style="min-width: 220px"
          />

          <v-text-field
            v-model="reportStartDate"
            label="Período (de)"
            type="date"
            variant="outlined"
            density="comfortable"
            hide-details
            style="min-width: 190px"
          />

          <v-text-field
            v-model="reportEndDate"
            label="Período (até)"
            type="date"
            variant="outlined"
            density="comfortable"
            hide-details
            style="min-width: 190px"
          />

          <v-spacer />

          <v-btn
            color="secondary"
            variant="tonal"
            @click="refreshReport"
            :loading="reportLoading"
          >
            Consultar relatório
          </v-btn>

          <v-btn variant="tonal" @click="refresh" :loading="loading">
            Atualizar
          </v-btn>
        </div>

        <v-divider class="my-4" />

        <v-card variant="tonal" class="mb-4">
          <v-card-text>
            <div class="text-subtitle-1 font-weight-medium mb-1">
              Relatório resumido de eventos
            </div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              Período selecionado: <strong>{{ reportPeriodLabel }}</strong>
            </div>

            <v-alert
              v-if="reportError"
              type="error"
              variant="tonal"
              density="comfortable"
              class="mb-4"
            >
              {{ reportError }}
            </v-alert>

            <v-row>
              <v-col cols="12" md="4">
                <v-card elevation="1">
                  <v-card-text>
                    <div class="text-caption text-medium-emphasis">
                      Total no período
                    </div>
                    <div class="text-h4 font-weight-bold">{{ report.total }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card elevation="1">
                  <v-card-text>
                    <div class="text-caption text-medium-emphasis">
                      Agendados
                    </div>
                    <div class="text-h4 font-weight-bold">{{ scheduledTotal }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card elevation="1">
                  <v-card-text>
                    <div class="text-caption text-medium-emphasis">
                      Cancelados
                    </div>
                    <div class="text-h4 font-weight-bold">{{ canceledTotal }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <div class="text-subtitle-2 mt-2 mb-2">Totais por categoria</div>
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!reportLoading && report.byCategory.length === 0">
                  <td colspan="2" class="text-medium-emphasis">
                    Nenhum evento no período selecionado.
                  </td>
                </tr>
                <tr
                  v-for="category in report.byCategory"
                  :key="category.categoryId ?? category.categoryName"
                >
                  <td>{{ category.categoryName }}</td>
                  <td class="text-right">{{ category.total }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>

        <v-table density="comfortable">
          <thead>
            <tr>
              <th>Título</th>
              <th>Categoria</th>
              <th>Início</th>
              <th>Término</th>
              <th>Status</th>
              <th>Organizador</th>
              <th class="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!loading && items.length === 0">
              <td colspan="7" class="text-medium-emphasis">
                Nenhum evento encontrado.
              </td>
            </tr>
            <tr v-for="ev in items" :key="ev.id">
              <td class="font-weight-medium">{{ ev.title }}</td>
              <td>{{ ev.category?.name || "-" }}</td>
              <td>{{ formatDateTime(ev.startDate) }}</td>
              <td>{{ formatDateTime(ev.endDate) }}</td>
              <td>
                <v-chip
                  size="small"
                  :color="ev.status === 'canceled' ? 'error' : 'success'"
                  variant="tonal"
                >
                  {{ ev.status === "canceled" ? "Cancelado" : "Agendado" }}
                </v-chip>
              </td>
              <td>{{ ev.organizerEmail }}</td>
              <td class="text-right">
                <v-btn
                  size="small"
                  variant="text"
                  :to="{ name: 'events-detail', params: { id: ev.id } }"
                >
                  Ver
                </v-btn>
                <v-btn
                  size="small"
                  variant="text"
                  :to="{ name: 'events-edit', params: { id: ev.id } }"
                >
                  Editar
                </v-btn>
                <v-btn
                  size="small"
                  variant="text"
                  color="error"
                  @click="openDelete(ev)"
                >
                  Excluir
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>

        <div class="d-flex align-center justify-space-between mt-4">
          <div class="text-body-2 text-medium-emphasis">Total: {{ total }}</div>
          <v-pagination
            v-model="page"
            :length="pageCount"
            :total-visible="7"
            density="comfortable"
          />
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="deleteDialog" max-width="520">
      <v-card>
        <v-card-title>Confirmar exclusão</v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir o evento
          <strong>{{ deleting?.title }}</strong
          >?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn
            color="error"
            @click="confirmDelete"
            :loading="deletingLoading"
          >
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { eventsApi } from "../services/eventsApi";
import { categoriesApi } from "../services/categoriesApi";
import { formatDateTime } from "../utils/dateTime";

const loading = ref(false);
const error = ref("");

const items = ref([]);
const total = ref(0);

const page = ref(1);
const size = ref(10);
const q = ref("");

const sortBy = ref("startDate");
const sortDir = ref("ASC");

const categoryId = ref(null);
const categories = ref([]);
const reportLoading = ref(false);
const reportError = ref("");

const reportStartDate = ref(getTodayDateInput());
const reportEndDate = ref(getTodayDateInput());
const report = ref({
  period: { startDate: null, endDate: null },
  total: 0,
  byStatus: [
    { status: "scheduled", total: 0 },
    { status: "canceled", total: 0 },
  ],
  byCategory: [],
});

const categoryItems = computed(() => [
  { title: "Todas", value: null },
  ...categories.value.map((c) => ({ title: c.name, value: c.id })),
]);

const sortByItems = [
  { title: "Data de início", value: "startDate" },
  { title: "Data de criação", value: "createdAt" },
];

const sortDirItems = [
  { title: "Crescente (ASC)", value: "ASC" },
  { title: "Decrescente (DESC)", value: "DESC" },
];

const pageCount = computed(() =>
  Math.max(1, Math.ceil(total.value / size.value)),
);

const reportPeriodLabel = computed(() => {
  if (!reportStartDate.value || !reportEndDate.value) {
    return "não definido";
  }
  return `${formatDateOnly(reportStartDate.value)} até ${formatDateOnly(reportEndDate.value)}`;
});

const scheduledTotal = computed(
  () =>
    report.value.byStatus.find((item) => item.status === "scheduled")?.total ??
    0,
);

const canceledTotal = computed(
  () =>
    report.value.byStatus.find((item) => item.status === "canceled")?.total ??
    0,
);

let qTimer = null;
watch(q, () => {
  // Debounce simples para não bater na API a cada tecla.
  if (qTimer) clearTimeout(qTimer);
  qTimer = setTimeout(() => {
    page.value = 1;
    refresh();
  }, 300);
});

watch([page, size, sortBy, sortDir], () => {
  refresh();
});

watch(categoryId, () => {
  page.value = 1;
  refresh();
});

async function refresh() {
  loading.value = true;
  error.value = "";
  try {
    const data = await eventsApi.list({
      page: page.value,
      size: size.value,
      q: q.value,
      sortBy: sortBy.value,
      sortDir: sortDir.value,
      categoryId: categoryId.value,
    });

    items.value = data.items;
    total.value = data.total;

    // Se o usuário reduziu size e a página atual ficou inválida.
    if (page.value > pageCount.value) {
      page.value = pageCount.value;
    }
  } catch (e) {
    error.value = e?.message || "Erro ao carregar eventos.";
  } finally {
    loading.value = false;
  }
}

async function refreshReport() {
  reportError.value = "";

  if (!reportStartDate.value || !reportEndDate.value) {
    reportError.value = "Informe data inicial e final para consultar o relatório.";
    return;
  }

  if (reportStartDate.value > reportEndDate.value) {
    reportError.value = "A data inicial deve ser menor ou igual à data final.";
    return;
  }

  const bounds = dateRangeInputToIso(reportStartDate.value, reportEndDate.value);
  reportLoading.value = true;

  try {
    const data = await eventsApi.report(bounds);
    report.value = data;
  } catch (e) {
    reportError.value = e?.message || "Erro ao consultar relatório de eventos.";
  } finally {
    reportLoading.value = false;
  }
}

const deleteDialog = ref(false);
const deleting = ref(null);
const deletingLoading = ref(false);

function openDelete(ev) {
  deleting.value = ev;
  deleteDialog.value = true;
}

async function confirmDelete() {
  if (!deleting.value) return;
  deletingLoading.value = true;
  try {
    await eventsApi.remove(deleting.value.id);
    deleteDialog.value = false;
    deleting.value = null;
    refresh();
  } catch (e) {
    error.value = e?.message || "Erro ao excluir evento.";
  } finally {
    deletingLoading.value = false;
  }
}

onMounted(() => {
  (async () => {
    try {
      categories.value = await categoriesApi.list();
    } catch {
      // Sem bloquear a tela de eventos caso categorias estejam indisponíveis.
      categories.value = [];
    }

    refresh();
    refreshReport();
  })();
});

function getTodayDateInput() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateOnly(value) {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function dateRangeInputToIso(startDateInput, endDateInput) {
  const start = new Date(`${startDateInput}T00:00:00`);
  const end = new Date(`${endDateInput}T23:59:59.999`);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
