import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../api/categoriesApi";

const NAME_MIN = 2;
const NAME_MAX = 60;

function validateName(name) {
  const trimmed = name.trim();

  if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX) {
    return `Nome deve ter entre ${NAME_MIN} e ${NAME_MAX} caracteres.`;
  }

  return "";
}

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");

  const newNameError = useMemo(() => validateName(newName), [newName]);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    setError("");

    try {
      const items = await listCategories();
      setCategories(items || []);
    } catch (loadError) {
      setError(loadError.message || "Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setError("");

    if (newNameError) {
      setError(newNameError);
      return;
    }

    setSaving(true);
    try {
      await createCategory(newName.trim());
      setNewName("");
      await loadCategories();
    } catch (saveError) {
      setError(saveError.message || "Erro ao criar categoria.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRename(categoryId, currentName) {
    const nextName = window.prompt("Novo nome da categoria:", currentName);
    if (nextName === null) {
      return;
    }

    const validationError = validateName(nextName);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateCategory(categoryId, nextName.trim());
      await loadCategories();
    } catch (renameError) {
      setError(renameError.message || "Erro ao renomear categoria.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(categoryId) {
    const confirmed = window.confirm(
      "Deseja realmente remover esta categoria?",
    );
    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await deleteCategory(categoryId);
      await loadCategories();
    } catch (deleteError) {
      setError(deleteError.message || "Erro ao remover categoria.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            TeamMeet Planner — Categorias
          </Typography>
          <Button
            component={RouterLink}
            to="/events"
            variant="outlined"
            color="inherit"
          >
            Ir para Eventos
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Card>
          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{ mb: 2 }}
            >
              <TextField
                label="Nova categoria"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                error={Boolean(newName) && Boolean(newNameError)}
                helperText={Boolean(newName) ? newNameError : " "}
                disabled={loading || saving}
                fullWidth
              />
              <Button
                variant="contained"
                onClick={handleCreate}
                disabled={loading || saving}
              >
                Criar
              </Button>
            </Stack>

            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhuma categoria cadastrada.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}

                {categories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>{category.name}</TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        justifyContent="flex-end"
                        spacing={1}
                      >
                        <Button
                          size="small"
                          onClick={() =>
                            handleRename(category.id, category.name)
                          }
                          disabled={saving}
                        >
                          Renomear
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDelete(category.id)}
                          disabled={saving}
                        >
                          Remover
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
