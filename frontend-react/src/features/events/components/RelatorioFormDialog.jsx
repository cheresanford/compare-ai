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
  listRelatorio,
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
  startDate: "",
  endDate: "",
};

export function RelatorioFormDialog({ open, mode, onClose }) {
  const isEdit = mode === "create";

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const validationErrors = useMemo(() => {
    const errors = {};


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
      await listRelatorio(form)

    } catch (saveError) {
      setError(saveError.message || "Erro ao salvar evento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? "Relatório de Items" : "Relatório de Items"}</DialogTitle>

      <DialogContent dividers>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Stack spacing={2}>


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
