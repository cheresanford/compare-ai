<template>
  <v-container class="py-12">
    <v-card elevation="4" class="pa-6">
      <v-card-title class="text-h5 mb-2">Relatórios</v-card-title>

      <v-row density="comfortable">
        <v-col cols="12" md="6">
          <v-date-input
            v-model="filtersDate.startDate"
            label="Select a date"
            prepend-icon=""
            prepend-inner-icon="$calendar"
            variant="solo"
          ></v-date-input>
        </v-col>

        <v-col cols="12" md="6">
          <v-date-input
            v-model="filtersDate.endDate"
            label="Select a date"
            prepend-icon=""
            variant="solo"
          ></v-date-input>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { VDateInput } from "vuetify/labs/VDateInput";
import { eventsApi } from "../services/eventsApi";

const error = ref("");
const loading = ref(false);

const filtersDate = ref({
  startDate: "",
  endDate: "",
});

const rules = {
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

function getCurrentDate() {
  const today = new Date();
  const startDate =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const endDate =
    today.getFullYear() +
    "-" +
    (today.getMonth() + 1) +
    "-" +
    today.getDate() +
    1;
  return {
    startDate: startDate,
    endDate: endDate,
  };
}

async function callRelatorio(startDate, endDate) {
  loading.value = true;
  error.value = "";
  console.log("startDate", startDate, "endDate", endDate);
  try {
    const response = await eventsApi.relatorios(startDate, endDate);
    console.log(response);
  } catch (e) {
    error.value = e.massage;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  filtersDate.value = getCurrentDate();
  console.log("filters", filtersDate.value);
  callRelatorio(filtersDate.value.startDate, filtersDate.value.endDate);
});
</script>
