<template>
  <v-card>
    <v-card-title prepend-icon="mdi-plus" primary-title>
      <b>Novo Evento</b>
    </v-card-title>
    <v-card-text>
      <v-layout row wrap>
        <v-row>
          <v-col cols="12">
            <v-text-field
              label="Título do Evento"
              v-model="eventoDTOPayload.titulo"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <VDateInput
              v-model="eventoDTOPayload.dataInicio"
              label="Início do Evento"
            ></VDateInput>
          </v-col>
          <v-col cols="12">
            <VDateInput
              v-model="eventoDTOPayload.dataTermino"
              label="Termino do Evento"
              :allowed-dates="(v) => (v as Date) >= eventoDTOPayload.dataInicio"
            ></VDateInput>
          </v-col>
          <v-col cols="12">
            <v-switch label="Agendado?" v-model="eventoDTOPayload.status">
              <template v-slot:prepend>
                <v-icon v-if="!eventoDTOPayload.status" color="error"
                  >mdi-cancel</v-icon
                >
                <v-icon v-else color="success">mdi-check</v-icon>
              </template>
            </v-switch>
          </v-col>
          <v-col cols="12">
            <v-text-field
              required
              v-model="eventoDTOPayload.organizadorEmail"
              label="E-mail do organizador"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-layout>
    </v-card-text>
    <v-card-actions>
      <v-btn
        :loading="loading"
        prepend-icon="mdi-check"
        color="success"
        @click="handleCreate"
        >Salvar</v-btn
      >
      <v-btn
        prepend-icon="mdi-cancel"
        color="error"
        @click="closeCreateEventoModal()"
        >Cancelar</v-btn
      >
    </v-card-actions>
    <v-snackbar color="error" v-model="hasError" timeout="3000">
      Erro na request: {{ errorMsg }}
    </v-snackbar>

    <v-snackbar color="success" v-model="hasSuccess" timeout="3000">
      Evento criado com sucesso!
    </v-snackbar>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import type CreateEventoDTO from "../../composables/api/types/createEventoDTO";
import { ref } from "vue";
import { VDateInput } from "vuetify/labs/VDateInput";

const eventoDTOPayload = ref<CreateEventoDTO>({
  titulo: "bla",
  dataInicio: new Date(),
  dataTermino: new Date(),
  status: false,
  organizadorEmail: "",
  categoria: "",
});

const hasError = ref(false);
const hasSuccess = ref(false);
const errorMsg = ref("");

const props = defineProps({
  createFunction: {
    type: Function,
    required: true,
  },
  closeCreateEventoModal: {
    type: Function,
    required: true,
  },
  loading: {
    type: Boolean,
  },
});

const handleCreate = () => {
  props.createFunction("/eventos", eventoDTOPayload.value).then((resp) => {
    if (resp.error || resp.statusCode != 200 || resp.statusCode != 201) {
      hasError.value = true;
      let mensagensDeErro = "";

      resp.message.forEach((element) => {
        mensagensDeErro += element + "\n";
      });

      errorMsg.value = mensagensDeErro;
    } else {
      hasSuccess.value = true;
    }
  });
};
</script>

<style lang="scss" scoped></style>
