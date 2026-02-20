import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import {
  createEvent,
  getEventDetails,
  listCategoryOptions,
  listStatusOptions,
  updateEvent,
} from "../api/eventsApi";

function toInputDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (num) => String(num).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

const INITIAL_FORM = {
  title: "",
  startDate: "",
  endDate: "",
  location: "",
  organizerName: "",
  organizerEmail: "",
  statusId: "",
  categoryId: "",
};

export function EventFormDialog({ open, mode, eventId, onClose, onSaved }) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState(INITIAL_FORM);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    let isActive = true;
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [categoryOptions, statusOptions] = await Promise.all([
          listCategoryOptions(),
          listStatusOptions(),
        ]);

        if (!isActive) return;

        setCategories(categoryOptions || []);
        setStatuses(statusOptions || []);

        if (isEdit && eventId) {
          const details = await getEventDetails(eventId);
          if (!isActive) return;

          setForm({
            title: details.title || "",
            startDate: toInputDateTime(details.startDate),
            endDate: toInputDateTime(details.endDate),
            location: details.location || "",
            organizerName: details.organizer?.name || "",
            organizerEmail: details.organizer?.email || "",
            statusId: details.status?.id ? String(details.status.id) : "",
            categoryId: details.category?.id ? String(details.category.id) : "",
          });
        } else {
          setForm((previous) => ({
            ...INITIAL_FORM,
            statusId:
              previous.statusId ||
              (statusOptions?.length ? String(statusOptions[0].id) : ""),
          }));
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError.message || "Erro ao carregar dados do formulário.",
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isActive = false;
    };
  }, [open, isEdit, eventId]);

  const validationErrors = useMemo(() => {
    const errors = {};

    if (form.title.trim().length < 3 || form.title.trim().length > 100) {
      errors.title = "Título deve ter entre 3 e 100 caracteres.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.organizerEmail.trim())) {
      errors.organizerEmail = "E-mail do organizador inválido.";
    }

    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);
    if (
      form.startDate &&
      form.endDate &&
      !Number.isNaN(startDate.getTime()) &&
      !Number.isNaN(endDate.getTime()) &&
      endDate.getTime() <= startDate.getTime()
    ) {
      errors.endDate = "Data de término deve ser maior que a data de início.";
    }

    if (!form.statusId) {
      errors.statusId = "Selecione um status.";
    }

    return errors;
  }, [form]);

  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit() {
    setError("");

    if (hasValidationErrors) {
      setError("Corrija os erros antes de salvar.");
      return;
    }

    setSaving(true);
    try {
      if (isEdit && eventId) {
        await updateEvent(eventId, form);
      } else {
        await createEvent(form);
      }

      onSaved();
    } catch (saveError) {
      setError(saveError.message || "Erro ao salvar evento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? "Editar evento" : "Novo evento"}</DialogTitle>

      <DialogContent dividers>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Stack spacing={2}>
          <TextField
            label="Título"
            value={form.title}
            onChange={(event) => handleChange("title", event.target.value)}
            error={Boolean(validationErrors.title)}
            helperText={validationErrors.title}
            disabled={loading || saving}
            fullWidth
          />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Data de início"
              type="datetime-local"
              value={form.startDate}
              onChange={(event) =>
                handleChange("startDate", event.target.value)
              }
              InputLabelProps={{ shrink: true }}
              disabled={loading || saving}
              fullWidth
            />

            <TextField
              label="Data de término"
              type="datetime-local"
              value={form.endDate}
              onChange={(event) => handleChange("endDate", event.target.value)}
              InputLabelProps={{ shrink: true }}
              error={Boolean(validationErrors.endDate)}
              helperText={validationErrors.endDate}
              disabled={loading || saving}
              fullWidth
            />
          </Stack>

          <TextField
            label="Local"
            value={form.location}
            onChange={(event) => handleChange("location", event.target.value)}
            disabled={loading || saving}
            fullWidth
          />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Nome do organizador"
              value={form.organizerName}
              onChange={(event) =>
                handleChange("organizerName", event.target.value)
              }
              disabled={loading || saving}
              fullWidth
            />

            <TextField
              label="E-mail do organizador"
              value={form.organizerEmail}
              onChange={(event) =>
                handleChange("organizerEmail", event.target.value)
              }
              error={Boolean(validationErrors.organizerEmail)}
              helperText={validationErrors.organizerEmail}
              disabled={loading || saving}
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControl fullWidth error={Boolean(validationErrors.statusId)}>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                label="Status"
                value={form.statusId}
                onChange={(event) =>
                  handleChange("statusId", event.target.value)
                }
                disabled={loading || saving}
              >
                {statuses.map((status) => (
                  <MenuItem key={status.id} value={String(status.id)}>
                    {status.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{validationErrors.statusId}</FormHelperText>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="category-select-label">Categoria</InputLabel>
              <Select
                labelId="category-select-label"
                label="Categoria"
                value={form.categoryId}
                onChange={(event) =>
                  handleChange("categoryId", event.target.value)
                }
                disabled={loading || saving}
              >
                <MenuItem value="">
                  <em>Sem categoria</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || saving}
        >
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
