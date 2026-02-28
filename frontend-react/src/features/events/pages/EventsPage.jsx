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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { listCategories } from "../../categories/api/categoriesApi";
import { deleteEvent, listEvents } from "../api/eventsApi";
import { EventDetailsDialog } from "../components/EventDetailsDialog";
import { EventFormDialog } from "../components/EventFormDialog";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR");
}

export function EventsPage() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState("startDate");
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formState, setFormState] = useState({
    open: false,
    mode: "create",
    eventId: null,
  });
  const [detailsEventId, setDetailsEventId] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / size)),
    [total, size],
  );

  useEffect(() => {
    let isActive = true;

    async function loadEvents() {
      setLoading(true);
      setError("");

      try {
        const result = await listEvents({
          page: page + 1,
          size,
          search,
          categoryId: categoryId ? Number(categoryId) : undefined,
          sortBy,
          sortDirection,
        });

        if (!isActive) return;
        setEvents(result.items || []);
        setTotal(result.total || 0);
      } catch (loadError) {
        if (isActive) {
          setError(loadError.message || "Erro ao carregar lista de eventos.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      isActive = false;
    };
  }, [page, size, search, categoryId, sortBy, sortDirection, reloadToken]);

  useEffect(() => {
    let isActive = true;

    async function loadCategories() {
      try {
        const items = await listCategories();
        if (isActive) {
          setCategories(items || []);
        }
      } catch {
        if (isActive) {
          setCategories([]);
        }
      }
    }

    loadCategories();

    return () => {
      isActive = false;
    };
  }, []);

  function refreshList() {
    setReloadToken((current) => current + 1);
  }

  function handleOpenCreate() {
    setFormState({ open: true, mode: "create", eventId: null });
  }

  function handleOpenEdit(eventId) {
    setFormState({ open: true, mode: "edit", eventId });
  }

  function handleCloseForm() {
    setFormState((current) => ({ ...current, open: false }));
  }

  function handleSaved() {
    handleCloseForm();
    refreshList();
  }

  async function handleDeleteFromList(eventId) {
    const confirmed = window.confirm("Deseja realmente excluir este evento?");
    if (!confirmed) return;

    try {
      await deleteEvent(eventId);
      refreshList();
    } catch (deleteError) {
      setError(deleteError.message || "Erro ao excluir evento.");
    }
  }

  return (
    <Box>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            TeamMeet Planner — Eventos
          </Typography>
          <Button
            component={RouterLink}
            to="/categories"
            variant="outlined"
            color="inherit"
            sx={{ mr: 1 }}
          >
            Categorias
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleOpenCreate}
          >
            Novo Evento
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Card>
          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{ mb: 2 }}
            >
              <TextField
                label="Buscar por título"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                size="small"
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={() => {
                  setPage(0);
                  setSearch(searchInput.trim());
                }}
              >
                Buscar
              </Button>
              <Button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setPage(0);
                }}
              >
                Limpar
              </Button>
            </Stack>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{ mb: 2 }}
            >
              <FormControl size="small" sx={{ minWidth: 260 }}>
                <InputLabel id="category-filter-label">Categoria</InputLabel>
                <Select
                  labelId="category-filter-label"
                  label="Categoria"
                  value={categoryId}
                  onChange={(event) => {
                    setCategoryId(event.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">Todas as categorias</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="sort-by-label">Ordenar por</InputLabel>
                <Select
                  labelId="sort-by-label"
                  label="Ordenar por"
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(event.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="startDate">Data de início</MenuItem>
                  <MenuItem value="createdAt">Data de criação</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="sort-direction-label">Direção</InputLabel>
                <Select
                  labelId="sort-direction-label"
                  label="Direção"
                  value={sortDirection}
                  onChange={(event) => {
                    setSortDirection(event.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="asc">Ascendente</MenuItem>
                  <MenuItem value="desc">Descendente</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Início</TableCell>
                  <TableCell>Término</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Organizador</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhum evento encontrado.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}

                {events.map((eventItem) => (
                  <TableRow key={eventItem.id} hover>
                    <TableCell>{eventItem.title}</TableCell>
                    <TableCell>{formatDate(eventItem.startDate)}</TableCell>
                    <TableCell>{formatDate(eventItem.endDate)}</TableCell>
                    <TableCell>{eventItem.status}</TableCell>
                    <TableCell>
                      {eventItem.category?.name || "Sem categoria"}
                    </TableCell>
                    <TableCell>{eventItem.organizer?.name || "-"}</TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        justifyContent="flex-end"
                        spacing={1}
                      >
                        <Button
                          size="small"
                          onClick={() => setDetailsEventId(eventItem.id)}
                        >
                          Detalhes
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleOpenEdit(eventItem.id)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteFromList(eventItem.id)}
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
              count={total}
              page={Math.min(page, totalPages - 1)}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              rowsPerPage={size}
              onRowsPerPageChange={(event) => {
                setSize(Number(event.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 20, 50]}
            />
          </CardContent>
        </Card>
      </Container>

      <EventFormDialog
        open={formState.open}
        mode={formState.mode}
        eventId={formState.eventId}
        onClose={handleCloseForm}
        onSaved={handleSaved}
      />

      <EventDetailsDialog
        open={Boolean(detailsEventId)}
        eventId={detailsEventId}
        onClose={() => setDetailsEventId(null)}
        onEdit={(eventId) => {
          setDetailsEventId(null);
          handleOpenEdit(eventId);
        }}
        onDeleted={() => {
          setDetailsEventId(null);
          refreshList();
        }}
      />
    </Box>
  );
}
