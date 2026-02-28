<template>
  <v-container class="py-12 ga-8">
    <v-card elevation="4" class="pa-6 ga-8">
      <v-card-title class="text-h5 mb-2">Listagem de Eventos </v-card-title>
      <v-card-text> Veja seus próximos eventos! </v-card-text>
    </v-card>

    <v-text-field
      class="mt-4 mb-4"
      hide-details="auto"
      v-model="searchQuery"
      label="Pesquisar Items"
    ></v-text-field>

    <v-btn
      :prepend-icon="'mdi-plus'"
      color="primary"
      @click="openCreateEventoModal"
      >Registrar Novo Evento</v-btn
    >
    <v-dialog
      v-model="showCreate"
      scrollable
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <CreateEventoForm
        :createFunction="postRequest"
        :closeCreateEventoModal="closeCreateEventoModal"
        :loading="loading"
      ></CreateEventoForm>
    </v-dialog>

    <v-data-table
      :headers="headers"
      :loading="loading"
      :items="items"
      class="elevation-1"
      :search="searchQuery"
    >
      <template #item.acoes="{ item }">
        <v-icon>mdi-pencil</v-icon>
        <v-icon @click="handleEventoDeletion(item.id)" color="red"
          >mdi-delete</v-icon
        >
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup lang="ts">
import CreateEventoForm from "./CreateEventoForm.vue";
import { defineComponent, onMounted, ref } from "vue";
import { useApi } from "../../composables/api/useApi";
const { getRequest, postRequest, putRequest, deleteRequest, loading } =
  useApi("eventos");
const searchQuery = ref("");
const showCreate = ref<boolean>(false);

const headers = ref([
  { title: "ID", value: "id", align: "start" },
  { title: "Título", value: "titulo", align: "end" },
  { title: "Início do Evento", value: "dataInicio", align: "start" },
  { title: "Fim do Evento", value: "dataTermino", align: "start" },
  { title: "Organizador", value: "organizadorEmail", align: "end" },
  { title: "Ações", value: "acoes", align: "end" },
]);

const openCreateEventoModal = () => {
  showCreate.value = true;
};

const closeCreateEventoModal = () => {
  showCreate.value = false;
};

const handleEventoDeletion = (itemid: Number) => {
  deleteRequest("/eventos/" + itemid).then((resp) => {
    getRequest("/eventos");
  });
};

onMounted(() => {
  getRequest("/eventos").then((resp) => {
    items.value = resp.data;
  });
});

const items = ref([]);
</script>
