import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { CategoriesApi } from "../services/categoriesApi";

const categoriesApi = new CategoriesApi();

function validateName(name) {
  const normalized = name.trim();

  if (normalized.length < 2 || normalized.length > 60) {
    return "Nome da categoria deve ter entre 2 e 60 caracteres";
  }

  return "";
}

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingNew, setSavingNew] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingError, setEditingError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const newNameError = useMemo(() => validateName(newCategoryName), [newCategoryName]);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await categoriesApi.list();
      setCategories(response);
    } catch (err) {
      setError(err.message || "Falha ao carregar categorias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();

    const validationError = validateName(newCategoryName);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSavingNew(true);
    setError("");

    try {
      await categoriesApi.create({ name: newCategoryName.trim() });
      setNewCategoryName("");
      await load();
    } catch (err) {
      setError(err.message || "Falha ao criar categoria");
    } finally {
      setSavingNew(false);
    }
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setEditingName(category.name);
    setEditingError("");
  };

  const handleSaveEdit = async () => {
    if (!editingCategory) {
      return;
    }

    const validationError = validateName(editingName);
    if (validationError) {
      setEditingError(validationError);
      return;
    }

    setSavingEdit(true);
    setEditingError("");

    try {
      await categoriesApi.update(editingCategory.id, { name: editingName.trim() });
      setEditingCategory(null);
      setEditingName("");
      await load();
    } catch (err) {
      setEditingError(err.message || "Falha ao renomear categoria");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await categoriesApi.remove(deletingCategory.id);
      setDeletingCategory(null);
      await load();
    } catch (err) {
      setError(err.message || "Falha ao remover categoria");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Categorias</Typography>

      <Paper sx={{ p: 2 }}>
        <Stack
          component="form"
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          onSubmit={handleCreate}
        >
          <TextField
            label="Nova categoria"
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
            fullWidth
            error={Boolean(newCategoryName) && Boolean(newNameError)}
            helperText={newCategoryName ? newNameError : ""}
          />
          <Button type="submit" variant="contained" disabled={savingNew || Boolean(newNameError)}>
            {savingNew ? "Salvando..." : "Adicionar"}
          </Button>
        </Stack>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={2}>Carregando categorias...</TableCell>
              </TableRow>
            )}

            {!loading && categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={2}>Nenhuma categoria cadastrada.</TableCell>
              </TableRow>
            )}

            {!loading &&
              categories.map((category) => (
                <TableRow key={category.id} hover>
                  <TableCell>{category.name}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => handleOpenEdit(category)}>
                        Renomear
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => setDeletingCategory(category)}
                      >
                        Remover
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={Boolean(editingCategory)} onClose={() => setEditingCategory(null)}>
        <DialogTitle>Renomear categoria</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Nome"
              value={editingName}
              onChange={(event) => setEditingName(event.target.value)}
              fullWidth
              autoFocus
              error={Boolean(editingError)}
              helperText={editingError}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingCategory(null)} disabled={savingEdit}>
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit} disabled={savingEdit}>
            {savingEdit ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deletingCategory)} onClose={() => setDeletingCategory(null)}>
        <DialogTitle>Remover categoria</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja remover a categoria "{deletingCategory?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingCategory(null)} disabled={deleting}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" disabled={deleting}>
            {deleting ? "Removendo..." : "Remover"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
