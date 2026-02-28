import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  createEvent,
  getEvent,
  getEventOptions,
  updateEvent,
} from "../services/eventsApi";

function toDateTimeLocal(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function toIso(value) {
  if (!value) return "";
  return new Date(value).toISOString();
}

function validate(values) {
  const errors = {};
  if (!values.title || values.title.trim().length < 3 || values.title.trim().length > 100) {
    errors.title = "Título deve ter entre 3 e 100 caracteres.";
  }
  if (!values.organizerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.organizerEmail)) {
    errors.organizerEmail = "Informe um e-mail válido.";
  }
  if (!values.startDate || !values.endDate || toIso(values.endDate) <= toIso(values.startDate)) {
    errors.endDate = "Data de término deve ser maior que a data de início.";
  }
  if (!values.location || values.location.trim().length < 2) {
    errors.location = "Informe um local válido.";
  }
  if (!values.statusId) {
    errors.statusId = "Selecione um status.";
  }
  return errors;
}

export function EventFormPage({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = mode === "edit";

  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusOptions, setStatusOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [form, setForm] = useState({
    title: "",
    startDate: "",
    endDate: "",
    location: "",
    organizerEmail: "",
    organizerName: "",
    statusId: "",
    categoryId: "",
  });

  const validationErrors = useMemo(() => validate(form), [form]);

  useEffect(() => {
    const load = async () => {
      setError("");
      try {
        const options = await getEventOptions();
        setStatusOptions(options.statuses || []);
        setCategoryOptions(options.categories || []);

        if (editing && id) {
          const event = await getEvent(id);
          setForm({
            title: event.title || "",
            startDate: toDateTimeLocal(event.startDate),
            endDate: toDateTimeLocal(event.endDate),
            location: event.location || "",
            organizerEmail: event.organizerEmail || "",
            organizerName: event.organizerName || "",
            statusId: event.statusId || "",
            categoryId: event.category?.id ?? "",
          });
        } else if (!editing && options.statuses?.length) {
          setForm((current) => ({
            ...current,
            statusId: current.statusId || options.statuses[0].id,
          }));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [editing, id]);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validate(form);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setError("");

    try {
      const payload = {
        title: form.title.trim(),
        startDate: toIso(form.startDate),
        endDate: toIso(form.endDate),
        location: form.location.trim(),
        organizerEmail: form.organizerEmail.trim(),
        organizerName: form.organizerName.trim() || undefined,
        statusId: Number(form.statusId),
        categoryId: form.categoryId ? Number(form.categoryId) : null,
      };

      if (editing && id) {
        await updateEvent(id, payload);
      } else {
        await createEvent(payload);
      }

      navigate("/eventos");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            TeamMeet Planner
          </Typography>
          <Button color="inherit" component={RouterLink} to="/eventos">
            Voltar para lista
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 3 }}>
              {editing ? "Editar evento" : "Novo evento"}
            </Typography>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit}>
                <Stack gap={2}>
                  {error && <Alert severity="error">{error}</Alert>}

                  <TextField
                    required
                    label="Título"
                    value={form.title}
                    onChange={handleChange("title")}
                    error={Boolean(validationErrors.title)}
                    helperText={validationErrors.title}
                  />

                  <Stack direction={{ xs: "column", md: "row" }} gap={2}>
                    <TextField
                      required
                      type="datetime-local"
                      label="Data de início"
                      InputLabelProps={{ shrink: true }}
                      value={form.startDate}
                      onChange={handleChange("startDate")}
                      fullWidth
                    />
                    <TextField
                      required
                      type="datetime-local"
                      label="Data de término"
                      InputLabelProps={{ shrink: true }}
                      value={form.endDate}
                      onChange={handleChange("endDate")}
                      error={Boolean(validationErrors.endDate)}
                      helperText={validationErrors.endDate}
                      fullWidth
                    />
                  </Stack>

                  <TextField
                    required
                    label="Local"
                    value={form.location}
                    onChange={handleChange("location")}
                    error={Boolean(validationErrors.location)}
                    helperText={validationErrors.location}
                  />

                  <Stack direction={{ xs: "column", md: "row" }} gap={2}>
                    <TextField
                      required
                      type="email"
                      label="E-mail do organizador"
                      value={form.organizerEmail}
                      onChange={handleChange("organizerEmail")}
                      error={Boolean(validationErrors.organizerEmail)}
                      helperText={validationErrors.organizerEmail}
                      fullWidth
                    />
                    <TextField
                      label="Nome do organizador (opcional)"
                      value={form.organizerName}
                      onChange={handleChange("organizerName")}
                      fullWidth
                    />
                  </Stack>

                  <Stack direction={{ xs: "column", md: "row" }} gap={2}>
                    <FormControl fullWidth error={Boolean(validationErrors.statusId)}>
                      <InputLabel id="status-label">Status</InputLabel>
                      <Select
                        labelId="status-label"
                        label="Status"
                        value={form.statusId}
                        onChange={handleChange("statusId")}
                      >
                        {statusOptions.map((status) => (
                          <MenuItem key={status.id} value={status.id}>
                            {status.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
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
                  </Stack>

                  <Stack direction="row" justifyContent="flex-end" gap={1}>
                    <Button component={RouterLink} to="/eventos">
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={saving || Object.keys(validationErrors).length > 0}
                    >
                      {saving ? "Salvando..." : "Salvar"}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
