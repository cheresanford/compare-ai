<template>
  <v-container class="py-8" style="max-width: 900px;">
    <v-card class="pa-6" elevation="4">
      <v-card-title class="text-h6 mb-2">
        {{ isEdit ? 'Edit event' : 'New event' }}
      </v-card-title>

      <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
        {{ error }}
      </v-alert>

      <v-form ref="formRef" v-model="formValid">
        <v-text-field
          v-model="form.title"
          label="Title"
          variant="outlined"
          :rules="[rules.required, rules.titleLength]"
        />

        <v-text-field
          v-model="form.location"
          label="Location"
          variant="outlined"
          :rules="[rules.required]"
        />

        <v-text-field
          v-model="form.organizerEmail"
          label="Organizer email"
          variant="outlined"
          :rules="[rules.required, rules.email]"
        />

        <v-select
          v-model="form.status"
          :items="statusOptions"
          label="Status"
          variant="outlined"
        />

        <v-text-field
          v-model="form.category"
          label="Category (optional)"
          variant="outlined"
        />

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.startDate"
              label="Start date"
              type="datetime-local"
              variant="outlined"
              :rules="[rules.required]"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.endDate"
              label="End date"
              type="datetime-local"
              variant="outlined"
              :rules="[rules.required, rules.endAfterStart]"
            />
          </v-col>
        </v-row>

        <div class="d-flex align-center gap-3 mt-4">
          <v-btn color="primary" :loading="loading" @click="submitForm">
            Save
          </v-btn>
          <v-btn variant="text" @click="goBack">Cancel</v-btn>
        </div>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createEvent, getEvent, updateEvent } from '../services/eventsApi';

const route = useRoute();
const router = useRouter();

const formRef = ref(null);
const formValid = ref(false);
const loading = ref(false);
const error = ref('');

const statusOptions = [
  { title: 'Scheduled', value: 'scheduled' },
  { title: 'Cancelled', value: 'cancelled' },
];

const form = ref({
  title: '',
  startDate: '',
  endDate: '',
  location: '',
  organizerEmail: '',
  status: 'scheduled',
  category: '',
});

const isEdit = computed(() => Boolean(route.params.id));

const rules = {
  required: (value) => (!!value ? true : 'Required'),
  titleLength: (value) => {
    if (!value) return 'Required';
    if (value.length < 3 || value.length > 100) return 'Title must be 3-100 characters';
    return true;
  },
  email: (value) => {
    if (!value) return 'Required';
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    return ok ? true : 'Invalid email';
  },
  endAfterStart: (value) => {
    if (!value || !form.value.startDate) return true;
    const start = new Date(form.value.startDate);
    const end = new Date(value);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return true;
    return end.getTime() > start.getTime() || 'End date must be after start date';
  },
};

function toInputDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (num) => String(num).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toIso(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

async function loadEvent() {
  if (!isEdit.value) return;
  loading.value = true;
  error.value = '';
  try {
    const data = await getEvent(route.params.id);
    form.value = {
      title: data.title || '',
      startDate: toInputDateTime(data.startDate),
      endDate: toInputDateTime(data.endDate),
      location: data.location || '',
      organizerEmail: data.organizerEmail || '',
      status: data.status || 'scheduled',
      category: data.category || '',
    };
  } catch (err) {
    error.value = err.message || 'Failed to load event';
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push({ name: 'events' });
}

async function submitForm() {
  const formInstance = formRef.value;
  if (!formInstance) return;
  const { valid } = await formInstance.validate();
  if (!valid) return;

  loading.value = true;
  error.value = '';

  const payload = {
    title: form.value.title.trim(),
    startDate: toIso(form.value.startDate),
    endDate: toIso(form.value.endDate),
    location: form.value.location.trim(),
    organizerEmail: form.value.organizerEmail.trim(),
    status: form.value.status,
    category: form.value.category ? form.value.category.trim() : null,
  };

  try {
    if (isEdit.value) {
      await updateEvent(route.params.id, payload);
    } else {
      await createEvent(payload);
    }
    router.push({ name: 'events' });
  } catch (err) {
    error.value = err.message || 'Failed to save event';
  } finally {
    loading.value = false;
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
