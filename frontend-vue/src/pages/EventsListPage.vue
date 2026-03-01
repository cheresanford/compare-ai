<template>
  <v-container class="py-8">
    <v-card class="pa-4" elevation="4">
      <div class="d-flex flex-wrap align-center gap-4">
        <v-text-field
          v-model="search"
          label="Search by title"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          style="min-width: 220px;"
        />
        <v-select
          v-model="sortBy"
          :items="sortOptions"
          label="Sort by"
          variant="outlined"
          density="compact"
          hide-details
          style="min-width: 160px;"
        />
        <v-select
          v-model="sortDir"
          :items="dirOptions"
          label="Order"
          variant="outlined"
          density="compact"
          hide-details
          style="min-width: 140px;"
        />
        <v-select
          v-model="size"
          :items="sizeOptions"
          label="Page size"
          variant="outlined"
          density="compact"
          hide-details
          style="min-width: 140px;"
        />
        <v-spacer />
        <v-btn color="primary" @click="goToNew">New event</v-btn>
      </div>

      <v-alert v-if="error" type="error" variant="tonal" class="mt-4">
        {{ error }}
      </v-alert>

      <v-data-table
        class="mt-4"
        :headers="headers"
        :items="items"
        :loading="loading"
        item-value="id"
        density="comfortable"
        hide-default-footer
      >
        <template #item.startDate="{ item }">
          {{ formatDate(unwrapRow(item).startDate) }}
        </template>
        <template #item.endDate="{ item }">
          {{ formatDate(unwrapRow(item).endDate) }}
        </template>
        <template #item.status="{ item }">
          <v-chip size="small" :color="unwrapRow(item).status === 'cancelled' ? 'error' : 'success'" variant="tonal">
            {{ unwrapRow(item).status === 'cancelled' ? 'Cancelled' : 'Scheduled' }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn size="small" variant="text" @click="goToDetail(unwrapRow(item).id)">View</v-btn>
          <v-btn size="small" variant="text" @click="goToEdit(unwrapRow(item).id)">Edit</v-btn>
          <v-btn size="small" variant="text" color="error" @click="confirmDelete(unwrapRow(item))">Delete</v-btn>
        </template>
      </v-data-table>

      <div class="d-flex flex-wrap align-center justify-space-between mt-4 gap-2">
        <div class="text-body-2">Total: {{ total }}</div>
        <v-pagination v-model="page" :length="pageCount" total-visible="5" />
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { deleteEvent, listEvents } from '../services/eventsApi';

const router = useRouter();

const headers = [
  { title: 'Title', key: 'title', sortable: false },
  { title: 'Start', key: 'startDate', sortable: false },
  { title: 'End', key: 'endDate', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Organizer', key: 'organizerEmail', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false },
];

const sortOptions = [
  { title: 'Start date', value: 'startDate' },
  { title: 'Created at', value: 'createdAt' },
];

const dirOptions = [
  { title: 'Ascending', value: 'asc' },
  { title: 'Descending', value: 'desc' },
];

const sizeOptions = [5, 10, 20, 50];

const items = ref([]);
const total = ref(0);
const pageCount = ref(1);
const loading = ref(false);
const error = ref('');

const search = ref('');
const page = ref(1);
const size = ref(10);
const sortBy = ref('startDate');
const sortDir = ref('asc');

let searchTimeout = null;

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('pt-BR');
}

function unwrapRow(item) {
  return item?.raw ?? item ?? {};
}

async function fetchEvents() {
  loading.value = true;
  error.value = '';
  try {
    const data = await listEvents({
      search: search.value,
      page: page.value,
      size: size.value,
      sortBy: sortBy.value,
      sortDir: sortDir.value,
    });
    items.value = data.items || [];
    total.value = data.total || 0;
    pageCount.value = data.pageCount || 1;
    if (page.value > pageCount.value) {
      page.value = pageCount.value;
    }
  } catch (err) {
    error.value = err.message || 'Failed to load events';
  } finally {
    loading.value = false;
  }
}

function goToNew() {
  router.push({ name: 'event-new' });
}

function goToDetail(id) {
  router.push({ name: 'event-detail', params: { id } });
}

function goToEdit(id) {
  router.push({ name: 'event-edit', params: { id } });
}

async function confirmDelete(event) {
  const ok = window.confirm(`Delete event "${event.title}"?`);
  if (!ok) return;
  try {
    await deleteEvent(event.id);
    await fetchEvents();
  } catch (err) {
    error.value = err.message || 'Failed to delete event';
  }
}

watch([page, size, sortBy, sortDir], () => {
  fetchEvents();
});

watch(search, () => {
  page.value = 1;
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchEvents();
  }, 400);
});

onMounted(() => {
  fetchEvents();
});
</script>

<style scoped>
.gap-4 {
  gap: 16px;
}
</style>
