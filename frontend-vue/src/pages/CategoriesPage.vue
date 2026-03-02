<template>
  <v-container class="py-8" style="max-width: 900px">
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <div class="text-h5">Categorias</div>
        <div class="text-body-2 text-medium-emphasis">
          Crie, renomeie e remova categorias de eventos.
        </div>
      </div>
      <v-btn variant="text" :to="{ name: 'events-list' }">Voltar</v-btn>
    </div>

    <v-card elevation="4" class="mb-4">
      <v-card-text>
        <div class="text-subtitle-1 mb-2">Nova categoria</div>
        <div class="d-flex flex-wrap gap-3 align-center">
          <v-text-field
            v-model="newName"
            label="Nome da categoria"
            variant="outlined"
            density="comfortable"
            hide-details
            style="min-width: 280px"
          />
          <v-btn color="primary" @click="createCategory" :loading="creating">
            Criar
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-card elevation="4">
      <v-card-text>
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>

        <v-table density="comfortable">
          <thead>
            <tr>
              <th>Nome</th>
              <th class="text-right">Acoes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!loading && categories.length === 0">
              <td colspan="2" class="text-medium-emphasis">
                Nenhuma categoria cadastrada.
              </td>
            </tr>
            <tr v-for="cat in categories" :key="cat.id">
              <td class="font-weight-medium">{{ cat.name }}</td>
              <td class="text-right">
                <v-btn size="small" variant="text" @click="openEdit(cat)">
                  Renomear
                </v-btn>
                <v-btn
                  size="small"
                  variant="text"
                  color="error"
                  @click="openDelete(cat)"
                >
                  Remover
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="editDialog" max-width="520">
      <v-card>
        <v-card-title>Renomear categoria</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editName"
            label="Nome da categoria"
            variant="outlined"
            density="comfortable"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="editDialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="saveEdit" :loading="editing">
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="520">
      <v-card>
        <v-card-title>Confirmar remocao</v-card-title>
        <v-card-text>
          Tem certeza que deseja remover a categoria
          <strong>{{ deleting?.name }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" @click="confirmDelete" :loading="deletingLoading">
            Remover
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { categoriesApi } from "../services/categoriesApi";

const categories = ref([]);
const loading = ref(false);
const error = ref("");

const newName = ref("");
const creating = ref(false);

const editDialog = ref(false);
const editing = ref(false);
const editingCategory = ref(null);
const editName = ref("");

const deleteDialog = ref(false);
const deleting = ref(null);
const deletingLoading = ref(false);

function validateName(name) {
  const normalized = name.trim().replace(/\s+/g, " ");
  if (normalized.length < 2 || normalized.length > 60) {
    return "Nome deve ter entre 2 e 60 caracteres.";
  }
  return null;
}

async function fetchCategories() {
  loading.value = true;
  error.value = "";
  try {
    categories.value = await categoriesApi.list();
  } catch (e) {
    error.value = e?.message || "Erro ao carregar categorias.";
  } finally {
    loading.value = false;
  }
}

async function createCategory() {
  error.value = "";
  const validation = validateName(newName.value || "");
  if (validation) {
    error.value = validation;
    return;
  }

  creating.value = true;
  try {
    await categoriesApi.create({ name: newName.value });
    newName.value = "";
    await fetchCategories();
  } catch (e) {
    error.value = e?.message || "Erro ao criar categoria.";
  } finally {
    creating.value = false;
  }
}

function openEdit(cat) {
  editingCategory.value = cat;
  editName.value = cat.name;
  editDialog.value = true;
}

async function saveEdit() {
  if (!editingCategory.value) return;
  error.value = "";
  const validation = validateName(editName.value || "");
  if (validation) {
    error.value = validation;
    return;
  }

  editing.value = true;
  try {
    await categoriesApi.update(editingCategory.value.id, {
      name: editName.value,
    });
    editDialog.value = false;
    editingCategory.value = null;
    await fetchCategories();
  } catch (e) {
    error.value = e?.message || "Erro ao renomear categoria.";
  } finally {
    editing.value = false;
  }
}

function openDelete(cat) {
  deleting.value = cat;
  deleteDialog.value = true;
}

async function confirmDelete() {
  if (!deleting.value) return;
  error.value = "";
  deletingLoading.value = true;
  try {
    await categoriesApi.remove(deleting.value.id);
    deleteDialog.value = false;
    deleting.value = null;
    await fetchCategories();
  } catch (e) {
    error.value = e?.message || "Erro ao remover categoria.";
  } finally {
    deletingLoading.value = false;
  }
}

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
