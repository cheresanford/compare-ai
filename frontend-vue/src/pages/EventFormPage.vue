<template>
  <v-container class="py-8" style="max-width: 900px">
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <div class="text-h5">
          {{ isEdit ? "Editar evento" : "Novo evento" }}
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Preencha os dados do evento.
        </div>
      </div>
      <v-btn variant="text" :to="{ name: 'events-list' }">Voltar</v-btn>
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
                v-model="form.title"
                label="Título"
                variant="outlined"
                :rules="rules.title"
                required
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="form.status"
                label="Status"
                variant="outlined"
                :items="statusItems"
                item-title="title"
                item-value="value"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.startDate"
                label="Data de início"
                type="datetime-local"
                variant="outlined"
                :rules="rules.startDate"
                required
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.endDate"
                label="Data de término"
                type="datetime-local"
                variant="outlined"
                :rules="rules.endDate"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.organizerEmail"
                label="E-mail do organizador"
                variant="outlined"
                :rules="rules.organizerEmail"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.location"
                label="Local"
                variant="outlined"
                :rules="rules.location"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                :items="itemsMenu"
                v-model="form.categoryId"
                item-title="name"
                item-value="id"
                label="Selecione a Categoria"
              ></v-select>
            </v-col>
          </v-row>

          <div class="d-flex align-center justify-end gap-2">
            <v-btn variant="text" :to="{ name: 'events-list' }">Cancelar</v-btn>
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
import { eventsApi } from "../services/eventsApi";
import { isoToLocalInput, localInputToIso } from "../utils/dateTime";
import { categoriesApi } from "../services/categoriesApi";

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

const itemsMenu = ref([]);

const form = ref({
  title: "",
  startDate: "",
  endDate: "",
  location: "",
  organizerEmail: "",
  status: "scheduled",
  categoryId: "",
});

const rules = {
  title: [
    (v) => !!v || "Título é obrigatório.",
    (v) => v?.length >= 3 || "Mínimo de 3 caracteres.",
    (v) => v?.length <= 100 || "Máximo de 100 caracteres.",
  ],
  organizerEmail: [
    (v) => !!v || "E-mail é obrigatório.",
    (v) => /.+@.+\..+/.test(v) || "E-mail inválido.",
  ],
  location: [
    (v) => !!v || "Local é obrigatório.",
    (v) => v?.length <= 255 || "Máximo de 255 caracteres.",
  ],
  startDate: [(v) => !!v || "Data de início é obrigatória."],
  endDate: [
    (v) => !!v || "Data de término é obrigatória.",
    () => {
      const startIso = localInputToIso(form.value.startDate);
      const endIso = localInputToIso(form.value.endDate);
      if (!startIso || !endIso) return true;
      return (
        new Date(endIso).getTime() > new Date(startIso).getTime() ||
        "Término deve ser maior que início."
      );
    },
  ],
};

async function load() {
  const data = await categoriesApi.listAll();
  console.log("data: ", data);
  itemsMenu.value = data;
  if (!isEdit.value) return;
  loading.value = true;
  error.value = "";
  try {
    const data = await eventsApi.get(id.value);
    form.value = {
      title: data.title ?? "",
      startDate: isoToLocalInput(data.startDate),
      endDate: isoToLocalInput(data.endDate),
      location: data.location ?? "",
      organizerEmail: data.organizerEmail ?? "",
      status: data.status ?? "scheduled",
      categoryId: data.category.id ?? "",
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
    title: form.value.title,
    startDate: localInputToIso(form.value.startDate),
    endDate: localInputToIso(form.value.endDate),
    location: form.value.location,
    organizerEmail: form.value.organizerEmail,
    status: form.value.status,
    categoryId: Number(form.value.categoryId) || undefined,
  };

  saving.value = true;
  try {
    const saved = isEdit.value
      ? await eventsApi.update(id.value, dto)
      : await eventsApi.create(dto);

    router.push({ name: "events-detail", params: { id: saved.id } });
  } catch (e) {
    error.value = e?.message || "Erro ao salvar evento.";
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
