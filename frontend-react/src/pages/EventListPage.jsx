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
import { deleteEvent, listEvents } from "../services/eventsApi";

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function EventListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("startDate");
  const [sortOrder, setSortOrder] = useState("ASC");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listEvents({
        page,
        size,
        search,
        sortBy,
        sortOrder,
      });

      setEvents(result.items || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, size, search, sortBy, sortOrder]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(`Excluir o evento "${title}"?`);
    if (!confirmed) return;

    try {
      await deleteEvent(id);
      await loadEvents();
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
            TeamMeet Planner
          </Typography>
          <Button color="inherit" component={RouterLink} to="/eventos/new">
            Novo evento
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Stack direction={{ xs: "column", md: "row" }} gap={2} sx={{ mb: 3 }}>
              <TextField
                label="Buscar por título"
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

            <Stack direction={{ xs: "column", md: "row" }} gap={2} sx={{ mb: 3 }}>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="sort-by-label">Ordenar por</InputLabel>
                <Select
                  labelId="sort-by-label"
                  label="Ordenar por"
                  value={sortBy}
                  onChange={(e) => {
                    setPage(1);
                    setSortBy(e.target.value);
                  }}
                >
                  <MenuItem value="startDate">Data de início</MenuItem>
                  <MenuItem value="createdAt">Data de criação</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel id="sort-order-label">Ordem</InputLabel>
                <Select
                  labelId="sort-order-label"
                  label="Ordem"
                  value={sortOrder}
                  onChange={(e) => {
                    setPage(1);
                    setSortOrder(e.target.value);
                  }}
                >
                  <MenuItem value="ASC">Ascendente</MenuItem>
                  <MenuItem value="DESC">Descendente</MenuItem>
                </Select>
              </FormControl>

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
                    <TableCell>Título</TableCell>
                    <TableCell>Início</TableCell>
                    <TableCell>Término</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Organizador</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6}>Nenhum evento encontrado.</TableCell>
                    </TableRow>
                  )}

                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{event.title}</TableCell>
                      <TableCell>{formatDate(event.startDate)}</TableCell>
                      <TableCell>{formatDate(event.endDate)}</TableCell>
                      <TableCell>{event.status}</TableCell>
                      <TableCell>{event.organizerEmail}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" justifyContent="flex-end" gap={1}>
                          <Button
                            size="small"
                            onClick={() => navigate(`/eventos/${event.id}`)}
                          >
                            Ver
                          </Button>
                          <Button
                            size="small"
                            onClick={() => navigate(`/eventos/${event.id}/edit`)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDelete(event.id, event.title)}
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
                Página {page} de {totalPages} - Total de {total} evento(s)
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
