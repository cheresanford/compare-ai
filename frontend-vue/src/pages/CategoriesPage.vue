<template>
  <v-container class="py-8" style="max-width: 900px">
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <div class="text-h5">Categorias</div>
        <div class="text-body-2 text-medium-emphasis">
          Criar, renomear e remover.
        </div>
      </div>
      <v-btn variant="text" :to="{ name: 'events-list' }">Voltar</v-btn>
    </div>

    <v-card elevation="4">
      <v-card-text>
        <div class="d-flex flex-wrap gap-3 align-center">
          <v-text-field
            v-model="newName"
            label="Nova categoria"
            variant="outlined"
            density="comfortable"
            hide-details
            style="min-width: 280px"
            @keyup.enter="create"
          />
          <v-btn color="primary" @click="create" :loading="creating">
            Adicionar
          </v-btn>

          <v-spacer />

          <v-btn variant="tonal" @click="refresh" :loading="loading">
            Atualizar
          </v-btn>
        </div>

        <v-alert v-if="error" type="error" variant="tonal" class="mt-4">
          {{ error }}
        </v-alert>

        <v-divider class="my-4" />

        <v-table density="comfortable">
          <thead>
            <tr>
              <th>Nome</th>
              <th class="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!loading && items.length === 0">
              <td colspan="2" class="text-medium-emphasis">
                Nenhuma categoria cadastrada.
              </td>
            </tr>
            <tr v-for="cat in items" :key="cat.id">
              <td>{{ cat.name }}</td>
              <td class="text-right">
                <v-btn size="small" variant="text" @click="openRename(cat)">
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

    <v-dialog v-model="renameDialog" max-width="520">
      <v-card>
        <v-card-title>Renomear categoria</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="renameName"
            label="Nome"
            variant="outlined"
            :rules="nameRules"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="renameDialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="confirmRename" :loading="renaming">
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="520">
      <v-card>
        <v-card-title>Confirmar remoção</v-card-title>
        <v-card-text>
          Remover a categoria <strong>{{ deleting?.name }}</strong
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

const loading = ref(false);
const creating = ref(false);
const renaming = ref(false);

const error = ref("");
const items = ref([]);

const newName = ref("");

const nameRules = [
  (v) => !!v || "Nome é obrigatório.",
  (v) => v?.trim().length >= 2 || "Mínimo de 2 caracteres.",
  (v) => v?.trim().length <= 60 || "Máximo de 60 caracteres.",
];

async function refresh() {
  loading.value = true;
  error.value = "";
  try {
    items.value = await categoriesApi.list();
  } catch (e) {
    error.value = e?.message || "Erro ao carregar categorias.";
  } finally {
    loading.value = false;
  }
}

async function create() {
  const name = newName.value.trim();
  if (name.length < 2 || name.length > 60) {
    error.value = "Nome deve ter entre 2 e 60 caracteres.";
    return;
  }

  creating.value = true;
  error.value = "";
  try {
    await categoriesApi.create({ name });
    newName.value = "";
    await refresh();
  } catch (e) {
    error.value = e?.message || "Erro ao criar categoria.";
  } finally {
    creating.value = false;
  }
}

const renameDialog = ref(false);
const renamingCategory = ref(null);
const renameName = ref("");

function openRename(cat) {
  renamingCategory.value = cat;
  renameName.value = cat.name;
  renameDialog.value = true;
}

async function confirmRename() {
  const cat = renamingCategory.value;
  if (!cat) return;

  const name = renameName.value.trim();
  if (name.length < 2 || name.length > 60) {
    error.value = "Nome deve ter entre 2 e 60 caracteres.";
    return;
  }

  renaming.value = true;
  error.value = "";
  try {
    await categoriesApi.update(cat.id, { name });
    renameDialog.value = false;
    renamingCategory.value = null;
    await refresh();
  } catch (e) {
    error.value = e?.message || "Erro ao renomear categoria.";
  } finally {
    renaming.value = false;
  }
}

const deleteDialog = ref(false);
const deleting = ref(null);
const deletingLoading = ref(false);

function openDelete(cat) {
  deleting.value = cat;
  deleteDialog.value = true;
}

async function confirmDelete() {
  if (!deleting.value) return;

  deletingLoading.value = true;
  error.value = "";
  try {
    await categoriesApi.remove(deleting.value.id);
    deleteDialog.value = false;
    deleting.value = null;
    await refresh();
  } catch (e) {
    error.value = e?.message || "Erro ao remover categoria.";
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
