import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { toLocalDateTimeInput } from "../utils/date";

function validate(form) {
  const errors = {};

  if (!form.title || form.title.trim().length < 3 || form.title.trim().length > 100) {
    errors.title = "Título deve ter entre 3 e 100 caracteres";
  }

  if (!form.organizerEmail || !/^\S+@\S+\.\S+$/.test(form.organizerEmail)) {
    errors.organizerEmail = "E-mail do organizador inválido";
  }

  const startDate = new Date(form.startDate);
  const endDate = new Date(form.endDate);

  if (Number.isNaN(startDate.getTime())) {
    errors.startDate = "Data de início inválida";
  }

  if (Number.isNaN(endDate.getTime())) {
    errors.endDate = "Data de término inválida";
  }

  if (!errors.startDate && !errors.endDate && endDate <= startDate) {
    errors.endDate = "Data de término deve ser maior que a data de início";
  }

  if (!form.location || !form.location.trim()) {
    errors.location = "Local é obrigatório";
  }

  if (!form.status) {
    errors.status = "Status é obrigatório";
  }

  return errors;
}

export function EventForm({
  initialValue,
  options,
  submitting,
  submitError,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState(() => ({
    title: initialValue?.title || "",
    startDate: toLocalDateTimeInput(initialValue?.startDate),
    endDate: toLocalDateTimeInput(initialValue?.endDate),
    location: initialValue?.location || "",
    organizerEmail: initialValue?.user?.email || "",
    organizerName: initialValue?.user?.name || "",
    status: initialValue?.status?.name || "agendado",
    categoryId: initialValue?.category?.id || "",
  }));

  const [errors, setErrors] = useState({});

  const statusOptions = useMemo(() => options?.statuses || [], [options]);
  const categoryOptions = useMemo(() => options?.categories || [], [options]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit({
      title: form.title.trim(),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      location: form.location.trim(),
      organizerEmail: form.organizerEmail.trim(),
      organizerName: form.organizerName?.trim() || undefined,
      status: form.status,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {submitError && <Alert severity="error">{submitError}</Alert>}

        <TextField
          label="Título"
          value={form.title}
          onChange={handleChange("title")}
          error={Boolean(errors.title)}
          helperText={errors.title}
          required
        />

        <TextField
          label="Data de início"
          type="datetime-local"
          value={form.startDate}
          onChange={handleChange("startDate")}
          error={Boolean(errors.startDate)}
          helperText={errors.startDate}
          InputLabelProps={{ shrink: true }}
          required
        />

        <TextField
          label="Data de término"
          type="datetime-local"
          value={form.endDate}
          onChange={handleChange("endDate")}
          error={Boolean(errors.endDate)}
          helperText={errors.endDate}
          InputLabelProps={{ shrink: true }}
          required
        />

        <TextField
          label="Local"
          value={form.location}
          onChange={handleChange("location")}
          error={Boolean(errors.location)}
          helperText={errors.location}
          required
        />

        <TextField
          label="E-mail do organizador"
          value={form.organizerEmail}
          onChange={handleChange("organizerEmail")}
          error={Boolean(errors.organizerEmail)}
          helperText={errors.organizerEmail}
          required
        />

        <TextField
          label="Nome do organizador (opcional)"
          value={form.organizerName}
          onChange={handleChange("organizerName")}
        />

        <FormControl required error={Boolean(errors.status)}>
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            label="Status"
            value={form.status}
            onChange={handleChange("status")}
          >
            {statusOptions.map((status) => (
              <MenuItem key={status.id} value={status.name}>
                {status.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel id="category-label">Categoria</InputLabel>
          <Select
            labelId="category-label"
            label="Categoria"
            value={form.categoryId}
            onChange={handleChange("categoryId")}
          >
            <MenuItem value="">Sem categoria</MenuItem>
            {categoryOptions.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Salvando..." : "Salvar"}
          </Button>
          <Button type="button" variant="text" onClick={onCancel}>
            Cancelar
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

