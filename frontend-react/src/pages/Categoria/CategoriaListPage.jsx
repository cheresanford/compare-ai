import { useCallback, useEffect, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { deleteEvent } from "../../services/eventsApi";
import {
  deleteCategory,
  listCategories,
} from "../../services/categories/categoriesApi";

export function CategoriaListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listCategories({
        page,
        size,
        search,
      });

      setCategories(result.items || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, size, search]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`Excluir a Categoria "${name}"?`);
    if (!confirmed) return;

    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage((old) => old - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage((old) => old + 1);
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            TeamMeet Planner - Categorias
          </Typography>
          <Button color="inherit" component={RouterLink} to="/events">
            Eventos
          </Button>
          <Button color="inherit" component={RouterLink} to="/categoria/new">
            Nova Categoria
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              gap={2}
              sx={{ mb: 3 }}
            >
              <TextField
                label="Buscar por nome"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                fullWidth
              />
              <Button variant="contained" onClick={handleSearch}>
                Buscar
              </Button>
            </Stack>

            <Stack
              direction={{ xs: "column", md: "row" }}
              gap={2}
              sx={{ mb: 3 }}
            >
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="page-size-label">Tamanho</InputLabel>
                <Select
                  labelId="page-size-label"
                  label="Tamanho"
                  value={size}
                  onChange={(e) => {
                    setPage(1);
                    setSize(Number(e.target.value));
                  }}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>

                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        Nenhum evento encontrado.
                      </TableCell>
                    </TableRow>
                  )}

                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.name}</TableCell>

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          justifyContent="flex-end"
                          gap={1}
                        >
                          <Button
                            size="small"
                            onClick={() =>
                              navigate(`/categoria/${category.id}`)
                            }
                          >
                            Ver
                          </Button>
                          <Button
                            size="small"
                            onClick={() =>
                              navigate(`/categorias/${category.id}/edit`)
                            }
                          >
                            Editar
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() =>
                              handleDelete(category.id, category.name)
                            }
                          >
                            Excluir
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <Stack
              direction={{ xs: "column", md: "row" }}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
              gap={2}
              sx={{ mt: 3 }}
            >
              <Typography variant="body2" color="text.secondary">
                Página {page} de {totalPages} - Total de {total} categoria(s)
              </Typography>

              <Stack direction="row" gap={1}>
                <Button onClick={handlePrevious} disabled={page <= 1}>
                  Anterior
                </Button>
                <Button onClick={handleNext} disabled={page >= totalPages}>
                  Próxima
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
