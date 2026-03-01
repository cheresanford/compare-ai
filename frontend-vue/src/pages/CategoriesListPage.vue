<template>
  <v-container class="py-8" style="max-width: 1100px">
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <div class="text-h5">Categorias</div>
        <div class="text-body-2 text-medium-emphasis">
          Busca e registras novas categorias.
        </div>
      </div>
      <v-btn color="primary" :to="{ name: 'categories-new' }"
        >Nova categoria</v-btn
      >
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
          />

          <v-spacer />

          <v-btn variant="tonal" @click="refresh" :loading="loading">
            Atualizar
          </v-btn>
        </div>

        <v-divider class="my-4" />

        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>

        <v-table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Nome</th>
              <th class="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!loading && items.length === 0">
              <td colspan="3" class="text-medium-emphasis">
                Nenhum evento encontrado.
              </td>
            </tr>
            <tr v-for="category in items" :key="category.id">
              asdas
              <td class="font-weight-medium">{{ category.id }}</td>
              <td class="font-weight-medium">{{ category.name }}</td>
              <td>
                <v-btn
                  size="small"
                  variant="text"
                  :to="{
                    name: 'categories-detail',
                    params: { id: category.id },
                  }"
                >
                  Ver
                </v-btn>
                <v-btn
                  size="small"
                  variant="text"
                  :to="{ name: 'categories-edit', params: { id: category.id } }"
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

async function refresh() {
  loading.value = true;
  error.value = "";
  try {
    const data = await categoriesApi.listAll();

    items.value = data;
  } catch (e) {
    error.value = e?.message || "Erro ao carregar eventos.";
  } finally {
    loading.value = false;
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
    await categoriesApi.remove(deleting.value.id);
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
  refresh();
});
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
