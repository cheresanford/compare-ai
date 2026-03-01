<template>
  <v-container class="py-8" style="max-width: 900px;">
    <v-card class="pa-6" elevation="4">
      <v-card-title class="text-h6 mb-2">Event details</v-card-title>

      <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
        {{ error }}
      </v-alert>

      <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

      <v-list v-if="event">
        <v-list-item title="Title" :subtitle="event.title" />
        <v-list-item title="Start" :subtitle="formatDate(event.startDate)" />
        <v-list-item title="End" :subtitle="formatDate(event.endDate)" />
        <v-list-item title="Status" :subtitle="formatStatus(event.status)" />
        <v-list-item title="Organizer" :subtitle="event.organizerEmail" />
        <v-list-item title="Location" :subtitle="event.location" />
        <v-list-item title="Category" :subtitle="event.category || 'Not informed'" />
        <v-list-item title="Created" :subtitle="formatDate(event.createdAt)" />
      </v-list>

      <div class="d-flex align-center gap-3 mt-4">
        <v-btn variant="text" @click="goBack">Back</v-btn>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="goToEdit">Edit</v-btn>
        <v-btn color="error" variant="text" @click="confirmDelete">Delete</v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { deleteEvent, getEvent } from '../services/eventsApi';

const route = useRoute();
const router = useRouter();

const event = ref(null);
const loading = ref(false);
const error = ref('');

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('pt-BR');
}

function formatStatus(status) {
  if (status === 'cancelled') return 'Cancelled';
  return 'Scheduled';
}

async function loadEvent() {
  loading.value = true;
  error.value = '';
  try {
    event.value = await getEvent(route.params.id);
  } catch (err) {
    error.value = err.message || 'Failed to load event';
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push({ name: 'events' });
}

function goToEdit() {
  router.push({ name: 'event-edit', params: { id: route.params.id } });
}

async function confirmDelete() {
  if (!event.value) return;
  const ok = window.confirm(`Delete event "${event.value.title}"?`);
  if (!ok) return;
  try {
    await deleteEvent(event.value.id);
    router.push({ name: 'events' });
  } catch (err) {
    error.value = err.message || 'Failed to delete event';
  }
}

onMounted(() => {
  loadEvent();
});
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
