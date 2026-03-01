import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useEventsApi } from "../providers/EventsApiProvider";
import { toDisplayDateTime } from "../utils/date";

const DEFAULT_QUERY = {
  page: 1,
  size: 5,
  search: "",
  sortBy: "startDate",
  sortDir: "asc",
  categoryId: "",
};

export function EventsListPage() {
  const api = useEventsApi();
  const navigate = useNavigate();

  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedToDelete, setSelectedToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const canSearch = useMemo(() => query.search.trim().length > 0, [query.search]);
  const canClearFilters = useMemo(
    () => canSearch || Boolean(query.categoryId),
    [canSearch, query.categoryId],
  );

  const load = async (nextQuery = query) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.list(nextQuery);
      setData(response);
    } catch (err) {
      setError(err.message || "Falha ao carregar eventos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.page, query.size, query.sortBy, query.sortDir, query.categoryId]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const options = await api.options();
        setCategories(options?.categories || []);
      } catch {
        // Falha no carregamento das categorias não bloqueia a listagem de eventos.
      }
    };

    loadCategories();
  }, [api]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setQuery((prev) => ({ ...prev, page: 1 }));
    load({ ...query, page: 1 });
  };

  const handleClearSearch = () => {
    const nextQuery = { ...query, search: "", categoryId: "", page: 1 };
    setQuery(nextQuery);
    load(nextQuery);
  };

  const handleDelete = async () => {
    if (!selectedToDelete) {
      return;
    }

    setDeleting(true);

    try {
      await api.remove(selectedToDelete.id);
      setSelectedToDelete(null);
      await load();
    } catch (err) {
      setError(err.message || "Falha ao excluir evento");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Eventos</Typography>
        <Button variant="contained" component={RouterLink} to="/events/new">
          Novo evento
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Stack component="form" direction={{ xs: "column", md: "row" }} spacing={2} onSubmit={handleSearchSubmit}>
          <TextField
            label="Buscar por título"
            value={query.search}
            onChange={(event) => setQuery((prev) => ({ ...prev, search: event.target.value }))}
            fullWidth
          />

          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="sort-by-label">Ordenar por</InputLabel>
            <Select
              labelId="sort-by-label"
              label="Ordenar por"
              value={query.sortBy}
              onChange={(event) => setQuery((prev) => ({ ...prev, sortBy: event.target.value, page: 1 }))}
            >
              <MenuItem value="startDate">Data de início</MenuItem>
              <MenuItem value="createdAt">Data de criação</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel id="sort-dir-label">Direção</InputLabel>
            <Select
              labelId="sort-dir-label"
              label="Direção"
              value={query.sortDir}
              onChange={(event) => setQuery((prev) => ({ ...prev, sortDir: event.target.value, page: 1 }))}
            >
              <MenuItem value="asc">Crescente</MenuItem>
              <MenuItem value="desc">Decrescente</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel id="category-filter-label">Categoria</InputLabel>
            <Select
              labelId="category-filter-label"
              label="Categoria"
              value={query.categoryId || ""}
              onChange={(event) =>
                setQuery((prev) => ({
                  ...prev,
                  categoryId: event.target.value,
                  page: 1,
                }))
              }
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button type="submit" variant="contained">Buscar</Button>
          <Button type="button" variant="text" disabled={!canClearFilters} onClick={handleClearSearch}>
            Limpar
          </Button>
        </Stack>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Data início</TableCell>
              <TableCell>Data término</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Organizador</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                    <CircularProgress size={24} />
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {!loading && data?.items?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>Nenhum evento encontrado.</TableCell>
              </TableRow>
            )}

            {!loading &&
              data?.items?.map((event) => (
                <TableRow key={event.id} hover>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{toDisplayDateTime(event.startDate)}</TableCell>
                  <TableCell>{toDisplayDateTime(event.endDate)}</TableCell>
                  <TableCell>{event.category?.name || "Sem categoria"}</TableCell>
                  <TableCell>{event.status?.name || "-"}</TableCell>
                  <TableCell>{event.user?.email || "-"}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => navigate(`/events/${event.id}`)}>
                        Ver
                      </Button>
                      <Button size="small" onClick={() => navigate(`/events/${event.id}/edit`)}>
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => setSelectedToDelete(event)}
                      >
                        Excluir
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          rowsPerPageOptions={[5, 10, 20]}
          count={data?.totalItems || 0}
          rowsPerPage={query.size}
          page={(query.page || 1) - 1}
          onPageChange={(_, newPage) => setQuery((prev) => ({ ...prev, page: newPage + 1 }))}
          onRowsPerPageChange={(event) =>
            setQuery((prev) => ({ ...prev, size: Number(event.target.value), page: 1 }))
          }
        />
      </TableContainer>

      <Dialog open={Boolean(selectedToDelete)} onClose={() => setSelectedToDelete(null)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja excluir o evento "{selectedToDelete?.title}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedToDelete(null)} disabled={deleting}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" disabled={deleting}>
            {deleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

