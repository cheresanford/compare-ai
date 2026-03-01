<template>
  <v-container class="py-8" style="max-width: 900px">
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <div class="text-h5">
          {{ isEdit ? "Editar Categoria" : "Novo Categoria" }}
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Preencha o nome da categoria.
        </div>
      </div>
      <v-btn variant="text" :to="{ name: 'categories-list' }">Voltar</v-btn>
    </div>

    <v-card elevation="4">
      <v-card-text>
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>

        <v-form ref="formRef" v-model="formValid" @submit.prevent="submit">
          <v-row>
            <v-col cols="12" md="8">
              <v-text-field
                v-model="form.name"
                label="Nome da Categoria"
                variant="outlined"
                :rules="rules.name"
                required
              />
            </v-col>
          </v-row>

          <div class="d-flex align-center justify-end gap-2">
            <v-btn variant="text" :to="{ name: 'categories-list' }"
              >Cancelar</v-btn
            >
            <v-btn color="primary" type="submit" :loading="saving">
              Salvar
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { categoriesApi } from "../services/categoriesApi";
import { isoToLocalInput, localInputToIso } from "../utils/dateTime";

const route = useRoute();
const router = useRouter();

const id = computed(() => (route.params.id ? Number(route.params.id) : null));
const isEdit = computed(() => Number.isFinite(id.value) && id.value > 0);

const formRef = ref(null);
const formValid = ref(false);

const saving = ref(false);
const loading = ref(false);
const error = ref("");

const statusItems = [
  { title: "Agendado", value: "scheduled" },
  { title: "Cancelado", value: "canceled" },
];

const form = ref({
  name: "",
});

const rules = {
  name: [
    (v) => !!v || "Nome da categoria é obrigatório.",
    (v) => v?.length >= 2 || "Mínimo de 2 caracteres.",
    (v) => v?.length <= 60 || "Máximo de 60 caracteres.",
  ],
};

async function load() {
  if (!isEdit.value) return;
  loading.value = true;
  error.value = "";
  try {
    const data = await categoriesApi.get(id.value);
    form.value = {
      name: data.name ?? "",
    };
  } catch (e) {
    error.value = e?.message || "Erro ao carregar evento.";
  } finally {
    loading.value = false;
  }
}

async function submit() {
  error.value = "";

  const result = await formRef.value?.validate?.();
  if (result && result.valid === false) return;

  const dto = {
    name: form.value.name,
  };

  saving.value = true;
  try {
    const saved = isEdit.value
      ? await categoriesApi.update(id.value, dto)
      : await categoriesApi.create(dto);

    router.push({ name: "categories-detail", params: { id: saved.id } });
  } catch (e) {
    error.value = e?.message || "Erro ao salvar categoria.";
  } finally {
    saving.value = false;
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
