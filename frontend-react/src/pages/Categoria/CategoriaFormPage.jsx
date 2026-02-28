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
} from "../../services/eventsApi";
import {
  createCategory,
  getCategory,
  updateCategory,
} from "../../services/categories/categoriesApi";

function validate(values) {
  const errors = {};
  if (
    !values.name ||
    values.name.trim().length < 2 ||
    values.name.trim().length > 60
  ) {
    errors.name = "Nome deve ter entre 2 e 60 caracteres.";
  }

  return errors;
}

export function CategoriaFormPage({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = mode === "edit";

  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
  });

  const validationErrors = useMemo(() => validate(form), [form]);

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
        name: form.name.trim(),
      };

      if (editing && id) {
        await updateCategory(id, payload);
      } else {
        await createCategory(payload);
      }

      navigate("/categorias");
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
            TeamMeet Planner - Categorias
          </Typography>
          <Button color="inherit" component={RouterLink} to="/categorias">
            Voltar para lista
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 3 }}>
              {editing ? "Editar categoria" : "Novo categoria"}
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack gap={2}>
                {error && <Alert severity="error">{error}</Alert>}

                <TextField
                  required
                  label="Nome"
                  value={form.title}
                  onChange={handleChange("name")}
                  error={Boolean(validationErrors.name)}
                  helperText={validationErrors.name}
                />

                <Stack direction="row" justifyContent="flex-end" gap={1}>
                  <Button component={RouterLink} to="/categorias">
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={
                      saving || Object.keys(validationErrors).length > 0
                    }
                  >
                    {saving ? "Salvando..." : "Salvar"}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
